"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/types";

// Reverse lookup: state name → abbreviation
const stateNameToAbbr: Record<string, string> = {};
for (const [abbr, name] of Object.entries(US_STATES)) {
  stateNameToAbbr[name.toLowerCase()] = abbr;
  stateNameToAbbr[abbr.toLowerCase()] = abbr;
}

// Common abbreviations / variations
const STATE_ALIASES: Record<string, string> = {
  "calif": "CA", "cali": "CA", "mass": "MA", "wash": "WA",
  "minn": "MN", "conn": "CT", "penn": "PA", "penna": "PA",
  "tenn": "TN", "okla": "OK", "nebr": "NE", "mich": "MI",
  "wisc": "WI", "mont": "MT", "ore": "OR", "ariz": "AZ",
  "colo": "CO", "fla": "FL", "ill": "IL", "ind": "IN",
  "miss": "MS", "tex": "TX", "wis": "WI", "va": "VA",
  "n.y.": "NY", "n.j.": "NJ", "n.c.": "NC", "n.d.": "ND",
  "s.c.": "SC", "s.d.": "SD", "w.va.": "WV", "n.m.": "NM",
  "n.h.": "NH", "r.i.": "RI", "d.c.": "DC",
};

function extractState(address: string): string | null {
  const normalized = address.trim();

  // Try to find a state abbreviation or name in the address
  // Common patterns: "City, ST ZIP", "City, State ZIP", "City, ST"
  const parts = normalized.split(",").map((p) => p.trim());

  for (let i = parts.length - 1; i >= 0; i--) {
    const segment = parts[i].trim();
    // Try "ST 12345" or "State 12345" or just "ST" or "State"
    const withoutZip = segment.replace(/\s*\d{5}(-\d{4})?$/, "").trim();

    if (withoutZip) {
      const lower = withoutZip.toLowerCase();
      if (stateNameToAbbr[lower]) return stateNameToAbbr[lower];
      if (STATE_ALIASES[lower]) return STATE_ALIASES[lower];
      // Check if any full state name is contained
      for (const [name, abbr] of Object.entries(stateNameToAbbr)) {
        if (name.length > 2 && lower === name) return abbr;
      }
    }
  }

  // Fallback: scan entire string for 2-letter state code preceded by comma or space
  const abbrMatch = normalized.match(/[\s,]([A-Z]{2})\s*\d{0,5}/);
  if (abbrMatch && stateNameToAbbr[abbrMatch[1].toLowerCase()]) {
    return stateNameToAbbr[abbrMatch[1].toLowerCase()];
  }

  return null;
}

export function AddressSearchBar() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!address.trim()) return;

    const state = extractState(address);
    if (state) {
      router.push(`/questions?state=${state}`);
    } else {
      setError("We couldn't detect your state. Try including your city and state, e.g. \"123 Main St, Springfield, IL\"");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setError(""); }}
          placeholder="Enter your address to see questions near you..."
          autoComplete="street-address"
          className="w-full rounded-full border border-gray-300 bg-white px-6 py-4 pr-14 text-lg text-gray-900 shadow-sm transition-shadow placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-orange-600 p-2.5 text-white transition-colors hover:bg-orange-700"
          aria-label="Find questions near me"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {error && (
        <p className="mt-2 text-center text-sm text-orange-200">{error}</p>
      )}
    </form>
  );
}
