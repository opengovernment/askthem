import { getQuestionsByStatus, getQuestionCounts, getConstituentCountsForQuestions, getFlaggedQuestions } from "@/lib/queries";
import { ModerationQueue } from "@/components/ModerationQueue";
import { UserManagement } from "@/components/UserManagement";
import { DailyQuestionLimit } from "@/components/DailyQuestionLimit";
import { SiteModeToggles } from "@/components/SiteModeToggles";
import { ModeratorManagement } from "@/components/ModeratorManagement";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ModeratePage({ searchParams }: PageProps) {
  // Server-side role check (middleware handles auth redirect)
  const session = await auth();
  if (!session?.user || (session.user.role !== "moderator" && session.user.role !== "admin")) {
    redirect("/");
  }

  const siteSettings = await prisma.siteSetting.findMany();
  const settingsMap = new Map(siteSettings.map((s) => [s.key, s.value]));
  const dailyQuestionLimit = Number(settingsMap.get("dailyQuestionLimit") ?? "5");
  const readOnlyMode = settingsMap.get("readOnlyMode") === "true";
  const maintenanceMode = settingsMap.get("maintenanceMode") === "true";

  const { tab } = await searchParams;
  const activeTab = tab || "pending_review";
  const counts = await getQuestionCounts();
  const questions = activeTab === "flagged"
    ? await getFlaggedQuestions()
    : await getQuestionsByStatus(activeTab);

  // Fetch constituent counts for the published tab (needed for threshold progress)
  const constituentCounts =
    activeTab === "published" && questions.length > 0
      ? await getConstituentCountsForQuestions(questions.map((q) => q.id))
      : undefined;

  const tabs = [
    { key: "pending_review", label: "Pending Review", count: counts.pendingReview },
    { key: "published", label: "Published", count: counts.published },
    { key: "delivered", label: "Delivered", count: counts.delivered },
    { key: "answered", label: "Answered", count: counts.answered },
    { key: "flagged", label: "Flagged", count: counts.flagged },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Back to site
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
              <p className="mt-1 text-gray-500">
                Review, approve, and manage submitted questions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/moderate/users"
                className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                All Users
              </Link>
              <Link
                href="/moderate/responders"
                className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Responder Applications
              </Link>
              <Link
                href="/moderate/events"
                className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Manage Events
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/moderate/groups"
                  className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  Manage Groups
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/moderate?tab=${t.key}`}
              className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                  t.key === "flagged" && t.count > 0
                    ? "bg-red-100 text-red-700"
                    : activeTab === t.key
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Question list */}
        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No questions with this status.</p>
          </div>
        ) : (
          <ModerationQueue questions={questions} activeTab={activeTab} constituentCounts={constituentCounts} />
        )}

        {/* User Management */}
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-1 text-xl font-bold text-gray-900">User Management</h2>
          <p className="mb-4 text-sm text-gray-500">
            Search for users by email or name to ban, pause, or {session.user.role === "admin" ? "delete" : "manage"} accounts.
          </p>
          <UserManagement isAdmin={session.user.role === "admin"} />
        </section>

        {/* Moderator Management (admin only) */}
        {session.user.role === "admin" && (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="mb-1 text-xl font-bold text-gray-900">Moderator Management</h2>
            <p className="mb-4 text-sm text-gray-500">
              Search for users to promote to moderator, or remove existing moderators.
            </p>
            <ModeratorManagement />
          </section>
        )}

        {/* Site Settings */}
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-1 text-xl font-bold text-gray-900">Site Settings</h2>
          <p className="mb-4 text-sm text-gray-500">
            Global limits that apply to all registered users. Moderators and admins are exempt.
          </p>
          <DailyQuestionLimit initialLimit={dailyQuestionLimit} />
          <div className="mt-6">
            <SiteModeToggles initialReadOnly={readOnlyMode} initialMaintenance={maintenanceMode} />
          </div>
        </section>
      </div>
    </div>
  );
}
