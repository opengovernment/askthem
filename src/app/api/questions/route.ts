import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POLICY_AREAS, US_STATES } from "@/lib/types";
import { requireAuth } from "@/lib/session";
import { syncPersonToAN } from "@/lib/action-network";
import { sendQuestionSubmitted } from "@/lib/email";
import { detectPlatform } from "@/lib/media";
import { extractKeywords } from "@/lib/keywords";
import { checkOfficialConduct } from "@/lib/moderation";

// Basic content safety check — returns a rejection reason or null if OK.
function moderateContent(text: string): string | null {
  if (text.length < 10) return "Question is too short (minimum 10 characters).";
  if (text.length > 500) return "Question is too long (maximum 500 characters).";

  // Block obvious profanity / slurs
  const blocked = /\b(fuck|shit|damn|bitch|ass(?:hole)?|cunt|dick|bastard)\b/i;
  if (blocked.test(text)) {
    return "Your question contains language that violates our community guidelines. Please rephrase.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required to ask a question" }, { status: 401 });
  }

  if (!user.isAddressVerified) {
    return NextResponse.json(
      { error: "Please verify your address before asking a question.", addressRequired: true },
      { status: 403 },
    );
  }

  // Enforce read-only mode (moderators and admins are exempt)
  if (user.role !== "moderator" && user.role !== "admin") {
    const readOnlyRow = await prisma.siteSetting.findUnique({ where: { key: "readOnlyMode" } });
    if (readOnlyRow?.value === "true") {
      return NextResponse.json(
        { error: "The site is currently in read-only mode. New questions cannot be submitted at this time. Please check back later." },
        { status: 503 },
      );
    }
  }

  // Enforce daily question limit (moderators and admins are exempt)
  if (user.role !== "moderator" && user.role !== "admin") {
    const limitRow = await prisma.siteSetting.findUnique({ where: { key: "dailyQuestionLimit" } });
    const dailyLimit = limitRow ? Number(limitRow.value) : 5;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.question.count({
      where: { authorId: user.id, createdAt: { gte: startOfDay } },
    });

    if (todayCount >= dailyLimit) {
      return NextResponse.json(
        {
          error: `You've reached the daily limit of ${dailyLimit} question${dailyLimit === 1 ? "" : "s"}. In order to get responses to your questions, the limit per day has been reached. Please try again tomorrow.`,
          dailyLimitReached: true,
        },
        { status: 429 },
      );
    }
  }

  const body = await request.json();
  const { officialId, text, tags, groupId, videoUrl, eventId } = body as {
    officialId?: string;
    text?: string;
    tags?: string[];
    groupId?: string;
    videoUrl?: string;
    eventId?: string;
  };

  // Validate required fields
  if (!officialId || typeof officialId !== "string") {
    return NextResponse.json({ error: "officialId is required" }, { status: 400 });
  }
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > 3) {
    return NextResponse.json({ error: "1-3 policy area tags are required" }, { status: 400 });
  }

  // Validate tags are real policy areas
  const validTags = tags.every((t) => (POLICY_AREAS as readonly string[]).includes(t));
  if (!validTags) {
    return NextResponse.json({ error: "Invalid policy area tag" }, { status: 400 });
  }

  // Validate official exists
  const official = await prisma.official.findUnique({ where: { id: officialId } });
  if (!official) {
    return NextResponse.json({ error: "Official not found" }, { status: 404 });
  }

  // During beta, only verified Groups can ask questions to non-Congress federal officials
  // (cabinet members, executive branch). Congress members (senate/house) are unrestricted.
  const isCongressMember = official.chamber === "senate" || official.chamber === "house";
  const isFederalExecutive = !isCongressMember && !US_STATES[official.state];
  if (isFederalExecutive && !groupId) {
    return NextResponse.json(
      { error: "During the public beta, only Groups can ask questions to federal executive officials." },
      { status: 403 },
    );
  }

  // Content moderation
  const rejection = moderateContent(text.trim());
  if (rejection) {
    return NextResponse.json({ error: rejection }, { status: 422 });
  }

  // AI-powered Official Conduct moderation check
  const aiModeration = await checkOfficialConduct(text.trim());

  // Log the moderation check
  prisma.moderationLog
    .create({
      data: {
        userId: user.id,
        questionText: text.trim(),
        result: aiModeration.result,
        reason: aiModeration.reason,
        suggestion: aiModeration.suggestion,
      },
    })
    .catch((err: unknown) => {
      console.error("Failed to log moderation check:", err);
    });

  // Block submission if the question fails Official Conduct check
  if (aiModeration.result === "fail") {
    return NextResponse.json(
      {
        error: "Your question does not appear to relate to Official Conduct (public duties, voting record, policy positions, or use of public resources). Please revise your question.",
        moderationFailed: true,
        moderationReason: aiModeration.reason,
        moderationSuggestion: aiModeration.suggestion,
      },
      { status: 422 },
    );
  }

  // Validate videoUrl if provided — must be a recognized social media platform
  let validatedVideoUrl: string | undefined;
  if (videoUrl && typeof videoUrl === "string" && videoUrl.trim()) {
    try {
      new URL(videoUrl.trim());
    } catch {
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
    }
    const { platform } = detectPlatform(videoUrl.trim());
    if (!platform) {
      return NextResponse.json(
        { error: "Video URL must be from YouTube, TikTok, Instagram, X/Twitter, Facebook, or Bluesky" },
        { status: 422 },
      );
    }
    validatedVideoUrl = videoUrl.trim();
  }

  // If groupId is provided, validate that the user is the group admin and the group is verified
  if (groupId) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    if (!group.isVerified) {
      return NextResponse.json({ error: "Group is not verified" }, { status: 403 });
    }
    if (group.adminUserId !== user.id) {
      return NextResponse.json({ error: "You are not the admin of this group" }, { status: 403 });
    }
  }

  // Validate eventId if provided — event must exist and be accepting questions
  let validatedEventId: string | undefined;
  if (eventId && typeof eventId === "string") {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (!event.acceptingQuestions) {
      return NextResponse.json({ error: "This event is no longer accepting questions." }, { status: 403 });
    }
    if (event.officialId !== officialId) {
      return NextResponse.json({ error: "Official does not match the event." }, { status: 400 });
    }
    validatedEventId = eventId;
  }

  // Build district tag from official info
  const districtTag = official.district
    ? `${official.state}-${official.district}`
    : `${official.state}-${official.chamber}`;

  const extractedKeywords = extractKeywords(text.trim());

  const question = await prisma.question.create({
    data: {
      text: text.trim(),
      authorId: user.id,
      officialId,
      districtTag,
      status: "pending_review",
      videoUrl: validatedVideoUrl,
      aiModerationStatus: aiModeration.result,
      aiModerationReason: aiModeration.reason,
      aiModeratedAt: new Date(),
      groupId: groupId || undefined,
      eventId: validatedEventId,
      categoryTags: {
        create: tags.map((tag) => ({ tag })),
      },
      keywords: {
        create: extractedKeywords.map((keyword) => ({ keyword })),
      },
    },
    include: {
      categoryTags: true,
      keywords: true,
      official: true,
      author: true,
    },
  });

  // Fire-and-forget: sync author to Action Network and send confirmation email.
  syncPersonToAN({
    email: user.email,
    name: user.name,
    state: user.state,
    city: user.city,
    zip: user.zip,
    districtTag,
  }).then((anId) => {
    if (anId && !user.actionNetworkId) {
      prisma.user.update({ where: { id: user.id }, data: { actionNetworkId: anId } }).catch(() => {});
    }
  }).catch(() => {});

  sendQuestionSubmitted(user.email, {
    questionId: question.id,
    questionText: question.text,
    officialName: question.official.name,
    officialTitle: question.official.title,
  }).then((messageId) => {
    if (messageId) {
      prisma.emailEvent.create({
        data: {
          userId: user.id,
          questionId: question.id,
          emailType: "question_submitted",
          subject: `Your question to ${question.official.name} was submitted`,
          messageId,
        },
      }).catch(() => {});
    }
  }).catch(() => {});

  return NextResponse.json({ id: question.id, status: question.status }, { status: 201 });
}
