import { prisma } from "@/lib/prisma";
import { ResponderManagement } from "@/components/ResponderManagement";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Responder Applications - AskThem Moderator",
};

export default async function ManageRespondersPage() {
  // TODO: Temporarily allowing all authenticated users. Restore role check:
  //   if (!session?.user || (session.user.role !== "moderator" && session.user.role !== "admin")) { redirect("/"); }
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const [pendingApplications, pendingCount] = await Promise.all([
    prisma.responderApplication.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.responderApplication.count({ where: { status: "pending" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <Link href="/moderate" className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Back to moderation
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Responder Applications</h1>
          <p className="mt-1 text-gray-500">
            Review applications from elected officials who want to become verified responders.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>

        <ResponderManagement applications={JSON.parse(JSON.stringify(pendingApplications))} />
      </div>
    </div>
  );
}
