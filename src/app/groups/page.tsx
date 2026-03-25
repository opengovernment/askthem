import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groups - AskThem",
  description:
    "Browse verified groups on AskThem. Advocacy organizations, think tanks, and nonprofits asking questions on behalf of their communities.",
};

const DUMMY_GROUPS = [
  { slug: "greenway-alliance-nyc", name: "Greenway Alliance NYC", city: "New York", state: "NY" },
  { slug: "westside-voter-project", name: "Westside Voter Project", city: "Los Angeles", state: "CA" },
  { slug: "lakefront-civic-league", name: "Lakefront Civic League", city: "Chicago", state: "IL" },
  { slug: "lone-star-accountability", name: "Lone Star Accountability Project", city: "Austin", state: "TX" },
  { slug: "capitol-watch-dc", name: "Capitol Watch DC", city: "Washington", state: "DC" },
  { slug: "sunshine-advocacy-coalition", name: "Sunshine Advocacy Coalition", city: "Miami", state: "FL" },
  { slug: "harbor-city-gazette", name: "Harbor City Gazette", city: "Baltimore", state: "MD" },
  { slug: "pinecrest-media-group", name: "Pinecrest Media Group", city: "Denver", state: "CO" },
];

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Groups</h1>
        <p className="mb-6 text-gray-600">
          Organizations using AskThem to ask questions on behalf of their communities.
        </p>

        {/* Apply CTA */}
        <div className="mb-10 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-200 text-indigo-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 17v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-indigo-900">
                Represent an organization?
              </h2>
              <p className="mt-1 text-sm text-indigo-800">
                Advocacy organizations, think tanks, and nonprofits can apply to
                become a verified group on AskThem and ask questions on behalf of
                their members.
              </p>
              <Link
                href="/groups/apply"
                className="mt-3 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Apply for Group Verification
              </Link>
            </div>
          </div>
        </div>

        {/* Group listings */}
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Verified Groups</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DUMMY_GROUPS.map((group) => (
            <Link
              key={group.slug}
              href={`/groups/${group.slug}`}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                {group.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{group.name}</p>
                <p className="text-sm text-gray-500">
                  {group.city}, {group.state}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
