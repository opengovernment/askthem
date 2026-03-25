import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Responders - AskThem",
  description:
    "Elected officials who actively participate on AskThem, answering constituent questions directly.",
};

// ── Dummy profiles for initial launch ───────────────────────────────
// These are fictional officials used to demonstrate the Verified Responders
// feature. They are NOT stored in the database and won't appear in Cicero
// lookups or the main officials directory.
const DEMO_RESPONDERS = [
  {
    slug: "maria-santos",
    name: "Maria Santos",
    title: "State Senator",
    party: "D",
    state: "CO",
    district: "District 15",
    chamber: "state_senate" as const,
    bio: "Senator Santos represents District 15 in the Colorado State Senate. She has committed to answering constituent questions on AskThem as part of her transparency pledge, responding to questions about education funding, housing, and environmental policy.",
    responseStats: { questions: 42, answered: 38, responseRate: 90 },
    topics: ["Education", "Housing and Community Development", "Environmental Protection"],
    joinedAt: "January 2026",
  },
  {
    slug: "james-okonkwo",
    name: "James Okonkwo",
    title: "U.S. Representative",
    party: "R",
    state: "OH",
    district: "OH-12",
    chamber: "house" as const,
    bio: "Representative Okonkwo serves Ohio's 12th Congressional District. He uses AskThem to hear directly from constituents and has posted video responses to questions about trade policy, veterans' affairs, and infrastructure.",
    responseStats: { questions: 67, answered: 51, responseRate: 76 },
    topics: ["Armed Forces and National Security", "Commerce", "Transportation and Public Works"],
    joinedAt: "March 2026",
  },
  {
    slug: "priya-nakamura",
    name: "Priya Nakamura",
    title: "City Council Member",
    party: "I",
    state: "TX",
    district: "Austin, District 4",
    chamber: "local" as const,
    bio: "Council Member Nakamura represents District 4 in Austin. She regularly responds to questions about local transit, zoning, and public safety, often sharing Instagram videos from community meetings.",
    responseStats: { questions: 29, answered: 27, responseRate: 93 },
    topics: ["Transportation and Public Works", "Housing and Community Development", "Crime and Law Enforcement"],
    joinedAt: "February 2026",
  },
];

export default function VerifiedRespondersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/officials"
          className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; All Officials
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Verified Responders
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Active
            </span>
          </div>
          <p className="mt-2 text-gray-600">
            These elected officials have committed to answering constituent
            questions on AskThem. They respond to questions via video, social
            media posts, and written statements.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 rounded-lg border border-indigo-100 bg-indigo-50 p-5">
          <h2 className="mb-2 text-sm font-semibold text-indigo-900">
            What does &ldquo;Verified Responder&rdquo; mean?
          </h2>
          <ul className="space-y-1 text-sm text-indigo-800">
            <li>
              &bull; The official has agreed to receive and respond to constituent questions on AskThem
            </li>
            <li>
              &bull; Responses are posted by site moderators using the official&rsquo;s social media posts, videos, or direct statements
            </li>
            <li>
              &bull; Response rates and activity are tracked publicly for accountability
            </li>
          </ul>
        </div>

        {/* Responder profiles */}
        <div className="space-y-6">
          {DEMO_RESPONDERS.map((responder) => (
            <div
              key={responder.slug}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                    {responder.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  {/* Verified check */}
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {responder.name}
                    </h3>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Verified Responder
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {responder.title} &middot;{" "}
                    {responder.party === "D"
                      ? "Democrat"
                      : responder.party === "R"
                        ? "Republican"
                        : "Independent"}{" "}
                    &middot; {responder.state}
                    {responder.district ? `, ${responder.district}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Joined AskThem {responder.joinedAt}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                {responder.bio}
              </p>

              {/* Topics */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {responder.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {responder.responseStats.questions}
                  </p>
                  <p className="text-xs text-gray-500">Questions</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-green-600">
                    {responder.responseStats.answered}
                  </p>
                  <p className="text-xs text-gray-500">Answered</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-indigo-600">
                    {responder.responseStats.responseRate}%
                  </p>
                  <p className="text-xs text-gray-500">Response Rate</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-lg border border-gray-200 bg-white p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Is your representative not listed?
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Ask them a question on AskThem. When enough constituents show
            interest, we reach out to officials to join as Verified Responders.
          </p>
          <Link
            href="/ask"
            className="inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Ask a Question
          </Link>
        </div>
      </div>
    </div>
  );
}
