import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDeliveryNudge } from "@/lib/email";

/**
 * Cron endpoint: sends nudge emails for delivered-but-unanswered questions.
 *
 * Designed to be called weekly by a cron scheduler (Vercel Cron, external
 * scheduler, etc.). Secured via a CRON_SECRET bearer token.
 *
 * For each delivered question that hasn't been answered:
 *   - Skips if a nudge was already sent in the last 7 days
 *   - Sends a "still waiting" email to every signer
 *   - Logs each send in EmailEvent for audit / dedup
 *
 * When Action Network is integrated, the AN tags (delivered:{questionId})
 * can trigger ladder-based re-engagement instead. This endpoint serves as
 * the built-in fallback.
 */

const NUDGE_INTERVAL_DAYS = 7;

export async function POST(request: NextRequest) {
  // Authenticate via bearer token
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const nudgeCutoff = new Date(now.getTime() - NUDGE_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

  // Find all delivered questions without an answer
  const deliveredQuestions = await prisma.question.findMany({
    where: {
      status: "delivered",
      answer: null,
      deliveredAt: { not: null },
    },
    include: {
      official: true,
      upvotes: {
        include: { user: { select: { id: true, email: true } } },
      },
    },
  });

  let nudgesSent = 0;
  let questionsNudged = 0;

  for (const question of deliveredQuestions) {
    // Check if a nudge was sent for this question within the interval
    const recentNudge = await prisma.emailEvent.findFirst({
      where: {
        questionId: question.id,
        emailType: "delivery_nudge",
        sentAt: { gte: nudgeCutoff },
      },
    });

    if (recentNudge) continue;

    const daysSinceDelivery = Math.floor(
      (now.getTime() - (question.deliveredAt?.getTime() ?? now.getTime())) /
        (24 * 60 * 60 * 1000),
    );

    // Send nudge to each signer
    for (const upvote of question.upvotes) {
      const messageId = await sendDeliveryNudge(upvote.user.email, {
        questionId: question.id,
        questionText: question.text,
        officialName: question.official.name,
        officialTitle: question.official.title,
        signatureCount: question.upvoteCount,
        daysSinceDelivery,
      });

      if (messageId) {
        await prisma.emailEvent.create({
          data: {
            userId: upvote.user.id,
            questionId: question.id,
            emailType: "delivery_nudge",
            subject: `Still waiting: your question to ${question.official.name} needs attention`,
            messageId,
          },
        });
        nudgesSent++;
      }
    }

    questionsNudged++;
  }

  return NextResponse.json({
    ok: true,
    questionsChecked: deliveredQuestions.length,
    questionsNudged,
    nudgesSent,
  });
}
