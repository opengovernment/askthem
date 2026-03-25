import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findHouseRace, allHouseSlugs, CANDIDATES } from "../data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return allHouseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = findHouseRace(slug);
  if (!result) return { title: "Race Not Found - AskThem" };
  const { race } = result;
  return {
    title: `${race.district} - House Battlegrounds 2026 - AskThem`,
    description: `2026 U.S. House race for ${race.district}.`,
  };
}

const partyColor: Record<string, string> = {
  D: "bg-blue-100 text-blue-800",
  R: "bg-red-100 text-red-800",
};

const partyBorder: Record<string, string> = {
  D: "border-l-blue-500",
  R: "border-l-red-500",
};

export default async function HouseRacePage({ params }: Props) {
  const { slug } = await params;
  const result = findHouseRace(slug);
  if (!result) notFound();

  const { race, rating } = result;
  const candidates = CANDIDATES[race.slug] ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/races/house-battlegrounds"
          className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; House Battlegrounds
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {race.district}
        </h1>
        <p className="mb-6 text-gray-600">
          2026 U.S. House Race &middot; Cook Rating:{" "}
          <span className="font-semibold">{rating}</span>
          {race.isOpen && (
            <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              OPEN SEAT
            </span>
          )}
        </p>

        {/* Incumbent / departing member */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            {race.isOpen ? "Departing Member" : "Incumbent"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-400">
              {race.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{race.name}</p>
              <p className="text-sm text-gray-500">{race.district}</p>
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Candidates
          </h2>
          {candidates.length > 0 ? (
            <div className="space-y-3">
              {candidates.map((c) => (
                <div
                  key={c.name}
                  className={`flex items-center gap-4 rounded-lg border-l-4 ${partyBorder[c.party] ?? "border-l-gray-300"} bg-gray-50 p-4`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${partyColor[c.party] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${partyColor[c.party] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {c.party === "D" ? "Democrat" : c.party === "R" ? "Republican" : c.party}
                      </span>
                      {c.isIncumbent && (
                        <span className="text-xs text-gray-500">Incumbent</span>
                      )}
                    </div>
                    {c.bio && (
                      <p className="mt-1 text-sm text-gray-600">{c.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Candidate information will be updated as filings are confirmed.
            </p>
          )}
        </div>

        {/* Polling placeholder */}
        <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Polling</h2>
          <p className="text-sm text-gray-500">
            Polling data will appear here when available.
          </p>
        </div>

        {/* Fundraising placeholder */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Fundraising
          </h2>
          <p className="text-sm text-gray-500">
            Campaign finance data will appear here when available.
          </p>
        </div>

        {/* Attribution */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Cook Political Report rating as of Feb. 16, 2026.
        </div>
      </div>
    </div>
  );
}
