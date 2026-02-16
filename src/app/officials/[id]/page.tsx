import { getOfficialById, getQuestionsByOfficialId } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
import { DeliveryThresholdEditor } from "@/components/DeliveryThresholdEditor";
import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const official = await getOfficialById(id);
  if (!official) return { title: "Official Not Found - AskThem" };

  return {
    title: `${official.name} - ${official.title} - AskThem`,
    description: `Ask ${official.name} (${official.title}, ${official.party === "D" ? "Democrat" : "Republican"}, ${official.state}) questions and see their responses.`,
    openGraph: {
      title: `${official.name} - ${official.title}`,
      description: `Ask questions to ${official.name} on AskThem.`,
      type: "profile",
    },
  };
}

export default async function OfficialPage({ params }: PageProps) {
  const { id } = await params;
  const official = await getOfficialById(id);
  if (!official) notFound();

  const questions = await getQuestionsByOfficialId(official.id);
  const session = await auth();
  const isModerator =
    session?.user?.role === "moderator" || session?.user?.role === "admin";

  // Compute stats from the questions
  const totalUpvotes = questions.reduce((sum, q) => sum + q.upvoteCount, 0);
  const answeredCount = questions.filter((q) => q.status === "answered").length;
  const deliveredCount = questions.filter((q) => q.status === "delivered").length;
  const pendingCount = questions.filter(
    (q) => q.status === "published",
  ).length;
  const responseRate =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/officials" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; All Officials
        </Link>

        {/* Official Profile Header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
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
                {official.website && (
                  <a
                    href={official.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {questions.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{answeredCount}</p>
              <p className="text-xs text-gray-500">Answered</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{totalUpvotes.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Upvotes</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
              <p className="text-xs text-gray-500">Response Rate</p>
            </div>
          </div>
        )}

        {/* Status breakdown */}
        {questions.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {pendingCount > 0 && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {pendingCount} awaiting delivery
              </span>
            )}
            {deliveredCount > 0 && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                {deliveredCount} delivered, awaiting response
              </span>
            )}
            {answeredCount > 0 && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                {answeredCount} answered
              </span>
            )}
          </div>
        )}

        {/* Delivery threshold editor (moderators only) */}
        {isModerator && (
          <div className="mb-6">
            <DeliveryThresholdEditor
              officialId={official.id}
              officialName={official.name}
              initialThreshold={official.deliveryThreshold}
              initialType={official.deliveryThresholdType}
            />
          </div>
        )}

        {/* Questions for this official */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Questions
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
