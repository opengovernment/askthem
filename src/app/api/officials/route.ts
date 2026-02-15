import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getAllOfficials, getOfficialsForUser } from "@/lib/queries";

export async function GET(req: NextRequest) {
  // If ?all=true, return all officials (for the officials directory page)
  const all = req.nextUrl.searchParams.get("all") === "true";

  if (!all) {
    // Try to filter to the user's representatives
    const user = await getCurrentUser();
    if (user?.isAddressVerified) {
      const officials = await getOfficialsForUser(user.id);
      if (officials.length > 0) {
        return NextResponse.json(officials);
      }
    }
  }

  // Fall back to all officials (not signed in, no address, or ?all=true)
  const officials = await getAllOfficials();
  return NextResponse.json(officials);
}
