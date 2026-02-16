import { USMap } from "@/components/USMap";
import { getActiveStates } from "@/lib/queries";
import Link from "next/link";
import { US_STATES } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore by State - AskThem",
  description: "Browse elected officials by state. Click on a state to see its U.S. senators, representatives, and state officials.",
};

export default async function StatesPage() {
  const activeStates = await getActiveStates();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to home
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Explore by State</h1>
        <p className="mb-8 text-gray-600">
          Click on a state to browse its elected officials and see questions directed to them.
        </p>

        <USMap activeStates={activeStates} />

        {/* Text list of states as a fallback / quick navigation */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">All States</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
            {activeStates.map((abbr) => (
              <Link
                key={abbr}
                href={`/states/${abbr}`}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {US_STATES[abbr] || abbr}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
