import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireModerator } from "@/lib/session";

const DEFAULTS: Record<string, string> = {
  dailyQuestionLimit: "5",
};

/**
 * GET /api/site-settings
 * Returns all site settings (public to authenticated users).
 */
export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const rows = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings);
}

/**
 * PATCH /api/site-settings
 * Update one or more site settings. Moderator/admin only.
 * Body: { dailyQuestionLimit?: number }
 */
export async function PATCH(request: Request) {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { dailyQuestionLimit } = body as { dailyQuestionLimit?: number };

  if (dailyQuestionLimit !== undefined) {
    const limit = Number(dailyQuestionLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "dailyQuestionLimit must be an integer between 1 and 100" },
        { status: 400 },
      );
    }
    await prisma.siteSetting.upsert({
      where: { key: "dailyQuestionLimit" },
      update: { value: String(limit) },
      create: { key: "dailyQuestionLimit", value: String(limit) },
    });
  }

  // Return updated settings
  const rows = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings);
}
