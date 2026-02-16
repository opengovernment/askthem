import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2026 Races - AskThem",
  description:
    "Track competitive 2026 House and Senate battleground races, with ratings from the Cook Political Report.",
};

export default function RacesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">2026 Races</h1>
        <p className="mb-8 text-gray-600">
          Track the most competitive House and Senate races in the 2026 midterm
          cycle. Ratings sourced from the Cook Political Report.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* House */}
          <Link
            href="/races/house-battlegrounds"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="mb-1 text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
              House Battlegrounds
            </h2>
            <p className="text-sm text-gray-600">
              The most competitive U.S. House districts in the 2026 cycle, from
              Likely D through Toss-Up to Likely R.
            </p>
          </Link>

          {/* Senate */}
          <Link
            href="/races/senate-battlegrounds"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 group-hover:bg-red-200 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <h2 className="mb-1 text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
              Senate Battlegrounds
            </h2>
            <p className="text-sm text-gray-600">
              Competitive U.S. Senate races in the 2026 cycle, with 35 seats up
              including two special elections.
            </p>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Ratings from the{" "}
          <a
            href="https://www.cookpolitical.com/ratings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 underline hover:text-indigo-600"
          >
            Cook Political Report
          </a>
          .
        </p>
      </div>
    </div>
  );
}
