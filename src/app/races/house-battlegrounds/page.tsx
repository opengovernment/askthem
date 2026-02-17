import Link from "next/link";
import type { Metadata } from "next";
import { RATINGS } from "./data";

export const metadata: Metadata = {
  title: "House Battlegrounds 2026 - AskThem",
  description:
    "Competitive U.S. House districts in the 2026 midterm cycle, rated by the Cook Political Report.",
};

export default function HouseBattlegroundsPage() {
  const totalCompetitive = RATINGS.reduce((sum, r) => sum + r.races.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/races"
          className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; All Races
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          House Battlegrounds 2026
        </h1>
        <p className="mb-2 text-gray-600">
          The {totalCompetitive} most competitive U.S. House districts in the
          2026 midterm cycle, rated from Likely D to Likely R.
        </p>
        <p className="mb-6 text-sm text-gray-500">
          According to{" "}
          <a
            href="https://www.cookpolitical.com/ratings/house-race-ratings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            Cook Political Report
          </a>
          , as of Feb. 16, 2026.
        </p>

        {/* Summary bar */}
        <div className="mb-8 grid grid-cols-5 gap-1 overflow-hidden rounded-lg">
          {RATINGS.map((rating) => (
            <div
              key={rating.label}
              className={`p-3 text-center ${rating.bgColor}`}
            >
              <p className={`text-lg font-bold ${rating.color}`}>
                {rating.races.length}
              </p>
              <p className={`text-xs font-medium ${rating.color}`}>
                {rating.label}
              </p>
            </div>
          ))}
        </div>

        {/* Rating sections */}
        <div className="space-y-6">
          {RATINGS.map((rating) => (
            <div
              key={rating.label}
              className={`rounded-lg border ${rating.borderColor} ${rating.bgColor} p-5`}
            >
              <h2 className={`mb-3 text-lg font-semibold ${rating.color}`}>
                {rating.label}{" "}
                <span className="text-sm font-normal opacity-75">
                  ({rating.races.length} district
                  {rating.races.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {rating.races.map((race) => (
                  <Link
                    key={race.slug}
                    href={`/races/house-battlegrounds/${race.slug}`}
                    className="rounded bg-white/70 px-3 py-2 text-sm text-gray-800 transition-colors hover:bg-white hover:shadow-sm"
                  >
                    {race.district}: {race.isOpen ? `OPEN (${race.name})` : race.name}
                    <span className="ml-1 text-indigo-400">&rarr;</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Attribution */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 text-center text-xs text-gray-500">
          <p>
            Ratings from the{" "}
            <a
              href="https://www.cookpolitical.com/ratings/house-race-ratings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              Cook Political Report
            </a>{" "}
            as of Feb. 16, 2026. &ldquo;Solid D&rdquo; and &ldquo;Solid
            R&rdquo; districts are not shown.
          </p>
        </div>
      </div>
    </div>
  );
}
