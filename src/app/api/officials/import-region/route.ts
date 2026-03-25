import { NextRequest, NextResponse } from "next/server";
import { requireModerator } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { lookupOfficialsByRegion, isEnabled } from "@/lib/cicero";
import type { NormalizedOfficial } from "@/lib/cicero";

/**
 * POST /api/officials/import-region
 *
 * Bulk-import elected officials for a state using the Cicero
 * `officials_by_region` endpoint. Requires moderator/admin role.
 *
 * Body: {
 *   state: string,                  // e.g. "NY"
 *   levels: string[],               // e.g. ["federal", "state", "local"]
 *   dryRun?: boolean                // if true, return counts without upserting
 * }
 */

// Map friendly level names to Cicero district_type values
const LEVEL_TO_DISTRICT_TYPES: Record<string, string[]> = {
  federal: ["NATIONAL_UPPER", "NATIONAL_LOWER"],
  state: ["STATE_EXEC", "STATE_UPPER", "STATE_LOWER"],
  local: ["LOCAL", "LOCAL_EXEC", "COUNTY"],
};

const ALL_LEVELS = Object.keys(LEVEL_TO_DISTRICT_TYPES);

export async function POST(req: NextRequest) {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  if (!isEnabled()) {
    return NextResponse.json(
      { error: "Cicero API key not configured" },
      { status: 503 },
    );
  }

  const body = await req.json();
  const { state, levels, dryRun } = body;

  if (!state || typeof state !== "string" || state.length !== 2) {
    return NextResponse.json(
      { error: "state is required (2-letter abbreviation, e.g. 'NY')" },
      { status: 400 },
    );
  }

  const requestedLevels: string[] = Array.isArray(levels) && levels.length > 0
    ? levels.filter((l: string) => ALL_LEVELS.includes(l))
    : ALL_LEVELS;

  if (requestedLevels.length === 0) {
    return NextResponse.json(
      { error: `Invalid levels. Choose from: ${ALL_LEVELS.join(", ")}` },
      { status: 400 },
    );
  }

  // Build district_type array from requested levels
  const districtTypes = requestedLevels.flatMap((l) => LEVEL_TO_DISTRICT_TYPES[l]);

  // Fetch from Cicero — we batch by level group to get accurate counts
  const results: {
    level: string;
    districtTypes: string[];
    officials: NormalizedOfficial[];
    totalFromApi: number;
    apiCalls: number;
  }[] = [];

  let totalApiCalls = 0;

  for (const level of requestedLevels) {
    const dt = LEVEL_TO_DISTRICT_TYPES[level];
    try {
      const result = await lookupOfficialsByRegion({
        district_type: dt,
        state: state.toUpperCase(),
      });
      results.push({
        level,
        districtTypes: dt,
        officials: result.officials,
        totalFromApi: result.totalFromApi,
        apiCalls: result.apiCalls,
      });
      totalApiCalls += result.apiCalls;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // If one level fails (e.g. no access to local), continue with others
      results.push({
        level,
        districtTypes: dt,
        officials: [],
        totalFromApi: 0,
        apiCalls: 0,
      });
      console.error(`[import-region] Failed to fetch ${level} for ${state}: ${message}`);
    }
  }

  const allOfficials = results.flatMap((r) => r.officials);

  // Deduplicate by ciceroId (in case an official appears under multiple district types)
  const uniqueMap = new Map<string, NormalizedOfficial>();
  for (const o of allOfficials) {
    uniqueMap.set(o.ciceroId, o);
  }
  const uniqueOfficials = Array.from(uniqueMap.values());

  const summary = {
    state: state.toUpperCase(),
    levels: requestedLevels,
    totalApiCalls,
    breakdown: results.map((r) => ({
      level: r.level,
      districtTypes: r.districtTypes,
      count: r.officials.length,
      totalFromApi: r.totalFromApi,
      apiCalls: r.apiCalls,
    })),
    totalUnique: uniqueOfficials.length,
    dryRun: !!dryRun,
  };

  if (dryRun) {
    return NextResponse.json({
      ...summary,
      message: "Dry run — no officials were saved. Set dryRun: false to import.",
    });
  }

  // Upsert all officials into the database
  let created = 0;
  let updated = 0;

  for (const o of uniqueOfficials) {
    const existing = await prisma.official.findUnique({
      where: { ciceroId: o.ciceroId },
    });

    await prisma.official.upsert({
      where: { ciceroId: o.ciceroId },
      create: {
        ciceroId: o.ciceroId,
        name: o.name,
        title: o.title,
        party: o.party,
        state: o.state,
        district: o.district,
        chamber: o.chamber,
        level: o.level,
        photoUrl: o.photoUrl,
        email: o.email,
        phone: o.phone,
        website: o.website,
        twitter: o.twitter,
      },
      update: {
        name: o.name,
        title: o.title,
        party: o.party,
        state: o.state,
        district: o.district,
        chamber: o.chamber,
        level: o.level,
        photoUrl: o.photoUrl,
        email: o.email,
        phone: o.phone,
        website: o.website,
        twitter: o.twitter,
      },
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }
  }

  return NextResponse.json({
    ...summary,
    created,
    updated,
    message: `Successfully imported ${uniqueOfficials.length} officials for ${state.toUpperCase()} (${created} new, ${updated} updated).`,
  });
}
