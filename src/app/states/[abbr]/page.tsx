import { getFilteredOfficials } from "@/lib/queries";
import { US_STATES } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ abbr: string }>;
}

const chamberLabels: Record<string, string> = {
  senate: "U.S. Senate",
  house: "U.S. House of Representatives",
  state_exec: "Governor / State Executive",
  state_senate: "State Senate",
  state_house: "State House",
  local: "Local Officials",
};

const chamberOrder = ["senate", "house", "state_exec", "state_senate", "state_house", "local"];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { abbr } = await params;
  const stateName = US_STATES[abbr.toUpperCase()];
  if (!stateName) return { title: "State Not Found - AskThem" };

  return {
    title: `${stateName} Elected Officials - AskThem`,
    description: `Browse elected officials in ${stateName}. See U.S. senators, representatives, and state officials.`,
  };
}

export default async function StatePage({ params }: PageProps) {
  const { abbr } = await params;
  const stateAbbr = abbr.toUpperCase();
  const stateName = US_STATES[stateAbbr];

  if (!stateName) notFound();

  const officials = await getFilteredOfficials({ state: stateAbbr });

  if (officials.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Link href="/states" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Back to map
          </Link>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">{stateName}</h1>
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No elected officials found for {stateName} yet.</p>
          </div>
        </div>
      </div>
    );
  }

  // Group by chamber in seniority order
  const grouped = new Map<string, typeof officials>();
  for (const chamber of chamberOrder) {
    const inChamber = officials.filter((o) => o.chamber === chamber);
    if (inChamber.length > 0) {
      grouped.set(chamber, inChamber.sort((a, b) => a.name.localeCompare(b.name)));
    }
  }

  // Catch any officials with unknown chamber values
  const knownChambers = new Set(chamberOrder);
  const other = officials.filter((o) => !knownChambers.has(o.chamber));
  if (other.length > 0) {
    grouped.set("other", other.sort((a, b) => a.name.localeCompare(b.name)));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/states" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to map
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">{stateName}</h1>
        <p className="mb-8 text-gray-600">
          {officials.length} elected official{officials.length !== 1 ? "s" : ""} on AskThem
        </p>

        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([chamber, chamberOfficials]) => (
            <div key={chamber}>
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                {chamberLabels[chamber] || "Other"}
              </h2>
              <div className="space-y-3">
                {chamberOfficials.map((official) => (
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
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{official.name}</p>
                      <p className="text-sm text-gray-500">
                        {official.title}
                        {official.party && (
                          <span>
                            {" "}&middot;{" "}
                            {official.party === "D" ? "Democrat" : official.party === "R" ? "Republican" : official.party}
                          </span>
                        )}
                        {official.district && (
                          <span> &middot; {official.district}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-sm text-indigo-600">
                      View &rarr;
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
