import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "House Battlegrounds 2026 - AskThem",
  description:
    "Competitive U.S. House districts in the 2026 midterm cycle, rated by the Cook Political Report.",
};

// ── Cook Political Report House Race Ratings ────────────────────────
// According to Cook Political Report, as of Feb. 16, 2026
// Source: https://www.cookpolitical.com/ratings/house-race-ratings

const LIKELY_D = [
  "CA-09 (Harder, D)",
  "CA-13 (Gray, D)",
  "CO-08 (Caraveo, D)",
  "IL-17 (Sorensen, D)",
  "ME-02 (Golden, D)",
  "MI-07 (Slotkin, D - Open)",
  "NM-02 (Vasquez, D)",
  "NY-03 (Suozzi, D)",
  "NY-04 (Gillen, D)",
  "NY-19 (Riley, D)",
  "PA-07 (Wild, D)",
  "PA-08 (Cartwright, D)",
  "WA-03 (Gluesenkamp Perez, D)",
];

const LEAN_D = [
  "AK-01 (Peltola, D)",
  "CA-21 (Aguilar, D - Open)",
  "NC-01 (Davis, D)",
  "OH-09 (Kaptur, D)",
  "TX-34 (Gonzalez, D)",
];

const TOSS_UP = [
  "AZ-01 (Schweikert, R)",
  "AZ-06 (Ciscomani, R)",
  "CO-03 (Evans, R)",
  "IA-01 (Miller-Meeks, R)",
  "IA-03 (Nunn, R)",
  "MI-08 (Barrett, R)",
  "NE-02 (Bacon, R)",
  "NJ-07 (Kean Jr., R)",
  "NY-17 (Lawler, R)",
  "NY-22 (Williams, R)",
  "OH-13 (Sykes, D)",
  "PA-01 (Fitzpatrick, R)",
  "PA-07 (Mackenzie, R - Open)",
  "PA-10 (Perry, R)",
  "TX-15 (De La Cruz, R)",
  "VA-02 (Kiggans, R)",
  "WI-01 (Steil, R)",
  "CA-45 (Steel, R)",
];

const LEAN_R = [
  "CA-22 (Valadao, R)",
  "CO-05 (Crank, R)",
  "FL-13 (Luna, R)",
  "IN-01 (Mrvan, D - Open)",
  "MN-01 (Finstad, R)",
  "MT-01 (Zinke, R)",
  "NC-14 (Jackson, R - Open)",
  "NY-11 (Malliotakis, R)",
  "SC-01 (Mace, R)",
  "TX-23 (Gonzales, R)",
  "VA-05 (Good, R - Open)",
  "WI-03 (Van Orden, R)",
];

const LIKELY_R = [
  "CA-27 (Garcia, R)",
  "FL-07 (Fry, R)",
  "FL-28 (Gimenez, R)",
  "IL-13 (Budzinski, D - Open)",
  "KS-03 (Adkins, R)",
  "MI-05 (Huizenga, R - Open)",
  "MN-02 (Craig, D - Open)",
  "NE-01 (Flood, R)",
  "NY-01 (LaLota, R)",
  "NY-21 (Stefanik, R - Open)",
  "OH-01 (Wenstrup, R - Open)",
  "OR-05 (Chavez-DeRemer, R - Open)",
  "TN-05 (Ogles, R)",
  "TX-24 (Van Duyne, R)",
  "VA-07 (Spanberger, D - Open)",
  "WA-08 (Kim, D - Open)",
];

type RatingCategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  districts: string[];
};

const RATINGS: RatingCategory[] = [
  {
    label: "Likely D",
    color: "text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    districts: LIKELY_D,
  },
  {
    label: "Lean D",
    color: "text-blue-700",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-100",
    districts: LEAN_D,
  },
  {
    label: "Toss-Up",
    color: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    districts: TOSS_UP,
  },
  {
    label: "Lean R",
    color: "text-red-700",
    bgColor: "bg-red-50/50",
    borderColor: "border-red-100",
    districts: LEAN_R,
  },
  {
    label: "Likely R",
    color: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    districts: LIKELY_R,
  },
];

export default function HouseBattlegroundsPage() {
  const totalCompetitive = RATINGS.reduce((sum, r) => sum + r.districts.length, 0);

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
                {rating.districts.length}
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
                  ({rating.districts.length} district
                  {rating.districts.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {rating.districts.map((district) => (
                  <div
                    key={district}
                    className="rounded bg-white/70 px-3 py-2 text-sm text-gray-800"
                  >
                    {district}
                  </div>
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
