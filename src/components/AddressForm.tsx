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
  level: string | null;
  photoUrl: string | null;
}

// Federal levels — temporarily excluded from address results (only Groups can ask federal officials during beta)
const FEDERAL_LEVELS = ["NATIONAL_UPPER", "NATIONAL_LOWER"];

// Ordered sections from state → local (federal excluded during public beta)
const LEVEL_SECTIONS: { key: string; label: string; levels: string[] }[] = [
  { key: "state", label: "State", levels: ["STATE_EXEC", "STATE_UPPER", "STATE_LOWER"] },
  { key: "county", label: "County", levels: ["COUNTY"] },
  { key: "local", label: "Local", levels: ["LOCAL", "LOCAL_EXEC"] },
];

// Sub-labels within each section
const LEVEL_SUBLABELS: Record<string, string> = {
  NATIONAL_UPPER: "U.S. Senate",
  NATIONAL_LOWER: "U.S. House of Representatives",
  STATE_EXEC: "Statewide Officials",
  STATE_UPPER: "State Senate",
  STATE_LOWER: "State House / Assembly",
  COUNTY: "County",
  LOCAL: "Local Government",
  LOCAL_EXEC: "Local Executive",
};

// Fallback: infer level from chamber when level is null (e.g. older cached records)
const CHAMBER_TO_LEVEL: Record<string, string> = {
  senate: "NATIONAL_UPPER",
  house: "NATIONAL_LOWER",
  state_exec: "STATE_EXEC",
  state_senate: "STATE_UPPER",
  state_house: "STATE_LOWER",
  local: "LOCAL",
};

function effectiveLevel(o: MatchedOfficial): string {
  if (o.level) return o.level;
  return CHAMBER_TO_LEVEL[o.chamber] ?? "LOCAL";
}

// Title-based priority for sorting within a group (lower = higher rank)
function titlePriority(title: string): number {
  const t = title.toLowerCase();
  // Federal
  if (t.includes("president") && !t.includes("vice") && !t.includes("borough")) return 0;
  if (t.includes("vice president")) return 1;
  // State executive — check lieutenant/lt before governor
  if (t.includes("lieutenant governor") || t.includes("lt. governor")) return 1;
  if (t.includes("governor")) return 0;
  if (t.includes("attorney general")) return 2;
  if (t.includes("secretary of state")) return 3;
  if (t.includes("comptroller") && !t.includes("city")) return 4;
  if (t.includes("treasurer")) return 5;
  // Local executive
  if (t.includes("mayor")) return 0;
  if (t.includes("borough president")) return 1;
  if (t.includes("city comptroller")) return 2;
  if (t.includes("public advocate")) return 3;
  if (t.includes("district attorney")) return 4;
  // Legislative
  if (t.includes("senator") || t.includes("senate")) return 10;
  if (t.includes("representative") || t.includes("assembly") || t.includes("delegate")) return 20;
  if (t.includes("council")) return 30;
  return 50;
}

function groupOfficials(officials: MatchedOfficial[]) {
  const sections: { key: string; label: string; groups: { sublabel: string; officials: MatchedOfficial[] }[] }[] = [];

  for (const section of LEVEL_SECTIONS) {
    const groups: { sublabel: string; officials: MatchedOfficial[] }[] = [];

    for (const level of section.levels) {
      const matching = officials.filter((o) => effectiveLevel(o) === level);
      if (matching.length > 0) {
        // Sort by title hierarchy, then alphabetically within same priority
        matching.sort((a, b) => {
          const pa = titlePriority(a.title);
          const pb = titlePriority(b.title);
          if (pa !== pb) return pa - pb;
          return a.name.localeCompare(b.name);
        });
        groups.push({ sublabel: LEVEL_SUBLABELS[level] ?? level, officials: matching });
      }
    }

    if (groups.length > 0) {
      sections.push({ key: section.key, label: section.label, groups });
    }
  }

  // Catch any officials with unexpected levels
  const knownLevels = LEVEL_SECTIONS.flatMap((s) => s.levels);
  const uncategorized = officials.filter((o) => !knownLevels.includes(effectiveLevel(o)));
  if (uncategorized.length > 0) {
    uncategorized.sort((a, b) => titlePriority(a.title) - titlePriority(b.title));
    sections.push({
      key: "other",
      label: "Other",
      groups: [{ sublabel: "Other Officials", officials: uncategorized }],
    });
  }

  return sections;
}

interface AddressFormProps {
  /** If the user already has a name (e.g. from Google OAuth), pass it here. When null, the form collects a name. */
  userName?: string | null;
}

