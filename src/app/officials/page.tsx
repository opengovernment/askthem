import { getFilteredOfficials, getActiveStates } from "@/lib/queries";
import { OfficialFilters } from "@/components/OfficialFilters";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { US_STATES } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elected Officials - AskThem",
  description: "Browse elected officials and see what questions constituents are asking them.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    state?: string;
    chamber?: string;
  }>;
}

export default async function OfficialsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [officials, activeStates] = await Promise.all([
    getFilteredOfficials({
      search: params.search,
      state: params.state,
      chamber: params.chamber,
    }),
    getActiveStates(),
  ]);

  const hasFilters = params.search || params.state || params.chamber;

  // Group officials into federal sections and per-state sections
  const senators = officials.filter((o) => o.chamber === "senate").sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
  const houseReps = officials.filter((o) => o.chamber === "house").sort((a, b) => a.state.localeCompare(b.state) || (a.district || "").localeCompare(b.district || "") || a.name.localeCompare(b.name));
  const governors = officials.filter((o) => o.chamber === "state_exec").sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));

  // State-level officials grouped by state
  const stateLevelOfficials = officials.filter((o) => o.chamber === "state_senate" || o.chamber === "state_house" || o.chamber === "local");
  const byState: Record<string, typeof officials> = {};
  for (const o of stateLevelOfficials) {
    if (!byState[o.state]) byState[o.state] = [];
    byState[o.state].push(o);
  }
  // Sort each state's officials: state senate first, then state house, then local, then by name
  const chamberOrder: Record<string, number> = { state_senate: 0, state_house: 1, local: 2 };
  for (const state of Object.keys(byState)) {
    byState[state].sort((a, b) => (chamberOrder[a.chamber] ?? 9) - (chamberOrder[b.chamber] ?? 9) || a.name.localeCompare(b.name));
  }
  // Sort states alphabetically by full name
  const sortedStates = Object.keys(byState).sort((a, b) => (US_STATES[a] || a).localeCompare(US_STATES[b] || b));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Elected Officials</h1>
        <p className="mb-6 text-gray-600">
          Browse officials and see what questions constituents are asking them.
        </p>

        <div className="mb-8">
          <Suspense fallback={null}>
            <OfficialFilters activeStates={activeStates} />
          </Suspense>
        </div>

        {officials.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              {hasFilters ? "No officials match your search." : "No officials found."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {officials.length} official{officials.length !== 1 ? "s" : ""}
            </p>

            {/* U.S. Senate */}
            {senators.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-700">U.S. Senate</h2>
                <OfficialGrid officials={senators} />
              </div>
            )}

            {/* U.S. House */}
            {houseReps.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-700">U.S. House of Representatives</h2>
                <OfficialGrid officials={houseReps} />
              </div>
            )}

            {/* State Governors */}
            {governors.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-700">Governors</h2>
                <OfficialGrid officials={governors} />
              </div>
            )}

            {/* Per-state sections */}
            {sortedStates.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-700">State Legislatures</h2>
                {sortedStates.map((stateAbbr) => (
                  <CollapsibleSection
                    key={stateAbbr}
                    title={US_STATES[stateAbbr] || stateAbbr}
                    count={byState[stateAbbr].length}
                  >
                    <OfficialGrid officials={byState[stateAbbr]} showChamber />
                  </CollapsibleSection>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OfficialGrid({ officials, showChamber = false }: { officials: Array<{ id: string; name: string; title: string; party: string; state: string; district: string | null; chamber: string }>; showChamber?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {officials.map((official) => (
        <Link
          key={official.id}
          href={`/officials/${official.id}`}
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
            {official.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{official.name}</p>
            <p className="text-sm text-gray-500">
              {official.title} &middot;{" "}
              {official.party === "D" ? "Dem" : official.party === "R" ? "Rep" : official.party}{" "}
              &middot; {official.state}
              {official.district ? `, ${official.district}` : ""}
              {showChamber ? ` \u00b7 ${chamberLabel(official.chamber)}` : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function chamberLabel(chamber: string): string {
  const labels: Record<string, string> = {
    senate: "U.S. Senate",
    house: "U.S. House",
    state_exec: "Governor",
    state_senate: "State Senate",
    state_house: "State House",
    local: "Local",
  };
  return labels[chamber] || chamber;
}
