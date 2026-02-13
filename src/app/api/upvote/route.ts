import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { recordSignatureInAN } from "@/lib/action-network";
import { sendQuestionSigned } from "@/lib/email";

// Get or create a temporary anonymous user for demo purposes.
// In production this would use real auth (OAuth session).
async function getOrCreateAnonUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("anon_user_id")?.value;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  // Create a new anonymous user
  const anonId = randomUUID().slice(0, 8);
  const user = await prisma.user.create({
    data: {
      email: `anon-${anonId}@demo.askthem.local`,
      name: `Anonymous ${anonId}`,
    },
  });

  cookieStore.set("anon_user_id", user.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return user;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const questionId = body.questionId;

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const user = await getOrCreateAnonUser();

  // Check if user already upvoted — if so, remove it (toggle)
  const existing = await prisma.upvote.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.upvote.delete({ where: { id: existing.id } }),
      prisma.question.update({
        where: { id: questionId },
        data: { upvoteCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ upvoted: false, upvoteCount: question.upvoteCount - 1 });
  }

  await prisma.$transaction([
    prisma.upvote.create({ data: { userId: user.id, questionId } }),
    prisma.question.update({
      where: { id: questionId },
      data: { upvoteCount: { increment: 1 } },
    }),
  ]);

  // Fire-and-forget: sync signature to Action Network and send confirmation.
  const isRealUser = !user.email.endsWith("@demo.askthem.local");
  if (isRealUser) {
    const fullQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { official: true, categoryTags: true },
    });

    if (fullQuestion) {
      const tags = fullQuestion.categoryTags.map((t) => t.tag);
      recordSignatureInAN(user.email, questionId, tags).catch(() => {});

      sendQuestionSigned(user.email, {
        questionId,
        questionText: fullQuestion.text,
        officialName: fullQuestion.official.name,
        officialTitle: fullQuestion.official.title,
      }).then((messageId) => {
        if (messageId) {
          prisma.emailEvent.create({
            data: {
              userId: user.id,
              questionId,
              emailType: "question_signed",
              subject: `You signed a question to ${fullQuestion.official.name}`,
              messageId,
            },
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }

  return NextResponse.json({ upvoted: true, upvoteCount: question.upvoteCount + 1 });
}
