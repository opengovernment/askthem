import { getAllOfficials } from "@/lib/queries";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elected Officials - AskThem",
  description: "Browse elected officials and see what questions constituents are asking them.",
};

export const dynamic = "force-dynamic";

export default async function OfficialsPage() {
  const officials = await getAllOfficials();

  // Group by chamber for better browsing
  const chambers: Record<string, typeof officials> = {};
  for (const o of officials) {
    const label = chamberLabel(o.chamber);
    if (!chambers[label]) chambers[label] = [];
    chambers[label].push(o);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Elected Officials</h1>
        <p className="mb-8 text-gray-600">
          Browse officials and see what questions constituents are asking them.
        </p>

        {Object.entries(chambers).map(([label, group]) => (
          <div key={label} className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">{label}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.map((official) => (
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
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function chamberLabel(chamber: string): string {
  const labels: Record<string, string> = {
    senate: "U.S. Senate",
    house: "U.S. House of Representatives",
    state_senate: "State Senate",
    state_house: "State House",
    local: "Local Officials",
  };
  return labels[chamber] || chamber;
}
