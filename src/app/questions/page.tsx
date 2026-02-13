import { getFilteredQuestions, getAllTags, getAllOfficials } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
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
    tag?: string;
    official?: string;
  }>;
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [questions, tags, officials] = await Promise.all([
    getFilteredQuestions({
      search: params.search,
      sort: (params.sort as "votes" | "newest" | "oldest") || "votes",
      tag: params.tag,
      officialId: params.official,
    }),
    getAllTags(),
    getAllOfficials(),
  ]);

  const hasActiveFilters = params.search || params.tag || params.official;

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
            />
          </Suspense>
        </div>

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
