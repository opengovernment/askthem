"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { US_STATES } from "@/lib/types";

interface OfficialFiltersProps {
  activeStates: string[];
}

export function OfficialFilters({ activeStates }: OfficialFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentState = searchParams.get("state") || "";
  const currentChamber = searchParams.get("chamber") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/officials?${params.toString()}`);
    },
    [router, searchParams],
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  }

  const hasFilters = currentSearch || currentState || currentChamber;

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, state, or district..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-indigo-600 p-1.5 text-white hover:bg-indigo-700"
          aria-label="Search officials"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
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

        <select
          value={currentChamber}
          onChange={(e) => updateParam("chamber", e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        >
          <option value="">All Chambers</option>
          <option value="senate">U.S. Senate</option>
          <option value="house">U.S. House</option>
          <option value="state_senate">State Senate</option>
          <option value="state_house">State House</option>
          <option value="local">Local</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              setSearchInput("");
              router.push("/officials");
            }}
            className="text-sm text-gray-500 hover:text-indigo-600"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
