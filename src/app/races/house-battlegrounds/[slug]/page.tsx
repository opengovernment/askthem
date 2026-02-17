import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findHouseRace, allHouseSlugs } from "../data";

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

export default async function HouseRacePage({ params }: Props) {
  const { slug } = await params;
  const result = findHouseRace(slug);
  if (!result) notFound();

  const { race, rating } = result;

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

        {/* Candidates placeholder */}
        <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Candidates
          </h2>
          <p className="text-sm text-gray-500">
            Candidate information will be available here once data is loaded.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded bg-gray-50 p-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded bg-gray-50 p-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>
          </div>
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
