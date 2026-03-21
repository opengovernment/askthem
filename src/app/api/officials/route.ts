import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getAllOfficials, getOfficialsForUser, getFilteredOfficials } from "@/lib/queries";

const FEDERAL_CHAMBERS = ["senate", "house"];

function excludeFederal<T extends { chamber: string }>(officials: T[]): T[] {
  return officials.filter((o) => !FEDERAL_CHAMBERS.includes(o.chamber));
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const all = params.get("all") === "true";
  const stateFilter = params.get("state");
  const chamberFilter = params.get("chamber"); // comma-separated chambers

  // If filtering by state or chamber, return filtered results
  if (stateFilter || chamberFilter) {
    const chambers = chamberFilter ? chamberFilter.split(",") : undefined;
    // Use getFilteredOfficials for state, then filter chambers client-side
    // since getFilteredOfficials only supports a single chamber
    let officials = await getFilteredOfficials({
      state: stateFilter || undefined,
    });
    if (chambers && chambers.length > 0) {
      officials = officials.filter((o) => chambers.includes(o.chamber));
    }
    return NextResponse.json(officials);
  }

  if (!all) {
    // Try to filter to the user's representatives
    const user = await getCurrentUser();
    if (user?.isAddressVerified) {
      const officials = await getOfficialsForUser(user.id);
      if (officials.length > 0) {
        // Exclude federal officials during beta (only Groups can ask them)
        return NextResponse.json(excludeFederal(officials));
      }
    }
  }

  // Fall back to all officials (not signed in, no address, or ?all=true)
  const officials = await getAllOfficials();
  // Exclude federal officials during beta (only Groups can ask them)
  return NextResponse.json(excludeFederal(officials));
}
