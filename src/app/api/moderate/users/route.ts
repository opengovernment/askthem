import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/session";

/**
 * GET /api/moderate/users?q=search+term
 * Search users by email or name. Moderator/admin only.
 */
export async function GET(req: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Search query must be at least 2 characters" }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      status: true,
      pausedUntil: true,
      city: true,
      state: true,
      isGovUser: true,
      createdAt: true,
      _count: { select: { questions: true, upvotes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return NextResponse.json({ users });
}

/**
 * POST /api/moderate/users
 * Actions: ban, unban, pause, unpause, delete. Moderator/admin only.
 * Delete requires admin role.
 */
export async function POST(req: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, action, pauseDays, officialIds } = body as {
    userId?: string;
    action?: "ban" | "unban" | "pause" | "unpause" | "delete" | "assign_districts";
    pauseDays?: number;
    officialIds?: string[];
  };

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const validActions = ["ban", "unban", "pause", "unpause", "delete", "assign_districts"] as const;
  if (!action || !validActions.includes(action)) {
    return NextResponse.json(
      { error: `action must be one of: ${validActions.join(", ")}` },
      { status: 400 },
    );
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent moderators from acting on admins or other moderators
  if (targetUser.role === "admin" || targetUser.role === "moderator") {
    if (moderator.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can manage moderator and admin accounts" },
        { status: 403 },
      );
    }
    // Admins can't ban/delete themselves
    if (targetUser.id === moderator.id) {
      return NextResponse.json({ error: "You cannot take this action on your own account" }, { status: 400 });
    }
  }

  switch (action) {
    case "ban": {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "banned", pausedUntil: null },
      });
      // Kill active sessions so the ban takes effect immediately
      await prisma.session.deleteMany({ where: { userId } });
      return NextResponse.json({ success: true, status: "banned" });
    }

    case "unban": {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "active", pausedUntil: null },
      });
      return NextResponse.json({ success: true, status: "active" });
    }

    case "pause": {
      const days = pauseDays && pauseDays > 0 ? pauseDays : 7;
      const until = new Date();
      until.setDate(until.getDate() + days);

      await prisma.user.update({
        where: { id: userId },
        data: { status: "paused", pausedUntil: until },
      });
      return NextResponse.json({ success: true, status: "paused", pausedUntil: until.toISOString() });
    }

    case "unpause": {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "active", pausedUntil: null },
      });
      return NextResponse.json({ success: true, status: "active" });
    }

    case "assign_districts": {
      // Assign officials/districts to a gov user (moderator or admin)
      if (!targetUser.isGovUser) {
        return NextResponse.json(
          { error: "District assignment is only available for government (.gov) users" },
          { status: 400 },
        );
      }
      if (!officialIds || !Array.isArray(officialIds) || officialIds.length === 0) {
        return NextResponse.json(
          { error: "officialIds array is required" },
          { status: 400 },
        );
      }

      // Verify all officials exist
      const officials = await prisma.official.findMany({
        where: { id: { in: officialIds } },
        select: { id: true, name: true, title: true, state: true, district: true, chamber: true },
      });
      if (officials.length !== officialIds.length) {
        return NextResponse.json(
          { error: "One or more official IDs are invalid" },
          { status: 400 },
        );
      }

      // Replace existing district assignments with the new set
      await prisma.$transaction(async (tx) => {
        await tx.userDistrict.deleteMany({ where: { userId } });
        await tx.userDistrict.createMany({
          data: officialIds.map((officialId) => ({ userId, officialId })),
        });
      });

      return NextResponse.json({
        success: true,
        assignedOfficials: officials,
      });
    }

    case "delete": {
      // Delete requires admin
      if (moderator.role !== "admin") {
        return NextResponse.json({ error: "Only admins can delete users" }, { status: 403 });
      }

      // Cascade: Prisma relations with onDelete: Cascade handle Account and Session.
      // We manually clean up other records.
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

        // Now safe to delete questions (QuestionTag, Upvote, SignerComment cascade)
        if (questionIds.length > 0) {
          await tx.question.deleteMany({ where: { authorId: userId } });
        }

        // Delete the user (Account, Session cascade via onDelete: Cascade)
        await tx.user.delete({ where: { id: userId } });
      });

      return NextResponse.json({ success: true, deleted: true });
    }
  }
}
