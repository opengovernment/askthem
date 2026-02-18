import { getEventBySlug, getTopQuestionsForEvent } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
import { OfficialAvatar } from "@/components/OfficialAvatar";
import { AmaComments } from "@/components/AmaComments";
import { AmaQuestionForm } from "@/components/AmaQuestionForm";
import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found - AskThem" };

  return {
    title: `${event.title} - AskThem`,
    description: event.description.length > 160
      ? event.description.slice(0, 160) + "..."
      : event.description,
  };
}

const statusStyles: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-800" },
  live: { label: "Live Now", color: "bg-red-100 text-red-800" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", color: "bg-yellow-100 text-yellow-800" },
};

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const questions = await getTopQuestionsForEvent(event.id, 20);
  const { official } = event;
  const status = statusStyles[event.status] ?? statusStyles.upcoming;
  const session = await auth();
  const isSignedIn = !!session?.user;
  const isAddressVerified = !!session?.user?.isAddressVerified;

  const isActive = event.status === "upcoming" || event.status === "live";
  const isLive = event.status === "live";
  const isAmaLive = event.isAma && isLive;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/events" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; All events
        </Link>

        {/* AMA live banner */}
        {isAmaLive && (
          <div className="mb-6 overflow-hidden rounded-lg border border-red-200 bg-red-50">
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-semibold text-red-800">
                AMA is live &mdash; {official.name} is answering your questions
              </span>
            </div>
          </div>
        )}

        {/* AMA upcoming banner */}
        {event.isAma && event.status === "upcoming" && (
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">AMA</span>
              <span className="text-sm font-medium text-purple-800">
                Ask Me Anything with {official.name} &mdash; starting {new Date(event.startsAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </span>
            </div>
            <p className="mt-1 text-xs text-purple-600">
              Submit questions now. When the AMA goes live, {official.name.split(" ")[0]} will answer the top questions voted on by constituents.
            </p>
          </div>
        )}

        {/* Event header */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            {event.isAma && (
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-purple-700">AMA</span>
            )}
            <span className="text-sm text-gray-500">
              {new Date(event.startsAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {" at "}
              {new Date(event.startsAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
              {event.endsAt && (
                <>
                  {" - "}
                  {new Date(event.endsAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </>
              )}
            </span>
          </div>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="mb-4 leading-relaxed text-gray-600">{event.description}</p>

          {event.location && (
            <p className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.291 5.597a15.591 15.591 0 0 0 2.236 2.235l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
              </svg>
              {event.location}
            </p>
          )}

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="mb-1 text-sm font-medium text-gray-500">Featuring:</p>
            <Link
              href={`/officials/${official.id}`}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
              <OfficialAvatar name={official.name} photoUrl={official.photoUrl} size="md" />
              <div>
                <span className="font-semibold">{official.name}</span>
                <span className="ml-1 text-sm text-gray-500">
                  {official.title} &middot; {official.party === "D" ? "Democrat" : "Republican"} &middot; {official.state}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Inline question form for AMA events */}
        {event.isAma && isActive && event.acceptingQuestions && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              {isLive ? "Ask a question live" : "Submit a question for the AMA"}
            </h2>
            {isSignedIn && isAddressVerified ? (
              <AmaQuestionForm
                eventId={event.id}
                officialId={official.id}
                officialName={official.name}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                {!isSignedIn ? (
                  <>
                    <p className="mb-3 text-gray-600">Sign in to ask a question during this AMA.</p>
                    <Link href="/auth/signin" className="inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                      Sign In
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-gray-600">Verify your address to ask questions.</p>
                    <Link href="/address" className="inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                      Enter Your Address
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Not accepting questions message */}
        {event.isAma && isActive && !event.acceptingQuestions && (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-700">
            Question submission is currently paused for this AMA. Stay tuned!
          </div>
        )}

        {/* Top questions */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Questions
            {questions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                sorted by community support
              </span>
            )}
          </h2>
          {isActive && !event.isAma && (
            <Link
              href={`/ask?eventId=${event.id}&official=${official.id}`}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Submit a Question
            </Link>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">No questions submitted for this event yet.</p>
            {isActive && !event.isAma && (
              <Link
                href={`/ask?eventId=${event.id}&official=${official.id}`}
                className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
              >
                Be the first to ask!
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="relative">
                {index < 3 && (
                  <div className="absolute -left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                )}
                <QuestionCard question={question} />
              </div>
            ))}
          </div>
        )}

        {/* AMA live comment thread */}
        {event.isAma && (event.status === "live" || event.status === "completed") && (
          <div className="mt-10">
            <AmaComments
              eventId={event.id}
              isLive={isLive}
              isSignedIn={isSignedIn}
            />
          </div>
        )}
      </div>
    </div>
  );
}
