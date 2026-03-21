import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lookupOfficialsByRegion, isEnabled } from "@/lib/cicero";
import type { NormalizedOfficial } from "@/lib/cicero";

/**
 * GET /api/officials/import-region-run?token=<CICERO_API_KEY>&state=NY&levels=federal,state&dryRun=true
 *
 * One-shot import route callable from the browser. Authenticated via
 * token= matching the CICERO_API_KEY env var (not session-based).
 *
 * Query params:
 *   token    - must match CICERO_API_KEY
 *   state    - 2-letter state code (default: NY)
 *   levels   - comma-separated: federal,state,local (default: federal,state)
 *   dryRun   - "true" to preview counts without saving (default: false)
 */

const LEVEL_TO_DISTRICT_TYPES: Record<string, string[]> = {
  federal: ["NATIONAL_UPPER", "NATIONAL_LOWER"],
  state: ["STATE_EXEC", "STATE_UPPER", "STATE_LOWER"],
  local: ["LOCAL", "LOCAL_EXEC", "COUNTY"],
};

const ALL_LEVELS = Object.keys(LEVEL_TO_DISTRICT_TYPES);

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const token = params.get("token");
  const state = (params.get("state") ?? "NY").toUpperCase();
  const levelsParam = params.get("levels") ?? "federal,state";
  const dryRun = params.get("dryRun") === "true";

  // Auth: token must match the Cicero API key
  const ciceroKey = process.env.CICERO_API_KEY;
  if (!token || !ciceroKey || token !== ciceroKey) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (!isEnabled()) {
    return NextResponse.json({ error: "Cicero API key not configured" }, { status: 503 });
  }

  const requestedLevels = levelsParam
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter((l) => ALL_LEVELS.includes(l));

  if (requestedLevels.length === 0) {
    return NextResponse.json(
      { error: `Invalid levels. Choose from: ${ALL_LEVELS.join(", ")}` },
      { status: 400 },
    );
  }

  // Fetch from Cicero — one call per level group
  const results: {
    level: string;
    districtTypes: string[];
    count: number;
    totalFromApi: number;
    apiCalls: number;
    error?: string;
  }[] = [];

  let allOfficials: NormalizedOfficial[] = [];
  let totalApiCalls = 0;

  for (const level of requestedLevels) {
    const dt = LEVEL_TO_DISTRICT_TYPES[level];
    try {
      const result = await lookupOfficialsByRegion({
        district_type: dt,
        state,
      });
      allOfficials = allOfficials.concat(result.officials);
      totalApiCalls += result.apiCalls;
      results.push({
        level,
        districtTypes: dt,
        count: result.officials.length,
        totalFromApi: result.totalFromApi,
        apiCalls: result.apiCalls,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      totalApiCalls++;
      results.push({
        level,
        districtTypes: dt,
        count: 0,
        totalFromApi: 0,
        apiCalls: 1,
        error: message,
      });
    }
  }

  // Deduplicate by ciceroId
  const uniqueMap = new Map<string, NormalizedOfficial>();
  for (const o of allOfficials) {
    uniqueMap.set(o.ciceroId, o);
  }
  const uniqueOfficials = Array.from(uniqueMap.values());

  const summary = {
    state,
    levels: requestedLevels,
    totalApiCalls,
    breakdown: results,
    totalUnique: uniqueOfficials.length,
    dryRun,
  };

  if (dryRun) {
    return NextResponse.json({
      ...summary,
      message: `Dry run complete. Found ${uniqueOfficials.length} unique officials. Add &dryRun=false to import.`,
      preview: uniqueOfficials.slice(0, 10).map((o) => ({
        name: o.name,
        title: o.title,
        party: o.party,
        chamber: o.chamber,
        state: o.state,
        district: o.district,
      })),
    });
  }

  // Upsert all officials
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
    message: `Imported ${uniqueOfficials.length} officials for ${state} (${created} new, ${updated} updated).`,
  });
}
