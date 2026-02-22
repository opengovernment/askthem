"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { statePathData } from "@/lib/state-paths";
import { US_STATES } from "@/lib/types";

// Approximate SVG centroids for each state within the 960x600 viewBox
const stateCentroids: Record<string, { x: number; y: number }> = {
  AL: { x: 672, y: 420 },
  AK: { x: 170, y: 530 },
  AZ: { x: 185, y: 385 },
  AR: { x: 558, y: 385 },
  CA: { x: 80, y: 320 },
  CO: { x: 310, y: 280 },
  CT: { x: 862, y: 185 },
  DE: { x: 830, y: 255 },
  DC: { x: 805, y: 260 },
  FL: { x: 730, y: 490 },
  GA: { x: 710, y: 415 },
  HI: { x: 275, y: 545 },
  ID: { x: 190, y: 140 },
  IL: { x: 585, y: 280 },
  IN: { x: 635, y: 275 },
  IA: { x: 520, y: 220 },
  KS: { x: 440, y: 295 },
  KY: { x: 670, y: 315 },
  LA: { x: 565, y: 465 },
  ME: { x: 890, y: 85 },
  MD: { x: 795, y: 260 },
  MA: { x: 875, y: 170 },
  MI: { x: 645, y: 170 },
  MN: { x: 495, y: 130 },
  MS: { x: 605, y: 430 },
  MO: { x: 545, y: 310 },
  MT: { x: 280, y: 95 },
  NE: { x: 420, y: 240 },
  NV: { x: 145, y: 265 },
  NH: { x: 870, y: 130 },
  NJ: { x: 840, y: 230 },
  NM: { x: 260, y: 385 },
  NY: { x: 820, y: 170 },
  NC: { x: 755, y: 345 },
  ND: { x: 420, y: 110 },
  OH: { x: 680, y: 250 },
  OK: { x: 450, y: 350 },
  OR: { x: 115, y: 130 },
  PA: { x: 790, y: 215 },
  RI: { x: 875, y: 190 },
  SC: { x: 735, y: 380 },
  SD: { x: 420, y: 170 },
  TN: { x: 650, y: 355 },
  TX: { x: 420, y: 430 },
  UT: { x: 225, y: 270 },
  VT: { x: 855, y: 120 },
  VA: { x: 770, y: 295 },
  WA: { x: 130, y: 60 },
  WV: { x: 735, y: 280 },
  WI: { x: 560, y: 155 },
  WY: { x: 290, y: 180 },
};

interface BubbleData {
  state: string;
  tags: string[];
  totalQuestions: number;
  totalUpvotes: number;
  topQuestion: string;
  topUpvotes: number;
}

interface VisualizeBubbleMapProps {
  data: BubbleData[];
}

// Tag color palette
const tagColors: Record<string, string> = {
  Healthcare: "#ef4444",
  Climate: "#22c55e",
  Immigration: "#f59e0b",
  Housing: "#8b5cf6",
  Education: "#3b82f6",
  Economy: "#f97316",
  "Voting Rights": "#ec4899",
  "Gun Violence": "#dc2626",
  Energy: "#eab308",
  Agriculture: "#16a34a",
};

function getTagColor(tag: string): string {
  return tagColors[tag] || "#6366f1";
}

export function VisualizeBubbleMap({ data }: VisualizeBubbleMapProps) {
  const router = useRouter();
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Scale bubble radius based on totalQuestions, sized to fit tag names
  const maxQuestions = Math.max(...data.map((d) => d.totalQuestions));
  const minRadius = 22;
  const maxRadius = 42;

  function getRadius(entry: BubbleData) {
    const sizeByQuestions = minRadius + (entry.totalQuestions / maxQuestions) * (maxRadius - minRadius);
    // Ensure the bubble is wide enough for the tag label
    const tagLen = entry.tags[0].length;
    const minForLabel = Math.max(minRadius, tagLen * 3.2 + 4);
    return Math.max(sizeByQuestions, minForLabel);
  }

  const hoveredData = data.find((d) => d.state === hoveredBubble);

  return (
    <div className="relative">
      {/* Tooltip */}
      {hoveredData && tooltipPos && (
        <div
          className="pointer-events-none absolute z-10 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          style={{
            left: `${tooltipPos.x}%`,
            top: `${tooltipPos.y}%`,
            transform: "translate(-50%, -110%)",
          }}
        >
          <p className="text-sm font-semibold text-gray-900">
            {US_STATES[hoveredData.state] || hoveredData.state}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {hoveredData.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: getTagColor(tag) }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-gray-600">
            {hoveredData.totalQuestions} questions &middot; {hoveredData.totalUpvotes.toLocaleString()} votes
          </p>
          <p className="mt-1 text-xs italic text-gray-500">
            &ldquo;{hoveredData.topQuestion}&rdquo;
          </p>
          <p className="mt-1.5 text-xs font-medium text-indigo-600">Click to explore &rarr;</p>
        </div>
      )}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 960 600"
        className="mx-auto w-full max-w-4xl"
        role="img"
        aria-label="Map of the United States showing trending issues"
      >
        {/* State paths (background map) */}
        {Object.entries(statePathData).map(([abbr, { d }]) => {
          const hasBubble = data.some((b) => b.state === abbr);
          return (
            <path
              key={abbr}
              d={d}
              className={`stroke-white ${
                hoveredBubble === abbr
                  ? "fill-indigo-200"
                  : hasBubble
                    ? "fill-gray-200"
                    : "fill-gray-100"
              }`}
              strokeWidth={1}
            />
          );
        })}

        {/* Bubbles */}
        {data.map((entry) => {
          const centroid = stateCentroids[entry.state];
          if (!centroid) return null;

          const radius = getRadius(entry);
          const primaryTag = entry.tags[0];
          const color = getTagColor(primaryTag);
          const isHovered = hoveredBubble === entry.state;

          return (
            <g
              key={entry.state}
              className="cursor-pointer"
              onMouseEnter={() => {
                setHoveredBubble(entry.state);
                const svgX = centroid.x / 960;
                const svgY = centroid.y / 600;
                setTooltipPos({ x: svgX * 100, y: svgY * 100 });
              }}
              onMouseLeave={() => {
                setHoveredBubble(null);
                setTooltipPos(null);
              }}
              onClick={() => {
                router.push(`/questions?sort=trending&state=${entry.state}`);
              }}
            >
              {/* Pulse animation ring */}
              <circle
                cx={centroid.x}
                cy={centroid.y}
                r={radius + 4}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                opacity={isHovered ? 0.6 : 0.2}
              />
              {/* Main bubble */}
              <circle
                cx={centroid.x}
                cy={centroid.y}
                r={isHovered ? radius + 3 : radius}
                fill={color}
                opacity={isHovered ? 0.85 : 0.6}
                className="transition-all duration-150"
              />
              {/* Issue area label */}
              <text
                x={centroid.x}
                y={centroid.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none fill-white text-[9px] font-bold"
              >
                {primaryTag}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-4 text-center text-sm text-gray-500">
        Click a bubble to see trending questions in that state. Bubble size reflects question volume; color indicates the top issue area.
      </p>

      {/* Color legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {Object.entries(tagColors).map(([tag, color]) => (
          <div key={tag} className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
