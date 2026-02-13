import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tagSignersInAN } from "@/lib/action-network";
import { sendQuestionDelivered } from "@/lib/email";

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
    include: { official: true },
  });

  // On delivery: notify all signers via Mailgun and tag them in Action Network
  if (action === "deliver") {
    const upvotes = await prisma.upvote.findMany({
      where: { questionId },
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
        questionId,
        questionText: question.text,
        officialName: updated.official.name,
        officialTitle: updated.official.title,
        signatureCount,
      }).then((messageId) => {
        if (messageId) {
          prisma.emailEvent.create({
            data: {
              userId: signer.id,
              questionId,
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
    tagSignersInAN(signerEmails, `delivered:${questionId}`).catch(() => {});
  }

  return NextResponse.json({ id: updated.id, status: updated.status });
}
