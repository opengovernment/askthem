"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { statePathData } from "@/lib/state-paths";
import { US_STATES } from "@/lib/types";

// States with officials, passed from server
interface USMapProps {
  activeStates: string[];
}

export function USMap({ activeStates }: USMapProps) {
  const router = useRouter();
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const activeSet = new Set(activeStates);

  return (
    <div>
      {hoveredState && (
        <div className="mb-4 text-center">
          <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            {US_STATES[hoveredState] || hoveredState}
          </span>
        </div>
      )}
      {!hoveredState && (
        <div className="mb-4 text-center">
          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-500">
            Hover over a state to see its name
          </span>
        </div>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 960 600"
        className="mx-auto w-full max-w-4xl"
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
                  ? "cursor-pointer fill-indigo-500"
                  : isActive
                    ? "cursor-pointer fill-indigo-300 hover:fill-indigo-500"
                    : "fill-gray-200"
              }`}
              strokeWidth={1}
              onMouseEnter={() => setHoveredState(abbr)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => {
                if (isActive) {
                  router.push(`/states/${abbr}`);
                }
              }}
              role="button"
              tabIndex={isActive ? 0 : undefined}
              aria-label={US_STATES[abbr] || abbr}
              onKeyDown={(e) => {
                if (isActive && (e.key === "Enter" || e.key === " ")) {
                  router.push(`/states/${abbr}`);
                }
              }}
            />
          );
        })}
      </svg>
      <p className="mt-4 text-center text-sm text-gray-500">
        Click on a highlighted state to see its elected officials.
        {activeStates.length > 0 && (
          <span className="ml-1">
            {activeStates.length} state{activeStates.length !== 1 ? "s" : ""} with officials.
          </span>
        )}
      </p>
    </div>
  );
}
