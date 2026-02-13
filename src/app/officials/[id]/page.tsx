import { officials, getQuestionsByOfficialId } from "@/lib/mock-data";
import { QuestionCard } from "@/components/QuestionCard";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OfficialPage({ params }: PageProps) {
  const { id } = await params;
  const official = officials.find((o) => o.id === id);
  if (!official) notFound();

  const questions = getQuestionsByOfficialId(official.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to all questions
        </Link>

        {/* Official Profile Header */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {official.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{official.name}</h1>
              <p className="text-gray-600">
                {official.title} &middot;{" "}
                {official.party === "D" ? "Democrat" : "Republican"} &middot;{" "}
                {official.state}
                {official.district ? `, ${official.district}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {official.email && (
                  <span className="text-gray-500">Email: {official.email}</span>
                )}
                {official.twitter && (
                  <span className="text-gray-500">Twitter: {official.twitter}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions for this official */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Questions ({questions.length})
          </h2>
          <Link
            href="/ask"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Ask {official.name.split(" ")[0]} a Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">No questions yet. Be the first to ask!</p>
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
