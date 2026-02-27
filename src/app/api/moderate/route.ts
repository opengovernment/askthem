import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/session";
import { tagSignersInAN } from "@/lib/action-network";
import { sendQuestionDelivered } from "@/lib/email";

export async function POST(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { questionId, questionIds, action } = body as {
    questionId?: string;
    questionIds?: string[];
    action?: "publish" | "reject" | "deliver" | "hide" | "delete";
  };

  const validActions = ["publish", "reject", "deliver", "hide", "delete"] as const;
  if (!action || !validActions.includes(action)) {
    return NextResponse.json(
      { error: `action must be one of: ${validActions.join(", ")}` },
      { status: 400 },
    );
  }

  // Support bulk operations via questionIds array, or single via questionId
  const ids: string[] = questionIds && Array.isArray(questionIds)
    ? questionIds
    : questionId && typeof questionId === "string"
      ? [questionId]
      : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "questionId or questionIds is required" }, { status: 400 });
  }

  // Bulk hide: set status to "rejected" (hidden from public)
  if (action === "hide") {
    const questions = await prisma.question.findMany({ where: { id: { in: ids } } });
    const validIds = questions.filter((q) => q.status !== "rejected").map((q) => q.id);
    if (validIds.length === 0) {
      return NextResponse.json({ error: "No eligible questions to hide" }, { status: 422 });
    }
    await prisma.question.updateMany({
      where: { id: { in: validIds } },
      data: { status: "rejected" },
    });
    return NextResponse.json({ hidden: validIds.length });
  }

  // Bulk delete: permanently remove questions and their relations
  if (action === "delete") {
    const questions = await prisma.question.findMany({ where: { id: { in: ids } } });
    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions found" }, { status: 404 });
    }
    await prisma.$transaction(async (tx) => {
      // Delete answers (not cascade) and detach email events before removing questions
      await tx.answer.deleteMany({ where: { questionId: { in: ids } } });
      await tx.emailEvent.updateMany({
        where: { questionId: { in: ids } },
        data: { questionId: null },
      });
      await tx.question.deleteMany({ where: { id: { in: ids } } });
    });
    return NextResponse.json({ deleted: questions.length });
  }

  // Single-question actions below (publish, reject, deliver)
  if (ids.length !== 1) {
    return NextResponse.json(
      { error: `Bulk operations are only supported for hide and delete` },
      { status: 400 },
    );
  }

  const singleId = ids[0];
  const question = await prisma.question.findUnique({ where: { id: singleId } });
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
    data.deliveredVia = "email";
    data.deliveredBy = moderator.id;
  }

  const updated = await prisma.question.update({
    where: { id: singleId },
    data,
    include: { official: true },
  });

  // On delivery: notify all signers via Mailgun and tag them in Action Network
  if (action === "deliver") {
    const upvotes = await prisma.upvote.findMany({
      where: { questionId: singleId },
      include: { user: true },
    });

    // Include the original author
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
    const signatureCount = question.upvoteCount + 1; // upvotes + author

    // Fire-and-forget: send delivery notifications
    for (const signer of signers) {
      sendQuestionDelivered(signer.email, {
        questionId: singleId,
        questionText: question.text,
        officialName: updated.official.name,
        officialTitle: updated.official.title,
        signatureCount,
      }).then((messageId) => {
        if (messageId) {
          prisma.emailEvent.create({
            data: {
              userId: signer.id,
              questionId: singleId,
              emailType: "question_delivered",
              subject: `Your question was delivered to ${updated.official.name}`,
              messageId,
            },
          }).catch(() => {});
        }
      }).catch(() => {});
    }

    // Tag signers in Action Network for ladder triggering
    const signerEmails = signers.map((s) => s.email);
    tagSignersInAN(signerEmails, `delivered:${singleId}`).catch(() => {});
  }

  return NextResponse.json({ id: updated.id, status: updated.status });
}
