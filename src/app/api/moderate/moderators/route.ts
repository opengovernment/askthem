import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

/**
 * GET /api/moderate/moderators
 * List all current moderators. Admin only.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const moderators = await prisma.user.findMany({
    where: { role: { in: ["moderator", "admin"] } },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      state: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ moderators });
}

/**
 * POST /api/moderate/moderators
 * Promote or demote a user. Admin only.
 * Body: { userId: string, action: "promote" | "demote" }
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, action } = body as { userId?: string; action?: "promote" | "demote" };

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (action !== "promote" && action !== "demote") {
    return NextResponse.json({ error: 'action must be "promote" or "demote"' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, name: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent admins from demoting themselves
  if (target.id === admin.id) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }

  // Prevent demoting other admins
  if (action === "demote" && target.role === "admin") {
    return NextResponse.json({ error: "Cannot demote another admin" }, { status: 403 });
  }

  // Prevent promoting someone who is already a moderator or admin
  if (action === "promote" && target.role !== "user") {
    return NextResponse.json({ error: "User is already a moderator or admin" }, { status: 400 });
  }

  // Prevent demoting a regular user
  if (action === "demote" && target.role === "user") {
    return NextResponse.json({ error: "User is not a moderator" }, { status: 400 });
  }

  const newRole = action === "promote" ? "moderator" : "user";
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  return NextResponse.json({ success: true, userId, role: newRole });
}
