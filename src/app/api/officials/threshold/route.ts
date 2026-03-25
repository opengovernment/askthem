import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/session";

/**
 * PATCH /api/officials/threshold
 * Set a custom delivery threshold for an elected official.
 * Body: { officialId, threshold: number | null, thresholdType: "constituent" | "supporter" }
 */
export async function PATCH(request: NextRequest) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { officialId, threshold, thresholdType } = body as {
    officialId?: string;
    threshold?: number | null;
    thresholdType?: string;
  };

  if (!officialId || typeof officialId !== "string") {
    return NextResponse.json({ error: "officialId is required" }, { status: 400 });
  }

  const validTypes = ["constituent", "supporter"];
  if (thresholdType !== undefined && !validTypes.includes(thresholdType)) {
    return NextResponse.json(
      { error: `thresholdType must be one of: ${validTypes.join(", ")}` },
      { status: 400 },
    );
  }

  if (threshold !== undefined && threshold !== null) {
    if (typeof threshold !== "number" || !Number.isInteger(threshold) || threshold < 1) {
      return NextResponse.json(
        { error: "threshold must be a positive integer or null" },
        { status: 400 },
      );
    }
  }

  const official = await prisma.official.findUnique({ where: { id: officialId } });
  if (!official) {
    return NextResponse.json({ error: "Official not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (threshold !== undefined) data.deliveryThreshold = threshold;
  if (thresholdType !== undefined) data.deliveryThresholdType = thresholdType;

  const updated = await prisma.official.update({
    where: { id: officialId },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    deliveryThreshold: updated.deliveryThreshold,
    deliveryThresholdType: updated.deliveryThresholdType,
  });
}
