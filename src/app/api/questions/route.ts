import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POLICY_AREAS } from "@/lib/types";
import { requireAuth } from "@/lib/session";
import { syncPersonToAN } from "@/lib/action-network";
import { sendQuestionSubmitted } from "@/lib/email";

// Basic content safety check — returns a rejection reason or null if OK.
// TODO: Replace with AI-powered moderation (e.g. Claude API) in production.
function moderateContent(text: string): string | null {
  if (text.length < 10) return "Question is too short (minimum 10 characters).";
  if (text.length > 500) return "Question is too long (maximum 500 characters).";

  // Block obvious profanity / slurs (very basic list — use a real filter in production)
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

  const body = await request.json();
  const { officialId, text, tags, groupId } = body as {
    officialId?: string;
    text?: string;
    tags?: string[];
    groupId?: string;
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

  // Content moderation
  const rejection = moderateContent(text.trim());
  if (rejection) {
    return NextResponse.json({ error: rejection }, { status: 422 });
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

  // Build district tag from official info
  const districtTag = official.district
    ? `${official.state}-${official.district}`
    : `${official.state}-${official.chamber}`;

  const question = await prisma.question.create({
    data: {
      text: text.trim(),
      authorId: user.id,
      officialId,
      districtTag,
      status: "pending_review",
      groupId: groupId || undefined,
      categoryTags: {
        create: tags.map((tag) => ({ tag })),
      },
    },
    include: {
      categoryTags: true,
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
