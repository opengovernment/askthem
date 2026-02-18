import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { recordSignatureInAN } from "@/lib/action-network";
import { sendQuestionSigned } from "@/lib/email";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required to upvote" }, { status: 401 });
  }

  if (!user.isAddressVerified) {
    return NextResponse.json(
      { error: "Please verify your address before signing a question.", addressRequired: true },
      { status: 403 },
    );
  }

  const body = await request.json();
  const questionId = body.questionId;

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

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
    return NextResponse.json({
      upvoted: false,
      upvoteCount: question.upvoteCount - 1,
      isConstituent: existing.isConstituent,
    });
  }

  // Determine if the user is a verified constituent of this question's official
  const isConstituent = !!(await prisma.userDistrict.findUnique({
    where: { userId_officialId: { userId: user.id, officialId: question.officialId } },
  }));

  // Block non-constituents: they can only sign questions to their own officials
  if (!isConstituent) {
    const userDistricts = await prisma.userDistrict.findMany({
      where: { userId: user.id },
      include: { official: { select: { id: true, name: true, title: true, state: true, district: true } } },
    });
    return NextResponse.json(
      {
        error: "You can only sign questions to your own elected officials.",
        notConstituent: true,
        yourOfficials: userDistricts.map((d) => ({
          id: d.official.id,
          name: d.official.name,
          title: d.official.title,
          state: d.official.state,
          district: d.official.district,
        })),
      },
      { status: 403 },
    );
  }

  await prisma.$transaction([
    prisma.upvote.create({ data: { userId: user.id, questionId, isConstituent } }),
    prisma.question.update({
      where: { id: questionId },
      data: { upvoteCount: { increment: 1 } },
    }),
  ]);

  // Fire-and-forget: sync signature to Action Network and send confirmation.
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

  return NextResponse.json({
    upvoted: true,
    upvoteCount: question.upvoteCount + 1,
    isConstituent,
  });
}
