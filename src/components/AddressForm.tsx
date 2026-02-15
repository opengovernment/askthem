"use client";

import { useState } from "react";
import Link from "next/link";
import { US_STATES } from "@/lib/types";

interface MatchedOfficial {
  id: string;
  name: string;
  title: string;
  party: string;
  state: string;
  district: string | null;
  chamber: string;
}

export function AddressForm() {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [officials, setOfficials] = useState<MatchedOfficial[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !state || !zip.trim()) return;
    setIsSubmitting(true);
    setError("");
    setOfficials(null);

    try {
      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street: street.trim(),
          city: city.trim(),
          state,
          zip: zip.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOfficials(data.officials);
      } else {
        const data = await res.json();
        setError(data.error || "Could not look up your address. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const stateEntries = Object.entries(US_STATES).sort((a, b) =>
    a[1].localeCompare(b[1]),
  );

  // Chamber display labels
  const chamberLabels: Record<string, string> = {
    senate: "U.S. Senate",
    house: "U.S. House",
    state_exec: "State Executive",
    state_senate: "State Senate",
    state_house: "State House",
    local: "Local",
  };

  if (officials) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-8 w-8 text-green-600"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Registration Complete!
          </h1>
          <p className="mb-6 text-center text-gray-600">
            We found {officials.length} elected official{officials.length !== 1 ? "s" : ""} for your
            address. You can now ask them questions and sign petitions.
          </p>

          <div className="mb-8 space-y-3">
            {officials.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{o.name}</p>
                  <p className="text-sm text-gray-500">
                    {o.title} ({o.party})
                    {o.district ? ` \u2014 ${o.district}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {chamberLabels[o.chamber] ?? o.chamber}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link
              href="/ask"
              className="flex-1 rounded-full bg-indigo-600 px-6 py-3 text-center font-medium text-white hover:bg-indigo-700"
            >
              Ask a Question
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-full border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to home
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Your Registration</h1>
        <p className="mb-8 text-gray-600">
          Enter your home address so we can match you with your elected representatives at every
          level of government. This is required to ask questions and sign petitions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Street */}
          <div>
            <label htmlFor="street" className="mb-1.5 block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="123 Main St"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Springfield"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* State + Zip row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="mb-1.5 block text-sm font-medium text-gray-700">
                State
              </label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              >
                <option value="">Select state...</option>
                {stateEntries.map(([abbr, name]) => (
                  <option key={abbr} value={abbr}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="zip" className="mb-1.5 block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                id="zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="62701"
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !street.trim() || !city.trim() || !state || !zip.trim()}
            className="w-full rounded-full bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Looking up your officials..." : "Find My Officials"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Your address is used only to match you with your elected officials and is never shared.
        </p>
      </div>
    </div>
  );
}
