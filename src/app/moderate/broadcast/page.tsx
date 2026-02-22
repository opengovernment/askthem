import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BroadcastForm } from "@/components/BroadcastForm";
import { BatchHistory } from "@/components/BatchHistory";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "moderator" && session.user.role !== "admin")) {
    redirect("/");
  }

  // Load recent batches for the history section
  const batchQuestions = await prisma.question.findMany({
    where: { batchId: { not: null } },
    select: {
      batchId: true,
      text: true,
      status: true,
      createdAt: true,
      author: { select: { name: true, email: true } },
      categoryTags: { select: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by batchId
  const batchMap = new Map<string, {
    batchId: string;
    text: string;
    tags: string[];
    createdAt: string;
    createdBy: string;
    total: number;
    published: number;
    delivered: number;
    answered: number;
  }>();

  for (const q of batchQuestions) {
    if (!q.batchId) continue;
    const existing = batchMap.get(q.batchId);
    if (!existing) {
      batchMap.set(q.batchId, {
        batchId: q.batchId,
        text: q.text,
        tags: q.categoryTags.map((t) => t.tag),
        createdAt: q.createdAt.toISOString(),
        createdBy: q.author.name || q.author.email,
        total: 1,
        published: q.status === "published" ? 1 : 0,
        delivered: q.status === "delivered" ? 1 : 0,
        answered: q.status === "answered" ? 1 : 0,
      });
    } else {
      existing.total++;
      if (q.status === "published") existing.published++;
      if (q.status === "delivered") existing.delivered++;
      if (q.status === "answered") existing.answered++;
    }
  }

  const batches = [...batchMap.values()];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <Link href="/moderate" className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Broadcast Question</h1>
          <p className="mt-1 text-gray-500">
            Draft a question and publish it to a category of elected officials at once.
            Questions go live immediately (no moderation queue).
          </p>
        </div>

        <BroadcastForm />

        {/* Batch history */}
        {batches.length > 0 && (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="mb-1 text-xl font-bold text-gray-900">Previous Broadcasts</h2>
            <p className="mb-4 text-sm text-gray-500">
              Past broadcast batches. Click to edit question text or view status.
            </p>
            <BatchHistory batches={batches} />
          </section>
        )}
      </div>
    </div>
  );
}
