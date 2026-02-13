import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/answers — post an official's answer to a delivered question
// In production, require moderator session. Demo mode: unguarded.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { questionId, responseText, responseVideoUrl } = body as {
    questionId?: string;
    responseText?: string;
    responseVideoUrl?: string;
  };

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  if (!responseText && !responseVideoUrl) {
    return NextResponse.json(
      { error: "At least one of responseText or responseVideoUrl is required" },
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
        respondedAt: new Date(),
        postedBy: "mod-sarah", // In production, use session user
      },
    }),
    prisma.question.update({
      where: { id: questionId },
      data: { status: "answered" },
    }),
  ]);

  return NextResponse.json({ id: answer.id, questionId: answer.questionId }, { status: 201 });
}
