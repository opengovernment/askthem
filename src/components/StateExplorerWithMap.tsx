"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { statePathData } from "@/lib/state-paths";
import { US_STATES } from "@/lib/types";

const stateEntries = Object.entries(US_STATES)
  .filter(([abbr]) => !["PR", "GU", "VI", "AS", "MP"].includes(abbr))
  .sort(([, a], [, b]) => a.localeCompare(b));

interface StateExplorerWithMapProps {
  activeStates: string[];
}

export function StateExplorerWithMap({ activeStates }: StateExplorerWithMapProps) {
  const [selectedState, setSelectedState] = useState("");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const router = useRouter();
  const activeSet = new Set(activeStates);

  function handleGo() {
    if (selectedState) {
      router.push(`/questions?state=${selectedState}`);
    }
  }

  return (
    <section className="border-b border-gray-200 bg-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          See what people in your state are asking
        </h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          Browse questions from constituents near you, then sign in to add your voice.
        </p>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          {/* Map */}
          <div className="w-full lg:w-2/3">
            <Link href="/states">
              {hoveredState && (
                <div className="mb-3 text-center">
                  <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
                    {US_STATES[hoveredState] || hoveredState}
                  </span>
                </div>
              )}
              {!hoveredState && (
                <div className="mb-3 text-center">
                  <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-500">
                    Hover over a state
                  </span>
                </div>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 960 600"
                className="mx-auto w-full"
                role="img"
                aria-label="Map of the United States"
              >
                {Object.entries(statePathData).map(([abbr, { d }]) => {
                  const isActive = activeSet.has(abbr);
                  const isHovered = hoveredState === abbr;

                  return (
                    <path
                      key={abbr}
                      d={d}
                      className={`stroke-white transition-colors duration-150 ${
                        isHovered
                          ? "fill-indigo-500"
                          : isActive
                            ? "fill-indigo-300 hover:fill-indigo-500"
                            : "fill-gray-200"
                      }`}
                      strokeWidth={1}
                      onMouseEnter={() => setHoveredState(abbr)}
                      onMouseLeave={() => setHoveredState(null)}
                    />
                  );
                })}
              </svg>
            </Link>
          </div>

          {/* State dropdown */}
          <div className="w-full lg:w-1/3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Choose your state
              </h3>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
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
                className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Browse Questions
              </button>
              <div className="mt-4 text-center text-sm">
                <Link
                  href="/states"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Explore all states &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
