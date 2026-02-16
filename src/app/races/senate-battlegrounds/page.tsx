import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Senate Battlegrounds 2026 - AskThem",
  description:
    "Competitive U.S. Senate races in the 2026 midterm cycle, rated by the Cook Political Report.",
};

// ── Cook Political Report Senate Race Ratings ───────────────────────
// According to Cook Political Report, as of Feb. 16, 2026
// Source: https://www.cookpolitical.com/ratings/senate-race-ratings
//
// 35 seats up in 2026 (23 R, 12 D + 2 special elections)
// Democrats need net +4 to retake majority.

const LIKELY_D = [
  "MN: OPEN",
];

const LEAN_D = [
  "NH: OPEN",
];

const TOSS_UP = [
  "GA: Ossoff",
  "ME: Collins",
  "MI: OPEN",
  "NC: OPEN",
];

const LEAN_R = [
  "AK: Sullivan",
  "OH: Husted",
];

const LIKELY_R = [
  "IA: OPEN",
  "TX: Cornyn",
];

type RatingCategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  races: string[];
};

const RATINGS: RatingCategory[] = [
  {
    label: "Likely D",
    color: "text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    races: LIKELY_D,
  },
  {
    label: "Lean D",
    color: "text-blue-700",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-100",
    races: LEAN_D,
  },
  {
    label: "Toss-Up",
    color: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    races: TOSS_UP,
  },
  {
    label: "Lean R",
    color: "text-red-700",
    bgColor: "bg-red-50/50",
    borderColor: "border-red-100",
    races: LEAN_R,
  },
  {
    label: "Likely R",
    color: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    races: LIKELY_R,
  },
];

export default function SenateBattlegroundsPage() {
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
          Senate Battlegrounds 2026
        </h1>
        <p className="mb-2 text-gray-600">
          {totalCompetitive} competitive U.S. Senate races in the 2026 midterm
          cycle. Democrats need a net gain of 4 seats to retake the majority.
        </p>
        <p className="mb-6 text-sm text-gray-500">
          According to{" "}
          <a
            href="https://www.cookpolitical.com/ratings/senate-race-ratings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            Cook Political Report
          </a>
          , as of Feb. 16, 2026.
        </p>

        {/* Context box */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            2026 Senate Landscape
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">35</p>
              <p className="text-xs text-gray-500">Seats Up</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">23</p>
              <p className="text-xs text-gray-500">GOP-Held</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">12</p>
              <p className="text-xs text-gray-500">Dem-Held</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            Includes special elections in Florida and Ohio. Current Senate: 53 R, 47 D.
          </p>
        </div>

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
                  ({rating.races.length} race
                  {rating.races.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <div className="space-y-2">
                {rating.races.map((race) => (
                  <div
                    key={race}
                    className="rounded bg-white/70 px-3 py-2 text-sm text-gray-800"
                  >
                    {race}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Remaining seats note */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              Not shown above:
            </span>{" "}
            The remaining {35 - totalCompetitive} seats up in 2026 are rated
            Solid D or Solid R by the Cook Political Report and are not
            considered competitive.
          </p>
        </div>

        {/* Attribution */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-center text-xs text-gray-500">
          <p>
            Ratings from the{" "}
            <a
              href="https://www.cookpolitical.com/ratings/senate-race-ratings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              Cook Political Report
            </a>{" "}
            as of Feb. 16, 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
