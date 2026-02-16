"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Official {
  id: string;
  name: string;
  title: string;
  state: string;
}

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  official: { id: string; name: string; title: string; state: string };
  _count: { questions: number };
}

interface EventManagementProps {
  events: EventItem[];
  officials: Official[];
  activeTab: string;
}

const statusStyles: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-800" },
  live: { label: "Live Now", color: "bg-red-100 text-red-800" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", color: "bg-yellow-100 text-yellow-800" },
};

// ── Create Event Form ──────────────────────────────────────────────

function CreateEventForm({ officials }: { officials: Official[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      action: "create",
      title: form.get("title") as string,
      description: form.get("description") as string,
      officialId: form.get("officialId") as string,
      location: form.get("location") as string,
      startsAt: form.get("startsAt") as string,
      endsAt: (form.get("endsAt") as string) || undefined,
    };

    try {
      const res = await fetch("/api/events/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create event");
        return;
      }
      router.refresh();
      // Reset the form
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New Event</h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder='e.g. "Town Hall: Healthcare Q&A with Sen. Smith"'
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            placeholder="What is this event about? What topics will be covered?"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="officialId" className="mb-1 block text-sm font-medium text-gray-700">
            Official
          </label>
          <select
            id="officialId"
            name="officialId"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select an official...</option>
            {officials.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} — {o.title}, {o.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
            Location <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder='e.g. "City Hall, Room 200" or "Virtual"'
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className="mb-1 block text-sm font-medium text-gray-700">
              Starts at
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="endsAt" className="mb-1 block text-sm font-medium text-gray-700">
              Ends at <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}

// ── Event Card ──────────────────────────────────────────────────────

function EventCard({ event }: { event: EventItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const status = statusStyles[event.status] ?? statusStyles.upcoming;

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/events/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", eventId: event.id, status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  const statusButtons: Record<string, { label: string; next: string; style: string }[]> = {
    upcoming: [
      { label: "Go Live", next: "live", style: "bg-red-600 text-white hover:bg-red-700" },
      { label: "Cancel", next: "cancelled", style: "border border-gray-300 text-gray-600 hover:bg-gray-50" },
    ],
    live: [
      { label: "Mark Completed", next: "completed", style: "bg-green-600 text-white hover:bg-green-700" },
    ],
    cancelled: [
      { label: "Reopen", next: "upcoming", style: "border border-gray-300 text-gray-600 hover:bg-gray-50" },
    ],
    completed: [],
  };

  const actions = statusButtons[event.status] ?? [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(event.startsAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {" at "}
            {new Date(event.startsAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        <Link
          href={`/events/${event.slug}`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          View public page &rarr;
        </Link>
      </div>

      <h4 className="mb-1 text-base font-semibold text-gray-900">{event.title}</h4>
      <p className="mb-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>
          {event.official.name} ({event.official.title}, {event.official.state})
        </span>
        {event.location && <span>&middot; {event.location}</span>}
        <span>&middot; {event._count.questions} questions</span>
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((btn) => (
            <button
              key={btn.next}
              onClick={() => updateStatus(btn.next)}
              disabled={loading}
              className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${btn.style}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function EventManagement({ events, officials, activeTab }: EventManagementProps) {
  if (activeTab === "create") {
    return <CreateEventForm officials={officials} />;
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No events with this status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
