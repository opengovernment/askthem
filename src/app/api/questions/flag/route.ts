import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await req.json();
  const { questionId, reason } = body;

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "Question ID is required." }, { status: 400 });
  }

  if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
    return NextResponse.json(
      { error: "Please provide a reason (at least 5 characters)." },
      { status: 400 },
    );
  }

  if (reason.trim().length > 500) {
    return NextResponse.json(
      { error: "Reason must be 500 characters or fewer." },
      { status: 400 },
    );
  }

  // Verify the question exists
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, authorId: true },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  // Don't allow authors to flag their own questions
  if (question.authorId === user.id) {
    return NextResponse.json(
      { error: "You cannot flag your own question." },
      { status: 400 },
    );
  }

  // Upsert: one flag per user per question (update reason if already flagged)
  const flag = await prisma.questionFlag.upsert({
    where: {
      userId_questionId: { userId: user.id, questionId },
    },
    create: {
      userId: user.id,
      questionId,
      reason: reason.trim(),
    },
    update: {
      reason: reason.trim(),
      status: "pending",
    },
  });

  return NextResponse.json({ id: flag.id });
}
