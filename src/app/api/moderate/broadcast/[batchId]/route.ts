import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/session";
import { extractKeywords } from "@/lib/keywords";

interface RouteContext {
  params: Promise<{ batchId: string }>;
}

/**
 * GET /api/moderate/broadcast/[batchId]
 *
 * View all questions in a broadcast batch.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const { batchId } = await context.params;

  const questions = await prisma.question.findMany({
    where: { batchId },
    include: {
      official: true,
      categoryTags: true,
      keywords: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (questions.length === 0) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  return NextResponse.json({ batchId, questions });
}

/**
 * PATCH /api/moderate/broadcast/[batchId]
 *
 * Edit the question text for all questions in a batch.
 * Only updates questions that haven't been delivered or answered yet.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const { batchId } = await context.params;
  const body = await request.json();
  const { text } = body as { text?: string };

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Question text must be at least 10 characters" }, { status: 400 });
  }
  if (text.trim().length > 500) {
    return NextResponse.json({ error: "Question text must be at most 500 characters" }, { status: 400 });
  }

  const trimmedText = text.trim();
  const newKeywords = extractKeywords(trimmedText);

  // Find editable questions in this batch (not yet delivered or answered)
  const editableQuestions = await prisma.question.findMany({
    where: {
      batchId,
      status: { in: ["published", "pending_review"] },
    },
    select: { id: true },
  });

  if (editableQuestions.length === 0) {
    return NextResponse.json(
      { error: "No editable questions in this batch (all have been delivered or answered)" },
      { status: 400 },
    );
  }

  const editableIds = editableQuestions.map((q) => q.id);

  // Update text and re-extract keywords in a transaction
  await prisma.$transaction([
    // Update text for all editable questions
    prisma.question.updateMany({
      where: { id: { in: editableIds } },
      data: { text: trimmedText },
    }),
    // Delete old keywords for editable questions
    prisma.questionKeyword.deleteMany({
      where: { questionId: { in: editableIds } },
    }),
    // Re-create keywords for each question
    ...editableIds.flatMap((questionId) =>
      newKeywords.map((keyword) =>
        prisma.questionKeyword.create({
          data: { questionId, keyword },
        }),
      ),
    ),
  ]);

  return NextResponse.json({
    updated: editableIds.length,
    totalInBatch: editableQuestions.length,
  });
}
