import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

/**
 * GET /api/account
 * Returns the current user's account info and district data (officials matched via Cicero).
 * Does NOT return street address.
 */
export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  // Fetch user's matched officials via UserDistrict (populated from Cicero on address lookup)
  const userDistricts = await prisma.userDistrict.findMany({
    where: { userId: user.id },
    include: {
      official: {
        select: {
          id: true,
          name: true,
          title: true,
          party: true,
          state: true,
          district: true,
          chamber: true,
          photoUrl: true,
        },
      },
    },
  });

  const districts = userDistricts.map((ud) => ({
    officialId: ud.official.id,
    name: ud.official.name,
    title: ud.official.title,
    party: ud.official.party,
    state: ud.official.state,
    district: ud.official.district,
    chamber: ud.official.chamber,
    photoUrl: ud.official.photoUrl,
  }));

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isProfilePublic: user.isProfilePublic,
    emailConsent: user.emailConsent,
    isAddressVerified: user.isAddressVerified,
    state: user.state,
    createdAt: user.createdAt,
    districts,
  });
}

/**
 * PATCH /api/account
 * Update account settings: public profile visibility and email consent.
 * Body: { isProfilePublic?: boolean, emailConsent?: boolean }
 */
export async function PATCH(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  const { isProfilePublic, emailConsent } = body as {
    isProfilePublic?: boolean;
    emailConsent?: boolean;
  };

  const data: Record<string, boolean> = {};
  if (typeof isProfilePublic === "boolean") data.isProfilePublic = isProfilePublic;
  if (typeof emailConsent === "boolean") data.emailConsent = emailConsent;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { isProfilePublic: true, emailConsent: true },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/account
 * Permanently delete the current user's account and all their questions.
 * Requires body: { confirm: "DELETE" }
 */
export async function DELETE(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  if (body.confirm !== "DELETE") {
    return NextResponse.json(
      { error: 'You must send { "confirm": "DELETE" } to delete your account' },
      { status: 400 },
    );
  }

  const userId = user.id;

  await prisma.$transaction(async (tx) => {
    // Get user's question IDs for cascading cleanup
    const userQuestions = await tx.question.findMany({
      where: { authorId: userId },
      select: { id: true },
    });
    const questionIds = userQuestions.map((q) => q.id);

    if (questionIds.length > 0) {
      // Delete answer media, then answers for user's questions
      const answers = await tx.answer.findMany({
        where: { questionId: { in: questionIds } },
        select: { id: true },
      });
      if (answers.length > 0) {
        await tx.responseMedia.deleteMany({
          where: { answerId: { in: answers.map((a) => a.id) } },
        });
        await tx.answer.deleteMany({ where: { questionId: { in: questionIds } } });
      }
      // EmailEvents linked to questions
      await tx.emailEvent.deleteMany({ where: { questionId: { in: questionIds } } });
      // GroupEndorsements linked to questions
      await tx.groupEndorsement.deleteMany({ where: { questionId: { in: questionIds } } });
    }

    // User's own records
    await tx.upvote.deleteMany({ where: { userId } });
    await tx.signerComment.deleteMany({ where: { userId } });
    await tx.amaComment.deleteMany({ where: { userId } });
    await tx.emailEvent.deleteMany({ where: { userId } });
    await tx.groupCommOptIn.deleteMany({ where: { userId } });
    await tx.userDistrict.deleteMany({ where: { userId } });
    await tx.questionFlag.deleteMany({ where: { userId } });

    // Delete questions (QuestionTag, Upvote, SignerComment cascade via onDelete: Cascade)
    if (questionIds.length > 0) {
      await tx.question.deleteMany({ where: { authorId: userId } });
    }

    // Delete the user (Account, Session cascade via onDelete: Cascade)
    await tx.user.delete({ where: { id: userId } });
  });

  return NextResponse.json({ success: true, deleted: true });
}
