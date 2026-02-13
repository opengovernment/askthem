import { searchQuestions, getPopularQuestions } from "@/lib/mock-data";
import { QuestionCard } from "@/components/QuestionCard";
import { SearchBar } from "@/components/SearchBar";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const questions = search ? searchQuestions(search) : getPopularQuestions(20);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex justify-center">
          <SearchBar />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : "All Questions"}
          </h1>
          <Link
            href="/ask"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Ask a Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">No questions found for &ldquo;{search}&rdquo;.</p>
            <Link href="/ask" className="mt-2 inline-block text-indigo-600 hover:text-indigo-800">
              Be the first to ask!
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
