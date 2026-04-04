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
import { OfficialAvatar } from "@/components/OfficialAvatar";
import { ReportButton } from "@/components/ReportButton";
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

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
    published: { label: "Collecting Signatures", color: "bg-blue-100 text-blue-800", icon: "📝" },
    delivered: { label: "Delivered to Official", color: "bg-purple-100 text-purple-800", icon: "📬" },
    answered: { label: "Answered", color: "bg-green-100 text-green-800", icon: "✓" },
  };
  const status = statusConfig[question.status] ?? statusConfig.published;

  const askedDate = new Date(question.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb nav */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-sm text-gray-500 sm:px-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/questions" className="hover:text-indigo-600 transition-colors">Questions</Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">
            {question.text.length > 50 ? question.text.slice(0, 50) + "…" : question.text}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* ─── Main Column ─────────────────────────────────── */}
          <div className="min-w-0 flex-1">

            {/* Question Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Status + tags bar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-6 py-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                  {question.status === "answered" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                  {status.label}
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {question.districtTag}
                </span>
                {question.categoryTags.map((ct) => (
                  <span key={ct.tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    {ct.tag}
                  </span>
                ))}
                <GroupEndorsementBadge endorsements={question.endorsements} />
              </div>

              {/* Question body */}
              <div className="px-6 py-6 sm:py-8">
                <div className="flex gap-4">
                  {/* Upvote count column (desktop) */}
                  <div className="hidden lg:flex lg:flex-col lg:items-center">
                    <UpvoteButton questionId={question.id} initialCount={question.upvoteCount} questionText={question.text} officialName={official.name} />
                    {/* Connector line to answer */}
                    {answer && (
                      <div className="mt-2 w-0.5 flex-1 bg-gradient-to-b from-indigo-200 to-green-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl lg:text-[1.625rem]">
                      {question.text}
                    </h1>
                    <p className="mt-3 text-sm text-gray-500">
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
                          )}
                          {author.city && author.state ? ` from ${author.city}, ${author.state}` : ""}
                        </>
                      )}
                      {" · "}{askedDate}
                    </p>

                    {question.videoUrl && (
                      <div className="mt-4">
                        <QuestionVideo url={question.videoUrl} />
                      </div>
                    )}

                    {/* Keywords */}
                    {question.keywords && question.keywords.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {question.keywords.map((kw) => (
                          <span key={kw.keyword} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700 border border-amber-100">
                            {kw.keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Inline actions (mobile: share + upvote together) */}
                    <div className="mt-5 flex items-center gap-3 lg:hidden">
                      <UpvoteButton questionId={question.id} initialCount={question.upvoteCount} questionText={question.text} officialName={official.name} />
                      <ShareButton questionId={question.id} text={question.text} officialName={official.name} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Answer Section ─────────────────────────────── */}
            {answer && (
              <div className="mt-6 rounded-xl border border-green-200 bg-gradient-to-b from-green-50 to-white shadow-sm">
                <div className="px-6 py-6 sm:py-8">
                  <div className="flex gap-4">
                    {/* "A" marker */}
                    <div className="hidden sm:block">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                        A
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Official identity */}
                      <div className="mb-4 flex items-center gap-3">
                        <OfficialAvatar name={official.name} photoUrl={official.photoUrl ?? null} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/officials/${official.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                              {official.name}
                            </Link>
                            {official.isVerifiedResponder && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                  <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {official.title} · Responded{" "}
                            {new Date(answer.respondedAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Response text */}
                      {answer.responseText && (
                        <div className="prose prose-gray max-w-none text-gray-800 leading-relaxed">
                          {answer.responseText.split("\n").map((para, i) => (
                            <p key={i} className={i > 0 ? "mt-3" : ""}>{para}</p>
                          ))}
                        </div>
                      )}

                      {/* Media */}
                      {answer.media && answer.media.length > 0 && (
                        <div className="mt-5">
                          <AnswerMedia media={answer.media} />
                        </div>
                      )}

                      {/* Legacy video/source links */}
                      {!answer.media?.length && answer.responseVideoUrl && (
                        <p className="mt-4 text-sm">
                          <a href={answer.responseVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">
                            View video response →
                          </a>
                        </p>
                      )}
                      {answer.sourceUrl && (
                        <p className="mt-3 text-sm">
                          <a href={answer.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                              <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
                              <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
                            </svg>
                            View original source
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unanswered: show "awaiting response" */}
            {!answer && question.status !== "pending_review" && (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Awaiting response from {official.name}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {question.status === "delivered"
                    ? "This question has been delivered. We're waiting for a response."
                    : "Help this question reach the delivery threshold by signing it."}
                </p>
              </div>
            )}

            {/* Answer form for delivered questions without an answer */}
            {question.status === "delivered" && !answer && (
              <AnswerForm questionId={question.id} officialName={official.name} />
            )}

            {/* Moderator endorsement tool */}
            {isModerator && (
              <div className="mt-6">
                <AddEndorsementButton
                  questionId={question.id}
                  existingEndorsements={question.endorsements.map((e) => ({
                    id: e.id,
                    group: { id: e.group.id, name: e.group.name },
                  }))}
                />
              </div>
            )}

            {/* Signer comments */}
            <div className="mt-6">
              <SignerComments questionId={question.id} />
            </div>

            {/* Group opt-in */}
            {question.group?.isVerified && question.group.commsOptInEnabled && (
              <div className="mt-6">
                <GroupCommOptInButton groupId={question.group.id} groupName={question.group.name} />
              </div>
            )}

            {/* Report */}
            <ReportButton questionId={question.id} isSignedIn={!!session?.user} />
          </div>

          {/* ─── Sidebar ─────────────────────────────────────── */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="lg:sticky lg:top-6 space-y-5">

              {/* Official card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Directed to</p>
                <div className="flex items-center gap-3">
                  <OfficialAvatar name={official.name} photoUrl={official.photoUrl ?? null} size="lg" />
                  <div className="min-w-0">
                    <Link href={`/officials/${official.id}`} className="block truncate font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                      {official.name}
                    </Link>
                    <p className="text-sm text-gray-500">{official.title}</p>
                    <p className="text-sm text-gray-500">
                      {official.party === "D" ? "Democrat" : official.party === "R" ? "Republican" : official.party}
                      {" · "}{official.state}{official.district ? `, ${official.district}` : ""}
                    </p>
                  </div>
                </div>

                {official.isVerifiedResponder && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Verified Responder on AskThem
                  </div>
                )}

                {responseStats.answered > 0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    Answered {responseStats.answered} of {responseStats.total} delivered {responseStats.total === 1 ? "question" : "questions"}
                  </p>
                )}
              </div>

              {/* Share — desktop only (mobile share is inline) */}
              <div className="hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:block">
                <ShareButton questionId={question.id} text={question.text} officialName={official.name} />
              </div>

              {/* Signature progress */}
              <SignatureCounts
                total={signatureCounts.total}
                constituent={signatureCounts.constituent}
                supporting={signatureCounts.supporting}
                recent={signatureCounts.recent}
                displayTotal={question.upvoteCount}
                isAnswered={question.status === "answered"}
                deliveryThreshold={official.deliveryThreshold}
                deliveryThresholdType={official.deliveryThresholdType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
