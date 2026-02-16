"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { US_STATES } from "@/lib/types";

const stateEntries = Object.entries(US_STATES)
  .filter(([abbr]) => !["PR", "GU", "VI", "AS", "MP"].includes(abbr))
  .sort(([, a], [, b]) => a.localeCompare(b));

export function StateExplorer() {
  const [selectedState, setSelectedState] = useState("");
  const router = useRouter();

  function handleGo() {
    if (selectedState) {
      router.push(`/questions?state=${selectedState}`);
    }
  }

  return (
    <section className="border-b border-gray-200 bg-white px-4 py-10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          See what people in your state are asking
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Browse questions from constituents near you, then sign in to add your voice.
        </p>

        <div className="mx-auto flex max-w-md items-center gap-3">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          >
            <option value="">Select your state...</option>
            {stateEntries.map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
          <button
            onClick={handleGo}
            disabled={!selectedState}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Browse
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link
            href="/auth/signin"
            className="font-medium text-indigo-600 hover:text-indigo-800"
          >
            Sign in to ask your own question
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/states"
            className="text-gray-500 hover:text-gray-700"
          >
            Explore the map
          </Link>
        </div>
      </div>
    </section>
  );
}
