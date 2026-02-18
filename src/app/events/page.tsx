import { getUpcomingEvents, getPastEvents } from "@/lib/queries";
import { OfficialAvatar } from "@/components/OfficialAvatar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events - AskThem",
  description:
    "Upcoming town halls and public forums. Submit and upvote questions before the event so officials hear what matters most.",
};

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-800" },
  live: { label: "Live Now", color: "bg-red-100 text-red-800" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", color: "bg-yellow-100 text-yellow-800" },
};

interface EventCardProps {
  event: {
    slug: string;
    title: string;
    description: string;
    status: string;
    startsAt: Date;
    endsAt: Date | null;
    location: string | null;
    official: { id: string; name: string; title: string; photoUrl: string | null };
    _count: { questions: number };
  };
}

function EventCard({ event }: EventCardProps) {
  const status = statusStyles[event.status] ?? statusStyles.upcoming;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
        <span className="text-sm text-gray-500">
          {formatDate(event.startsAt)} at {formatTime(event.startsAt)}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">{event.title}</h3>

      <p className="mb-3 line-clamp-2 text-sm text-gray-600">{event.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <OfficialAvatar
            name={event.official.name}
            photoUrl={event.official.photoUrl}
            size="sm"
          />
          <span className="text-sm text-gray-700">
            {event.official.name} ({event.official.title})
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {event.location && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.291 5.597a15.591 15.591 0 0 0 2.236 2.235l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
              </svg>
              {event.location}
            </span>
          )}
          <span>
            {event._count.questions} {event._count.questions === 1 ? "question" : "questions"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(20),
    getPastEvents(10),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-gray-600">
            Town halls, public forums, and Q&amp;A sessions. Submit your questions ahead of time
            and upvote the ones you want officials to answer first.
          </p>
        </div>

        {/* Upcoming / Live */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Upcoming &amp; Live</h2>
          {upcoming.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500">No upcoming events right now.</p>
              <p className="mt-1 text-sm text-gray-400">
                Check back soon — moderators add events as public meetings are scheduled.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* AMA / Live Q&A placeholder */}
        <section id="ama" className="mb-10">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-purple-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                Coming Soon
              </span>
              <h2 className="text-lg font-semibold text-purple-900">Live Q&amp;A Events</h2>
            </div>
            <p className="mb-3 leading-relaxed text-purple-800">
              We&apos;re building the ability to hold live, online Ask Me Anything (AMA) sessions
              with your elected officials. During a live Q&amp;A, constituents can submit questions
              in real time, upvote the ones that matter most, and watch as officials respond directly.
            </p>
            <ul className="mb-4 space-y-1.5 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-purple-400">&bull;</span>
                Submit and upvote questions during a live session
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-purple-400">&bull;</span>
                Join a moderated discussion thread alongside the Q&amp;A
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-purple-400">&bull;</span>
                Catch up on past AMAs with full question-and-answer transcripts
              </li>
            </ul>
            <p className="text-sm text-purple-600">
              Stay tuned &mdash; the first live Q&amp;A events will be announced here soon.
            </p>
          </div>
        </section>

        {/* Past events */}
        {past.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Past Events</h2>
            <div className="space-y-4">
              {past.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
