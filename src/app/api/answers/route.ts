import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tagSignersInAN } from "@/lib/action-network";
import { sendQuestionAnswered } from "@/lib/email";

import { requireModerator } from "@/lib/session";

interface MediaInput {
  mediaType: "social_embed" | "video_upload" | "audio_upload";
  platform?: string | null;
  url: string;
  originalFilename?: string;
  mimeType?: string;
  caption?: string;
  sortOrder?: number;
}

// POST /api/answers — post an official's answer to a delivered question
export async function POST(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { questionId, responseText, responseVideoUrl, sourceUrl, media } = body as {
    questionId?: string;
    responseText?: string;
    responseVideoUrl?: string;
    sourceUrl?: string;
    media?: MediaInput[];
  };

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const hasLegacyContent = responseText || responseVideoUrl || sourceUrl;
  const hasMedia = Array.isArray(media) && media.length > 0;

  if (!hasLegacyContent && !hasMedia) {
    return NextResponse.json(
      { error: "At least one of responseText, media items, or a source URL is required" },
      { status: 400 },
    );
  }

  // Validate media items
  if (hasMedia) {
    for (const item of media!) {
      if (!item.url || typeof item.url !== "string") {
        return NextResponse.json({ error: "Each media item must have a URL" }, { status: 400 });
      }
      const validTypes = ["social_embed", "video_upload", "audio_upload"];
      if (!validTypes.includes(item.mediaType)) {
        return NextResponse.json({ error: `Invalid media type: ${item.mediaType}` }, { status: 400 });
      }
    }
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { answer: true },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (question.answer) {
    return NextResponse.json({ error: "This question already has an answer" }, { status: 422 });
  }

  if (question.status !== "delivered") {
    return NextResponse.json(
      { error: "Only delivered questions can be answered" },
      { status: 422 },
    );
  }

  // Create the answer, media items, and update question status in a transaction
  const [answer] = await prisma.$transaction([
    prisma.answer.create({
      data: {
        questionId,
        responseText: responseText ?? null,
        responseVideoUrl: responseVideoUrl ?? null,
        sourceUrl: sourceUrl ?? null,
        respondedAt: new Date(),
        postedBy: moderator.id,
        ...(hasMedia
          ? {
              media: {
                create: media!.map((item, i) => ({
                  mediaType: item.mediaType,
                  platform: item.platform ?? null,
                  url: item.url,
                  originalFilename: item.originalFilename ?? null,
                  mimeType: item.mimeType ?? null,
                  caption: item.caption ?? null,
                  sortOrder: item.sortOrder ?? i,
                })),
              },
            }
          : {}),
      },
    }),
    prisma.question.update({
      where: { id: questionId },
      data: { status: "answered" },
    }),
  ]);

  // Notify all signers that the official answered
  const fullQuestion = await prisma.question.findUnique({
    where: { id: questionId },
    include: { official: true },
  });

  if (fullQuestion) {
    const upvotes = await prisma.upvote.findMany({
      where: { questionId },
      include: { user: true },
    });

    const author = await prisma.user.findUnique({ where: { id: question.authorId } });
    const signerMap = new Map<string, { id: string; email: string }>();

    if (author && !author.email.endsWith("@demo.askthem.local")) {
      signerMap.set(author.id, { id: author.id, email: author.email });
    }
    for (const uv of upvotes) {
      if (!uv.user.email.endsWith("@demo.askthem.local")) {
        signerMap.set(uv.user.id, { id: uv.user.id, email: uv.user.email });
      }
    }

    const signers = Array.from(signerMap.values());
    const answerPreview = (responseText ?? "Media response available — view online").slice(0, 200);

    // Fire-and-forget: send answer notifications
    for (const signer of signers) {
      sendQuestionAnswered(signer.email, {
        questionId,
        questionText: fullQuestion.text,
        officialName: fullQuestion.official.name,
        officialTitle: fullQuestion.official.title,
        answerPreview,
      }).then((messageId) => {
        if (messageId) {
          prisma.emailEvent.create({
            data: {
              userId: signer.id,
              questionId,
              emailType: "question_answered",
              subject: `${fullQuestion.official.name} answered your question!`,
              messageId,
            },
          }).catch(() => {});
        }
      }).catch(() => {});
    }

    // Tag signers in Action Network
    const signerEmails = signers.map((s) => s.email);
    tagSignersInAN(signerEmails, `answered:${questionId}`).catch(() => {});
  }

  return NextResponse.json({ id: answer.id, questionId: answer.questionId }, { status: 201 });
}
