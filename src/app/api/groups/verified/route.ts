import { NextResponse } from "next/server";
import { getVerifiedGroups } from "@/lib/queries";
import { requireModerator } from "@/lib/session";

export async function GET() {
  const moderator = await requireModerator();
  if (!moderator) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const groups = await getVerifiedGroups();
  return NextResponse.json(groups);
}
