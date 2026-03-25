import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/session";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { action } = body as { action?: string };

  // ── Create event ──────────────────────────────────────────────────
  if (action === "create") {
    const { title, description, officialId, location, startsAt, endsAt, isAma } = body as {
      title?: string;
      description?: string;
      officialId?: string;
      location?: string;
      startsAt?: string;
      endsAt?: string;
      isAma?: boolean;
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    if (!officialId) {
      return NextResponse.json({ error: "Official is required" }, { status: 400 });
    }
    if (!startsAt) {
      return NextResponse.json({ error: "Start date/time is required" }, { status: 400 });
    }

    const official = await prisma.official.findUnique({ where: { id: officialId } });
    if (!official) {
      return NextResponse.json({ error: "Official not found" }, { status: 404 });
    }

    // Generate unique slug
    let baseSlug = slugify(title.trim());
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        slug,
        description: description.trim(),
        officialId,
        location: location?.trim() || null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        createdBy: moderator.id,
        isAma: isAma === true,
      },
    });

    return NextResponse.json({ id: event.id, slug: event.slug });
  }

  // ── Update event status ───────────────────────────────────────────
  if (action === "update_status") {
    const { eventId, status } = body as { eventId?: string; status?: string };

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }
    const validStatuses = ["upcoming", "live", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { status },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  }

  // ── Edit event details ────────────────────────────────────────────
  if (action === "edit") {
    const { eventId, title, description, officialId, location, startsAt, endsAt } = body as {
      eventId?: string;
      title?: string;
      description?: string;
      officialId?: string;
      location?: string;
      startsAt?: string;
      endsAt?: string;
    };

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    if (title?.trim()) data.title = title.trim();
    if (description?.trim()) data.description = description.trim();
    if (officialId) {
      const official = await prisma.official.findUnique({ where: { id: officialId } });
      if (!official) {
        return NextResponse.json({ error: "Official not found" }, { status: 404 });
      }
      data.officialId = officialId;
    }
    if (location !== undefined) data.location = location?.trim() || null;
    if (startsAt) data.startsAt = new Date(startsAt);
    if (endsAt !== undefined) data.endsAt = endsAt ? new Date(endsAt) : null;

    const updated = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    return NextResponse.json({ id: updated.id });
  }

  // ── Toggle AMA question acceptance ──────────────────────────────
  if (action === "toggle_questions") {
    const { eventId, acceptingQuestions } = body as { eventId?: string; acceptingQuestions?: boolean };

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }
    if (typeof acceptingQuestions !== "boolean") {
      return NextResponse.json({ error: "acceptingQuestions must be a boolean" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { acceptingQuestions },
    });

    return NextResponse.json({ id: updated.id, acceptingQuestions: updated.acceptingQuestions });
  }

  return NextResponse.json(
    { error: "Invalid action. Must be: create, update_status, edit, or toggle_questions" },
    { status: 400 },
  );
}
