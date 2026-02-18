import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireModerator } from "@/lib/session";

// GET /api/events/comments?eventId=<id> — list approved comments (or all for moderators)
export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const moderator = await requireModerator();
  const statusFilter = moderator ? {} : { status: "approved" };

  const comments = await prisma.amaComment.findMany({
    where: { eventId, ...statusFilter },
    include: {
      user: { select: { id: true, name: true, image: true, city: true, state: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json(comments);
}

// POST /api/events/comments — create a comment or moderate one
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body as { action?: string };

  // ── Submit a new comment ────────────────────────────────────────
  if (!action || action === "create") {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { eventId, text } = body as { eventId?: string; text?: string };
    if (!eventId || !text?.trim()) {
      return NextResponse.json({ error: "eventId and text are required" }, { status: 400 });
    }
    if (text.trim().length > 500) {
      return NextResponse.json({ error: "Comment is too long (max 500 characters)" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (!event.isAma) {
      return NextResponse.json({ error: "Comments are only available for AMA events" }, { status: 400 });
    }
    if (event.status !== "live") {
      return NextResponse.json({ error: "Comments can only be posted during a live AMA" }, { status: 403 });
    }

    const comment = await prisma.amaComment.create({
      data: {
        eventId,
        userId: user.id,
        text: text.trim(),
        status: "pending",
      },
      include: {
        user: { select: { id: true, name: true, image: true, city: true, state: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  }

  // ── Moderate a comment (approve/reject) ─────────────────────────
  if (action === "moderate") {
    const moderator = await requireModerator();
    if (!moderator) {
      return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
    }

    const { commentId, status } = body as { commentId?: string; status?: string };
    if (!commentId) {
      return NextResponse.json({ error: "commentId is required" }, { status: 400 });
    }
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    const comment = await prisma.amaComment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const updated = await prisma.amaComment.update({
      where: { id: commentId },
      data: { status },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
