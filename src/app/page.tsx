import { SearchBar } from "@/components/SearchBar";
import { QuestionCard } from "@/components/QuestionCard";
import { getPopularQuestions } from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const popularQuestions = await getPopularQuestions(6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-600 to-indigo-700 px-4 py-20 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Ask Your Elected Officials
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-indigo-100">
          Ask questions, upvote what matters, and get real answers from the people who represent
          you.
        </p>
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </section>

      {/* Popular Questions */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Popular Questions</h2>
          <Link
            href="/ask"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Ask a Question
          </Link>
        </div>
        <div className="space-y-4">
          {popularQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">How AskThem Works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                1
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Ask a Question</h3>
              <p className="text-sm text-gray-600">
                Register with your address to find your elected officials, then ask them a question
                that matters to you.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                2
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Upvote &amp; Share</h3>
              <p className="text-sm text-gray-600">
                Upvote questions to your officials that you want answered. Questions with more
                support get delivered first.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                3
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Get Answers</h3>
              <p className="text-sm text-gray-600">
                Officials respond with text, audio, or video. Everyone who signed the question gets
                notified.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
