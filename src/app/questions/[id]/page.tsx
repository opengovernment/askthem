import { getQuestionById, getSignatureCounts, getOfficialResponseStats } from "@/lib/queries";
import { UpvoteButton } from "@/components/UpvoteButton";
import { ShareButton } from "@/components/ShareButton";
import { SignatureCounts } from "@/components/SignatureCounts";
import { AnswerForm } from "@/components/AnswerForm";
import { AnswerMedia } from "@/components/AnswerMedia";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { GroupCommOptInButton } from "@/components/GroupCommOptInButton";
import { GroupEndorsementBadge } from "@/components/GroupEndorsementBadge";
import { AddEndorsementButton } from "@/components/AddEndorsementButton";
import { SignerComments } from "@/components/SignerComments";
import { QuestionVideo } from "@/components/QuestionVideo";
import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const question = await getQuestionById(id);
  if (!question) return { title: "Question Not Found - AskThem" };

  const truncated =
    question.text.length > 120 ? question.text.slice(0, 120) + "..." : question.text;
  return {
    title: `${truncated} - AskThem`,
    description: `Question for ${question.official.name}: ${question.text}`,
    openGraph: {
      title: truncated,
      description: `Asked to ${question.official.name} (${question.official.title}). ${question.upvoteCount} upvotes.`,
      type: "article",
    },
  };
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const question = await getQuestionById(id);
  if (!question) notFound();

  const { official, author, answer } = question;
  const [signatureCounts, responseStats] = await Promise.all([
    getSignatureCounts(question.id),
    getOfficialResponseStats(official.id),
  ]);
  const session = await auth();
  const isModerator =
    session?.user?.role === "moderator" || session?.user?.role === "admin";

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
            {/* Inline endorsement badge — only renders when endorsements exist */}
            <GroupEndorsementBadge endorsements={question.endorsements} />
          </div>

          <div className="flex gap-5">
            <UpvoteButton questionId={question.id} initialCount={question.upvoteCount} questionText={question.text} officialName={official.name} />
            <div className="flex-1">
              <h1 className="mb-3 text-2xl font-bold text-gray-900">{question.text}</h1>
              <p className="mb-4 text-sm text-gray-500">
                {question.group?.isVerified ? (
                  <>
                    Asked by{" "}
                    <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                      {question.group.name}
                      <VerifiedBadge />
                    </span>
                  </>
                ) : (
                  <>
                    Asked by{" "}
                    {author.isProfilePublic ? (
                      <Link href={`/profile/${author.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                        {author.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-gray-700">{author.name}</span>
                    )}{" "}
                    {author.city && author.state
                      ? `from ${author.city}, ${author.state} `
                      : ""}
                  </>
                )}
                {" "}on{" "}
                {new Date(question.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {question.videoUrl && (
                <div className="mb-4">
                  <QuestionVideo url={question.videoUrl} />
                </div>
              )}

              <div className="mb-4">
                <ShareButton questionId={question.id} text={question.text} officialName={official.name} />
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-sm font-medium text-gray-500">Directed to:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/officials/${official.id}`}
                    className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {official.name}
                  </Link>
                  {official.isVerifiedResponder && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Verified Responder
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {official.title} &middot; {official.party === "D" ? "Democrat" : "Republican"}{" "}
                  &middot; {official.state}
                  {official.district ? `, ${official.district}` : ""}
                </p>
                {responseStats.answered > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                    </svg>
                    Answered {responseStats.answered} of {responseStats.total} delivered {responseStats.total === 1 ? "question" : "questions"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Moderator: add/remove endorsements — sits inside the card, below the content */}
          {isModerator && (
            <AddEndorsementButton
              questionId={question.id}
              existingEndorsements={question.endorsements.map((e) => ({
                id: e.id,
                group: { id: e.group.id, name: e.group.name },
              }))}
            />
          )}
        </div>

        {/* Signature counts breakdown */}
        <div className="mt-6">
          <SignatureCounts
            total={signatureCounts.total}
            constituent={signatureCounts.constituent}
            supporting={signatureCounts.supporting}
            recent={signatureCounts.recent}
            isAnswered={question.status === "answered"}
            deliveryThreshold={official.deliveryThreshold}
            deliveryThresholdType={official.deliveryThresholdType}
          />
        </div>

        {/* Why people signed — signer comments */}
        <SignerComments questionId={question.id} />

        {/* Group communications opt-in (only for group questions where admin has enabled it) */}
        {question.group?.isVerified && question.group.commsOptInEnabled && (
          <div className="mt-6">
            <GroupCommOptInButton groupId={question.group.id} groupName={question.group.name} />
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

            {/* Rich media items (social embeds + uploaded video/audio) */}
            {answer.media && answer.media.length > 0 && (
              <AnswerMedia media={answer.media} />
            )}

            {/* Legacy fields for backwards compat with older answers */}
            {!answer.media?.length && answer.responseVideoUrl && (
              <p className="mt-3 text-sm text-indigo-600">
                <a
                  href={answer.responseVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-indigo-800"
                >
                  View video response
                </a>
              </p>
            )}
            {answer.sourceUrl && (
              <p className="mt-3 text-sm">
                <a
                  href={answer.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  View original source
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
