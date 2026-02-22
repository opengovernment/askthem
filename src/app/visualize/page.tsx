import { VisualizeBubbleMap } from "@/components/VisualizeBubbleMap";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visualize - AskThem",
  description: "See trending questions and issue areas across the United States.",
};

// Dummy trending data across states and issue tags.
// Each entry represents a cluster of trending questions in a state.
const trendingData = [
  { state: "CA", tag: "Healthcare", questionCount: 24, topQuestion: "Will you support expanding Medicaid coverage?", upvotes: 312 },
  { state: "CA", tag: "Climate", questionCount: 18, topQuestion: "What is your plan to address wildfire risk?", upvotes: 287 },
  { state: "TX", tag: "Immigration", questionCount: 31, topQuestion: "How do you plan to reform the asylum process?", upvotes: 445 },
  { state: "TX", tag: "Energy", questionCount: 15, topQuestion: "Will you support renewable energy incentives?", upvotes: 198 },
  { state: "NY", tag: "Housing", questionCount: 22, topQuestion: "What will you do about rising rent costs?", upvotes: 376 },
  { state: "NY", tag: "Education", questionCount: 14, topQuestion: "Will you increase funding for public schools?", upvotes: 201 },
  { state: "FL", tag: "Climate", questionCount: 19, topQuestion: "How will you protect coastal communities from sea level rise?", upvotes: 267 },
  { state: "FL", tag: "Healthcare", questionCount: 12, topQuestion: "Will you protect coverage for pre-existing conditions?", upvotes: 178 },
  { state: "PA", tag: "Economy", questionCount: 16, topQuestion: "What is your plan to bring manufacturing jobs back?", upvotes: 234 },
  { state: "OH", tag: "Economy", questionCount: 13, topQuestion: "How will you support small businesses in rural areas?", upvotes: 189 },
  { state: "GA", tag: "Voting Rights", questionCount: 20, topQuestion: "Will you support automatic voter registration?", upvotes: 298 },
  { state: "MI", tag: "Economy", questionCount: 11, topQuestion: "What will you do to support the auto industry transition?", upvotes: 156 },
  { state: "AZ", tag: "Immigration", questionCount: 17, topQuestion: "How will you address border community concerns?", upvotes: 223 },
  { state: "NC", tag: "Education", questionCount: 10, topQuestion: "Will you support teacher pay increases?", upvotes: 145 },
  { state: "WA", tag: "Climate", questionCount: 14, topQuestion: "How will you protect salmon habitats?", upvotes: 192 },
  { state: "CO", tag: "Housing", questionCount: 12, topQuestion: "What will you do about affordable housing in Denver?", upvotes: 167 },
  { state: "IL", tag: "Gun Violence", questionCount: 15, topQuestion: "Will you support an assault weapons ban?", upvotes: 213 },
  { state: "VA", tag: "Education", questionCount: 9, topQuestion: "How will you address student loan debt?", upvotes: 134 },
  { state: "MN", tag: "Healthcare", questionCount: 8, topQuestion: "Will you support a public option for health insurance?", upvotes: 121 },
  { state: "NV", tag: "Economy", questionCount: 7, topQuestion: "How will you diversify Nevada's economy beyond tourism?", upvotes: 98 },
  { state: "WI", tag: "Agriculture", questionCount: 9, topQuestion: "What will you do to support dairy farmers?", upvotes: 112 },
  { state: "MA", tag: "Climate", questionCount: 11, topQuestion: "Will you support offshore wind energy?", upvotes: 158 },
  { state: "OR", tag: "Housing", questionCount: 10, topQuestion: "What is your plan for homelessness in Portland?", upvotes: 143 },
  { state: "SC", tag: "Healthcare", questionCount: 7, topQuestion: "Will you expand rural hospital access?", upvotes: 89 },
  { state: "TN", tag: "Gun Violence", questionCount: 8, topQuestion: "What gun safety measures will you support?", upvotes: 117 },
  { state: "MO", tag: "Economy", questionCount: 6, topQuestion: "How will you address wage stagnation?", upvotes: 84 },
  { state: "IN", tag: "Healthcare", questionCount: 5, topQuestion: "Will you protect insulin price caps?", upvotes: 76 },
  { state: "NM", tag: "Climate", questionCount: 6, topQuestion: "How will you address water scarcity?", upvotes: 91 },
  { state: "LA", tag: "Climate", questionCount: 7, topQuestion: "What will you do about coastal erosion?", upvotes: 103 },
  { state: "KY", tag: "Economy", questionCount: 5, topQuestion: "How will you support coal country in economic transition?", upvotes: 72 },
];

// Aggregate by state: merge multiple tags into one bubble per state
function aggregateByState(data: typeof trendingData) {
  const byState: Record<string, { state: string; tags: string[]; totalQuestions: number; totalUpvotes: number; topQuestion: string; topUpvotes: number }> = {};
  for (const entry of data) {
    if (!byState[entry.state]) {
      byState[entry.state] = { state: entry.state, tags: [], totalQuestions: 0, totalUpvotes: 0, topQuestion: entry.topQuestion, topUpvotes: entry.upvotes };
    }
    const s = byState[entry.state];
    s.tags.push(entry.tag);
    s.totalQuestions += entry.questionCount;
    s.totalUpvotes += entry.upvotes;
    if (entry.upvotes > s.topUpvotes) {
      s.topQuestion = entry.topQuestion;
      s.topUpvotes = entry.upvotes;
    }
  }
  return Object.values(byState);
}

export default function VisualizePage() {
  const aggregated = aggregateByState(trendingData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Back to home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Trending Issues Across the U.S.</h1>
          <p className="mt-2 text-gray-600">
            See what constituents are asking about across the country. Larger bubbles indicate more activity.
            Click a bubble to explore trending questions in that state.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <VisualizeBubbleMap data={aggregated} />
        </div>

        {/* Legend */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Top Trending Topics</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(trendingData.map((d) => d.tag))).sort().map((tag) => {
              const total = trendingData.filter((d) => d.tag === tag).reduce((sum, d) => sum + d.questionCount, 0);
              return (
                <Link
                  key={tag}
                  href={`/questions?sort=trending&tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  {tag}
                  <span className="rounded-full bg-indigo-200 px-1.5 py-0.5 text-xs font-medium text-indigo-800">{total}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
