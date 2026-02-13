import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tagSignersInAN } from "@/lib/action-network";
import { sendQuestionAnswered } from "@/lib/email";

import { requireModerator } from "@/lib/session";

// POST /api/answers — post an official's answer to a delivered question
export async function POST(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { questionId, responseText, responseVideoUrl, sourceUrl } = body as {
    questionId?: string;
    responseText?: string;
    responseVideoUrl?: string;
    sourceUrl?: string;
  };

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  if (!responseText && !responseVideoUrl && !sourceUrl) {
    return NextResponse.json(
      { error: "At least one of responseText, responseVideoUrl, or sourceUrl is required" },
      { status: 400 },
    );
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

  // Create the answer and update question status in a transaction
  const [answer] = await prisma.$transaction([
    prisma.answer.create({
      data: {
        questionId,
        responseText: responseText ?? null,
        responseVideoUrl: responseVideoUrl ?? null,
        sourceUrl: sourceUrl ?? null,
        respondedAt: new Date(),
        postedBy: moderator.id,
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
    const answerPreview = (responseText ?? "Video response available").slice(0, 200);

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
