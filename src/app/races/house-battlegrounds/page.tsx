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
  "CA-21: Costa",
  "IN-01: Mrvan",
  "MN-02: OPEN (Craig)",
  "NH-01: OPEN (Pappas)",
  "NH-02: Goodlander",
  "NV-01: Titus",
  "NV-04: Horsford",
  "OR-05: Bynum",
];

const LEAN_D = [
  "CA-13: Gray",
  "CA-45: Tran",
  "FL-23: Moskowitz",
  "MI-08: McDonald Rivet",
  "NE-02: OPEN (Bacon)",
  "NJ-09: Pou",
  "NM-02: Vasquez",
  "NV-03: Lee",
  "NY-03: Suozzi",
  "NY-04: Gillen",
  "NY-19: Riley",
  "OH-13: Sykes",
  "TX-28: Cuellar",
  "VA-07: Vindman",
];

const TOSS_UP = [
  "AZ-01: OPEN (Schweikert)",
  "AZ-06: Ciscomani",
  "CA-22: Valadao",
  "CA-48: Issa",
  "CO-08: Evans",
  "IA-01: Miller-Meeks",
  "IA-03: Nunn",
  "MI-07: Barrett",
  "NJ-07: Kean Jr.",
  "NY-17: Lawler",
  "OH-01: Landsman",
  "OH-09: Kaptur",
  "PA-07: Mackenzie",
  "PA-10: Perry",
  "TX-34: Gonzalez",
  "VA-02: Kiggans",
  "WA-03: Perez",
  "WI-03: Van Orden",
];

const LEAN_R = [
  "MI-10: OPEN (James)",
  "NC-01: Davis",
  "PA-08: Bresnahan",
  "VA-01: Wittman",
];

const LIKELY_R = [
  "AK-AL: Begich III",
  "AZ-02: Crane",
  "CO-03: Hurd",
  "CO-05: Crank",
  "FL-07: Mills",
  "FL-13: Luna",
  "IA-02: OPEN (Hinson)",
  "ME-02: OPEN (Golden)",
  "MI-04: Huizenga",
  "MT-01: Zinke",
  "NC-11: Edwards",
  "PA-01: Fitzpatrick",
  "TN-05: Ogles",
  "TX-15: De La Cruz",
  "TX-35: OPEN (Casar)",
  "WI-01: Steil",
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
