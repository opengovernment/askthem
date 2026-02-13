import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In production, verify the user has moderator/admin role via session.
// For now, this endpoint is unguarded (demo mode).

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { questionId, action } = body as {
    questionId?: string;
    action?: "publish" | "reject" | "deliver";
  };

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const validActions = ["publish", "reject", "deliver"] as const;
  if (!action || !validActions.includes(action)) {
    return NextResponse.json(
      { error: `action must be one of: ${validActions.join(", ")}` },
      { status: 400 },
    );
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // State machine for question status
  const transitions: Record<string, string[]> = {
    publish: ["pending_review"],
    reject: ["pending_review"],
    deliver: ["published"],
  };

  if (!transitions[action].includes(question.status)) {
    return NextResponse.json(
      { error: `Cannot ${action} a question with status "${question.status}"` },
      { status: 422 },
    );
  }

  const newStatus =
    action === "publish"
      ? "published"
      : action === "reject"
        ? "rejected"
        : "delivered";

  const data: Record<string, unknown> = { status: newStatus };
  if (action === "deliver") {
    data.deliveredAt = new Date();
    data.deliveredVia = "email"; // default; can be changed later
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data,
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
