import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("questionId");

  if (!questionId) {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const comments = await prisma.signerComment.findMany({
    where: { questionId },
    include: {
      user: { select: { id: true, name: true, isProfilePublic: true, city: true, state: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  const { questionId, text } = body as { questionId?: string; text?: string };

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const trimmed = (text || "").trim();
  if (!trimmed || trimmed.length > 280) {
    return NextResponse.json(
      { error: "Comment must be between 1 and 280 characters" },
      { status: 400 },
    );
  }

  // User must have signed the question to leave a comment
  const upvote = await prisma.upvote.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  });
  if (!upvote) {
    return NextResponse.json(
      { error: "You must sign this question before leaving a comment" },
      { status: 403 },
    );
  }

  // Upsert: one comment per user per question
  const comment = await prisma.signerComment.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    update: { text: trimmed },
    create: { userId: user.id, questionId, text: trimmed },
    include: {
      user: { select: { id: true, name: true, isProfilePublic: true, city: true, state: true } },
    },
  });

  return NextResponse.json(comment);
}
