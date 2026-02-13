import { getQuestionById } from "@/lib/queries";
import { UpvoteButton } from "@/components/UpvoteButton";
import { ShareButton } from "@/components/ShareButton";
import { AnswerForm } from "@/components/AnswerForm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const question = await getQuestionById(id);
  if (!question) notFound();

  const { official, author, answer } = question;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
    published: { label: "Published", color: "bg-blue-100 text-blue-800" },
    delivered: { label: "Delivered to Official", color: "bg-purple-100 text-purple-800" },
    answered: { label: "Answered", color: "bg-green-100 text-green-800" },
  };

  const status = statusLabels[question.status] ?? statusLabels.published;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to all questions
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            {question.categoryTags.map((ct) => (
              <span key={ct.tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {ct.tag}
              </span>
            ))}
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
              {question.districtTag}
            </span>
          </div>

          <div className="flex gap-5">
            <UpvoteButton questionId={question.id} initialCount={question.upvoteCount} />
            <div className="flex-1">
              <h1 className="mb-3 text-2xl font-bold text-gray-900">{question.text}</h1>
              <p className="mb-4 text-sm text-gray-500">
                Asked by <span className="font-medium text-gray-700">{author.name}</span>{" "}
                {author.city && author.state
                  ? `from ${author.city}, ${author.state} `
                  : ""}
                on{" "}
                {new Date(question.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="mb-4">
                <ShareButton questionId={question.id} text={question.text} />
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-sm font-medium text-gray-500">Directed to:</p>
                <Link
                  href={`/officials/${official.id}`}
                  className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {official.name}
                </Link>
                <p className="text-sm text-gray-600">
                  {official.title} &middot; {official.party === "D" ? "Democrat" : "Republican"}{" "}
                  &middot; {official.state}
                  {official.district ? `, ${official.district}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign this question CTA */}
        {question.status !== "answered" && (
          <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-5 text-center">
            <p className="mb-3 text-gray-700">
              Want this question answered? Upvote it to show your support.
            </p>
            <p className="text-sm text-gray-500">
              Questions are delivered to officials once they reach enough constituent support.
              You must be a registered constituent to upvote.
            </p>
          </div>
        )}

        {/* Answer form for delivered questions without an answer */}
        {question.status === "delivered" && !answer && (
          <AnswerForm questionId={question.id} officialName={official.name} />
        )}

        {/* Answer section */}
        {answer && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-sm font-bold text-green-800">
                A
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  Official Response from {official.name}
                </p>
                <p className="text-xs text-green-700">
                  {new Date(answer.respondedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            {answer.responseText && (
              <p className="leading-relaxed text-gray-800">{answer.responseText}</p>
            )}
            {answer.responseVideoUrl && (
              <p className="mt-3 text-sm text-indigo-600">
                Video response available (player coming soon)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
