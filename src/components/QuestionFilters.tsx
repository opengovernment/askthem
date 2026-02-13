"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { US_STATES } from "@/lib/types";

interface QuestionFiltersProps {
  tags: string[];
  officials: { id: string; name: string }[];
  activeStates: string[];
  districts: string[];
}

export function QuestionFilters({ tags, officials, activeStates, districts }: QuestionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "votes";
  const currentTag = searchParams.get("tag") || "";
  const currentOfficial = searchParams.get("official") || "";
  const currentState = searchParams.get("state") || "";
  const currentDistrict = searchParams.get("district") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // When state changes, clear district since it may no longer be valid
      if (key === "state") {
        params.delete("district");
      }
      router.push(`/questions?${params.toString()}`);
    },
    [router, searchParams],
  );

  const hasFilters = currentTag || currentOfficial || currentState || currentDistrict || currentSort !== "votes";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="votes">Most Votes</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>

      <select
        value={currentTag}
        onChange={(e) => updateParam("tag", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="">All Topics</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <select
        value={currentOfficial}
        onChange={(e) => updateParam("official", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="">All Officials</option>
        {officials.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      <select
        value={currentState}
        onChange={(e) => updateParam("state", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="">All States</option>
        {activeStates.map((abbr) => (
          <option key={abbr} value={abbr}>
            {US_STATES[abbr] || abbr}
          </option>
        ))}
      </select>

      {districts.length > 0 && (
        <select
          value={currentDistrict}
          onChange={(e) => updateParam("district", e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        >
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button
          onClick={() => router.push("/questions")}
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
