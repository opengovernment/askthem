import { getOfficialById, getQuestionsByOfficialId } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
import { DeliveryThresholdEditor } from "@/components/DeliveryThresholdEditor";
import { OfficialAvatar } from "@/components/OfficialAvatar";
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

  const isFederalOfficial =
    official.chamber === "senate" ||
    official.chamber === "house" ||
    official.level === "NATIONAL_UPPER" ||
    official.level === "NATIONAL_LOWER";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/officials" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; All Officials
        </Link>

        {/* Federal official beta restriction notice */}
        {isFederalOfficial && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-blue-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800">
                While AskThem is in public beta, only Groups can ask questions to federal officials.
              </p>
            </div>
          </div>
        )}

        {/* Official Profile Header */}
        <div className={`mb-6 rounded-lg border bg-white shadow-sm ${
          official.isVerifiedResponder
            ? "border-green-300 ring-2 ring-green-100"
            : "border-gray-200"
        }`}>
          {/* Verified Responder banner */}
          {official.isVerifiedResponder && (
            <div className="flex items-center gap-2 rounded-t-lg border-b border-green-200 bg-green-50 px-6 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-600">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-sm font-semibold text-green-800">Verified Responder</span>
                <span className="ml-2 text-xs text-green-600">
                  This official actively answers constituent questions on AskThem
                </span>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <OfficialAvatar name={official.name} photoUrl={official.photoUrl} size="lg" />
                {official.isVerifiedResponder && (
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white ring-2 ring-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
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
        </div>

        {/* Nudge for officials who haven't joined yet (hidden for federal officials during beta) */}
        {!official.isVerifiedResponder && !isFederalOfficial && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {official.name} hasn&apos;t joined AskThem yet
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  When enough constituents ask questions and sign them, we deliver them
                  to this official and invite them to respond. Add your voice to help make that happen!
                </p>
                <Link
                  href="/ask"
                  className="mt-3 inline-block rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                >
                  Ask {official.name.split(" ")[0]} a Question
                </Link>
              </div>
            </div>
          </div>
        )}

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
          {!isFederalOfficial && (
            <Link
              href="/ask"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Ask {official.name.split(" ")[0]} a Question
            </Link>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              {isFederalOfficial
                ? "No questions yet. During the public beta, only Groups can ask questions to federal officials."
                : "No questions yet. Be the first to ask!"}
            </p>
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
