import { prisma } from "@/lib/prisma";
import { GroupManagement } from "@/components/GroupManagement";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Groups - AskThem Moderator",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ManageGroupsPage({ searchParams }: PageProps) {
  // TODO: Temporarily allowing all authenticated users. Restore admin-only check:
  //   if (!session?.user || session.user.role !== "admin") { redirect("/"); }
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const { tab } = await searchParams;
  const activeTab = tab || "pending";

  const [pendingApplications, verifiedGroups, pendingCount, verifiedCount] = await Promise.all([
    activeTab === "pending"
      ? prisma.groupApplication.findMany({
          where: { status: "pending" },
          include: {
            group: {
              include: { adminUser: { select: { name: true, email: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    activeTab === "verified"
      ? prisma.group.findMany({
          where: { isVerified: true },
          include: {
            adminUser: { select: { name: true, email: true } },
            _count: { select: { questions: true } },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    prisma.groupApplication.count({ where: { status: "pending" } }),
    prisma.group.count({ where: { isVerified: true } }),
  ]);

  const tabs = [
    { key: "pending", label: "Pending Applications", count: pendingCount },
    { key: "verified", label: "Verified Groups", count: verifiedCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <Link href="/moderate" className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Back to moderation
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="mt-1 text-gray-500">
            Review group verification applications and manage verified groups.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/moderate/groups?tab=${t.key}`}
              className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                  activeTab === t.key
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            </Link>
          ))}
        </div>

        <GroupManagement
          pendingApplications={JSON.parse(JSON.stringify(pendingApplications))}
          verifiedGroups={JSON.parse(JSON.stringify(verifiedGroups))}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}
