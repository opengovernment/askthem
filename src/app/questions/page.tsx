import { getFilteredQuestions, getFilteredOfficials, getAllTags, getAllOfficials, getActiveStates, getDistrictsForState } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
import { OfficialAvatar } from "@/components/OfficialAvatar";
import { SearchBar } from "@/components/SearchBar";
import { QuestionFilters } from "@/components/QuestionFilters";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Questions - AskThem",
  description: "Browse, search, and filter questions asked to elected officials by constituents.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    status?: string;
    tag?: string;
    official?: string;
    state?: string;
    district?: string;
  }>;
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [questions, matchingOfficials, tags, officials, activeStates, districts] = await Promise.all([
    getFilteredQuestions({
      search: params.search,
      sort: (params.sort as "votes" | "newest" | "trending") || "votes",
      status: params.status,
      tag: params.tag,
      officialId: params.official,
      state: params.state,
      district: params.district,
    }),
    params.search ? getFilteredOfficials({ search: params.search }) : Promise.resolve([]),
    getAllTags(),
    getAllOfficials(),
    getActiveStates(),
    params.state ? getDistrictsForState(params.state) : Promise.resolve([]),
  ]);

  const hasActiveFilters = params.search || params.status || params.tag || params.official || params.state || params.district;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex justify-center">
          <SearchBar />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {params.search ? `Results for "${params.search}"` : "All Questions"}
          </h1>
          <Link
            href="/ask"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Ask a Question
          </Link>
        </div>

        <div className="mb-6">
          <Suspense fallback={null}>
            <QuestionFilters
              tags={tags}
              officials={officials.map((o) => ({ id: o.id, name: o.name }))}
              activeStates={activeStates}
              districts={districts}
            />
          </Suspense>
        </div>

        {/* Matching officials */}
        {matchingOfficials.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Officials
            </h2>
            <div className="space-y-2">
              {matchingOfficials.map((o) => (
                <Link
                  key={o.id}
                  href={`/officials/${o.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <div className="flex items-center gap-3">
                    <OfficialAvatar name={o.name} photoUrl={o.photoUrl} size="md" />
                    <div>
                      <p className="font-medium text-gray-900">{o.name}</p>
                      <p className="text-sm text-gray-500">
                        {o.title} &middot; {o.party === "D" ? "Democrat" : "Republican"} &middot; {o.state}
                        {o.district ? `, ${o.district}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-indigo-600">View profile &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              {hasActiveFilters ? "No questions match your filters." : "No questions yet."}
            </p>
            <Link href="/ask" className="mt-2 inline-block text-indigo-600 hover:text-indigo-800">
              Be the first to ask!
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-4">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