export function AddressForm({ userName }: AddressFormProps) {
  const [displayName, setDisplayName] = useState(userName ?? "");
  const needsName = !userName;
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [officials, setOfficials] = useState<MatchedOfficial[] | null>(null);

  // Policy agreement step
  const [showPolicies, setShowPolicies] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedComments, setAgreedComments] = useState(false);

  function handleAddressContinue(e: React.FormEvent) {
    e.preventDefault();
    if (needsName && !displayName.trim()) return;
    if (!street.trim() || !city.trim() || !state || !zip.trim()) return;
    setShowPolicies(true);
  }

  async function handlePoliciesSubmit() {
    if (!agreedTerms || !agreedPrivacy || !agreedComments) return;
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
          policiesAccepted: true,
          ...(needsName && displayName.trim() ? { name: displayName.trim() } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOfficials(data.officials);
      } else {
        const data = await res.json();
        setError(data.error || "Could not look up your address. Please try again.");
        // Go back to address form so the user can fix errors
        setShowPolicies(false);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setShowPolicies(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const stateEntries = Object.entries(US_STATES).sort((a, b) =>
    a[1].localeCompare(b[1]),
  );

  // Exclude federal officials from address results (only Groups can ask them during beta)
  const nonFederalOfficials = officials
    ? officials.filter((o) => !FEDERAL_LEVELS.includes(effectiveLevel(o)))
    : [];
  const sections = officials ? groupOfficials(nonFederalOfficials) : [];

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
            Welcome!
          </h1>
          <p className="mb-2 text-center text-gray-600">
            We found {nonFederalOfficials.length} elected official{nonFederalOfficials.length !== 1 ? "s" : ""} for your
            address. The first thing most people do is ask a question to one of your elected
            officials about something that matters to you personally.
          </p>
          <p className="mb-6 text-center text-gray-600">
            Then, you can browse to see what questions other people in your state and city are
            asking, or search by issue area.
          </p>

          <div className="mb-8 space-y-6">
            {sections.map((section) => (
              <div key={section.key}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">{section.label}</h2>
                <div className="space-y-4">
                  {section.groups.map((group) => (
                    <div key={group.sublabel}>
                      <h3 className="mb-2 text-sm font-medium text-gray-500">{group.sublabel}</h3>
                      <div className="space-y-2">
                        {group.officials.map((o) => (
                          <div
                            key={o.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
                          >
                            {o.photoUrl ? (
                              <img
                                src={o.photoUrl}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                                {o.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">{o.name}</p>
                              <p className="text-sm text-gray-500">
                                {o.title} ({o.party})
                                {o.district ? ` \u2014 ${o.district}` : ""}
                              </p>
                            </div>
                            <Link
                              href={`/ask?official=${o.id}`}
                              className="shrink-0 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                              Ask
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-block rounded-full border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showPolicies) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <button
            type="button"
            onClick={() => setShowPolicies(false)}
            className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; Back to address
          </button>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">Review Our Policies</h1>
          <p className="mb-8 text-gray-600">
            Before we find your elected officials, please review and agree to our site policies.
            AskThem is a moderated platform committed to constructive civic dialogue.
          </p>

          <div className="space-y-4">
            <label
              htmlFor="agree-terms"
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-4 transition-colors ${
                agreedTerms
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-medium text-gray-900">Terms of Service</p>
                <p className="mt-1 text-sm text-gray-600">
                  I agree that AskThem moderators have editorial control over all user-posted content,
                  including the right to edit, remove, or decline to publish submissions.
                </p>
                <Link
                  href="/terms"
                  target="_blank"
                  className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Read full Terms of Service
                </Link>
              </div>
            </label>

            <label
              htmlFor="agree-privacy"
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-4 transition-colors ${
                agreedPrivacy
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                id="agree-privacy"
                type="checkbox"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-medium text-gray-900">Privacy Policy</p>
                <p className="mt-1 text-sm text-gray-600">
                  I understand how AskThem collects, uses, and protects my personal information,
                  including my home address for representative matching.
                </p>
                <Link
                  href="/privacy"
                  target="_blank"
                  className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Read full Privacy Policy
                </Link>
              </div>
            </label>

            <label
              htmlFor="agree-comments"
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-4 transition-colors ${
                agreedComments
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                id="agree-comments"
                type="checkbox"
                checked={agreedComments}
                onChange={(e) => setAgreedComments(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-medium text-gray-900">Comment Policy</p>
                <p className="mt-1 text-sm text-gray-600">
                  I agree to abide by strict moderation rules that prohibit hate speech, personal
                  questions about officials&rsquo; private lives, harassment, and misinformation.
                </p>
                <Link
                  href="/comment-policy"
                  target="_blank"
                  className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Read full Comment Policy
                </Link>
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handlePoliciesSubmit}
            disabled={isSubmitting || !agreedTerms || !agreedPrivacy || !agreedComments}
            className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Looking up your officials..." : "Agree & Find My Officials"}
          </button>
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

        <form onSubmit={handleAddressContinue} className="space-y-5">
          {/* Name (only for email sign-ups without a name) */}
          {needsName && (
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>
          )}

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
            disabled={(needsName && !displayName.trim()) || !street.trim() || !city.trim() || !state || !zip.trim()}
            className="w-full rounded-full bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Continue
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Your address is used only to match you with your elected officials and is never shared.
        </p>
      </div>
    </div>
  );
}
