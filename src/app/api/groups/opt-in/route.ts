import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  const { groupId } = body as { groupId?: string };

  if (!groupId || typeof groupId !== "string") {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 });
  }

  // Verify the group exists, is verified, and has comms enabled
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (!group.isVerified || !group.commsOptInEnabled) {
    return NextResponse.json({ error: "This group does not accept communications opt-in" }, { status: 422 });
  }

  // Check if already opted in
  const existing = await prisma.groupCommOptIn.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });

  if (existing) {
    // Opt out (toggle)
    await prisma.groupCommOptIn.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ optedIn: false });
  }

  // Opt in
  await prisma.groupCommOptIn.create({
    data: { userId: user.id, groupId },
  });

  return NextResponse.json({ optedIn: true });
}

export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ optedIn: false });
  }

  const groupId = request.nextUrl.searchParams.get("groupId");
  if (!groupId) {
    return NextResponse.json({ optedIn: false });
  }

  const existing = await prisma.groupCommOptIn.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });

  return NextResponse.json({ optedIn: !!existing });
}
