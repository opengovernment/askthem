import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POLICY_AREAS } from "@/lib/types";
import { requireModerator } from "@/lib/session";
import { extractKeywords } from "@/lib/keywords";
import { randomUUID } from "crypto";

/**
 * POST /api/moderate/broadcast
 *
 * Publish the same question to multiple elected officials at once.
 * Moderator/admin only. Accepts targeting filters (state, chamber)
 * to select which officials receive the question.
 */
export async function POST(request: NextRequest) {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { text, tags, targetState, targetChambers, officialIds } = body as {
    text?: string;
    tags?: string[];
    targetState?: string;
    targetChambers?: string[];
    officialIds?: string[];
  };

  // Validate text
  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Question text must be at least 10 characters" }, { status: 400 });
  }
  if (text.trim().length > 500) {
    return NextResponse.json({ error: "Question text must be at most 500 characters" }, { status: 400 });
  }

  // Validate tags
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > 3) {
    return NextResponse.json({ error: "1-3 policy area tags are required" }, { status: 400 });
  }
  const validTags = tags.every((t) => (POLICY_AREAS as readonly string[]).includes(t));
  if (!validTags) {
    return NextResponse.json({ error: "Invalid policy area tag" }, { status: 400 });
  }

  // Build official filter — either explicit IDs or targeting criteria
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (officialIds && Array.isArray(officialIds) && officialIds.length > 0) {
    // Explicit list of officials (from preview selection)
    where.id = { in: officialIds };
  } else {
    // Filter-based targeting
    if (targetState) {
      where.state = targetState;
    }
    if (targetChambers && Array.isArray(targetChambers) && targetChambers.length > 0) {
      where.chamber = { in: targetChambers };
    }
  }

  // Find matching officials
  const officials = await prisma.official.findMany({ where });

  if (officials.length === 0) {
    return NextResponse.json({ error: "No officials match the selected criteria" }, { status: 400 });
  }

  const batchId = randomUUID();
  const trimmedText = text.trim();
  const extractedKeywords = extractKeywords(trimmedText);

  // Create one question per official, all sharing the same batchId
  const created = await prisma.$transaction(
    officials.map((official) => {
      const districtTag = official.district
        ? `${official.state}-${official.district}`
        : `${official.state}-${official.chamber}`;

      return prisma.question.create({
        data: {
          text: trimmedText,
          authorId: user.id,
          officialId: official.id,
          districtTag,
          status: "published", // moderator-created questions skip review
          batchId,
          categoryTags: {
            create: tags.map((tag) => ({ tag })),
          },
          keywords: {
            create: extractedKeywords.map((keyword) => ({ keyword })),
          },
        },
      });
    }),
  );

  return NextResponse.json({
    batchId,
    count: created.length,
    questionIds: created.map((q) => q.id),
  }, { status: 201 });
}

/**
 * GET /api/moderate/broadcast
 *
 * List all broadcast batches with summary info.
 */
export async function GET() {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  // Find all distinct batchIds with their question counts and text
  const batches = await prisma.question.findMany({
    where: { batchId: { not: null } },
    select: {
      batchId: true,
      text: true,
      status: true,
      createdAt: true,
      author: { select: { name: true, email: true } },
      categoryTags: { select: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by batchId
  const batchMap = new Map<string, {
    batchId: string;
    text: string;
    tags: string[];
    createdAt: Date;
    createdBy: string;
    total: number;
    published: number;
    delivered: number;
    answered: number;
  }>();

  for (const q of batches) {
    if (!q.batchId) continue;
    const existing = batchMap.get(q.batchId);
    if (!existing) {
      batchMap.set(q.batchId, {
        batchId: q.batchId,
        text: q.text,
        tags: q.categoryTags.map((t) => t.tag),
        createdAt: q.createdAt,
        createdBy: q.author.name || q.author.email,
        total: 1,
        published: q.status === "published" ? 1 : 0,
        delivered: q.status === "delivered" ? 1 : 0,
        answered: q.status === "answered" ? 1 : 0,
      });
    } else {
      existing.total++;
      if (q.status === "published") existing.published++;
      if (q.status === "delivered") existing.delivered++;
      if (q.status === "answered") existing.answered++;
    }
  }

  return NextResponse.json({ batches: [...batchMap.values()] });
}
