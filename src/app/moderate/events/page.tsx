import { prisma } from "@/lib/prisma";
import { getAllOfficials } from "@/lib/queries";
import { EventManagement } from "@/components/EventManagement";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Events - AskThem Moderator",
};

const eventInclude = {
  official: { select: { id: true, name: true, title: true, state: true } },
  _count: { select: { questions: true } },
} as const;

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ManageEventsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "moderator" && session.user.role !== "admin")) {
    redirect("/");
  }

  const { tab } = await searchParams;
  const activeTab = tab || "upcoming";

  const [events, officials, upcomingCount, liveCount, completedCount, cancelledCount] =
    await Promise.all([
      activeTab !== "create"
        ? prisma.event.findMany({
            where: { status: activeTab },
            include: eventInclude,
            orderBy: activeTab === "completed" ? { startsAt: "desc" as const } : { startsAt: "asc" as const },
          })
        : Promise.resolve([]),
      getAllOfficials(),
      prisma.event.count({ where: { status: "upcoming" } }),
      prisma.event.count({ where: { status: "live" } }),
      prisma.event.count({ where: { status: "completed" } }),
      prisma.event.count({ where: { status: "cancelled" } }),
    ]);

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
    { key: "live", label: "Live", count: liveCount },
    { key: "completed", label: "Completed", count: completedCount },
    { key: "cancelled", label: "Cancelled", count: cancelledCount },
    { key: "create", label: "+ New Event", count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <Link
            href="/moderate"
            className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; Back to moderation
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="mt-1 text-gray-500">
            Create and manage town halls, public forums, and Q&amp;A sessions.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/moderate/events?tab=${t.key}`}
              className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                    activeTab === t.key
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        <EventManagement
          events={JSON.parse(JSON.stringify(events))}
          officials={officials.map((o) => ({
            id: o.id,
            name: o.name,
            title: o.title,
            state: o.state,
          }))}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}
