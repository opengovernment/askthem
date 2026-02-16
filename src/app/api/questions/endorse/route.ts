import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/session";

export async function POST(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { questionId, groupId, note } = body as {
    questionId?: string;
    groupId?: string;
    note?: string;
  };

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }
  if (!groupId || typeof groupId !== "string") {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 });
  }

  // Verify the question exists
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Verify the group exists and is verified
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (!group.isVerified) {
    return NextResponse.json({ error: "Only verified groups can endorse questions" }, { status: 422 });
  }

  // Check if endorsement already exists
  const existing = await prisma.groupEndorsement.findUnique({
    where: { questionId_groupId: { questionId, groupId } },
  });

  if (existing) {
    return NextResponse.json({ error: "This group has already endorsed this question" }, { status: 409 });
  }

  const endorsement = await prisma.groupEndorsement.create({
    data: {
      questionId,
      groupId,
      addedBy: moderator.id,
      note: note?.trim() || null,
    },
    include: {
      group: {
        select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true, websiteUrl: true },
      },
    },
  });

  return NextResponse.json(endorsement);
}

export async function DELETE(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("questionId");
  const groupId = searchParams.get("groupId");

  if (!questionId || !groupId) {
    return NextResponse.json({ error: "questionId and groupId are required" }, { status: 400 });
  }

  const existing = await prisma.groupEndorsement.findUnique({
    where: { questionId_groupId: { questionId, groupId } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Endorsement not found" }, { status: 404 });
  }

  await prisma.groupEndorsement.delete({
    where: { questionId_groupId: { questionId, groupId } },
  });

  return NextResponse.json({ removed: true });
}
