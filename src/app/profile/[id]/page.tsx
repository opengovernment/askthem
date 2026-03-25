import { getPublicProfile, getPublicQuestionsForUser } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) return { title: "Profile Not Found - AskThem" };

  return {
    title: `${profile.name} - AskThem`,
    description: `Questions asked by ${profile.name} on AskThem.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  const questions = await getPublicQuestionsForUser(id);

  const answeredCount = questions.filter((q) => q.status === "answered").length;
  const deliveredCount = questions.filter((q) => q.status === "delivered").length;
  const totalUpvotes = questions.reduce((sum, q) => sum + q.upvoteCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/questions"
          className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; All Questions
        </Link>

        {/* Profile header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {profile.image ? (
              <img
                src={profile.image}
                alt=""
                className="h-14 w-14 rounded-full"
              />
            ) : (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                {(profile.name ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.name ?? "Anonymous"}
              </h1>
              <p className="text-sm text-gray-500">
                {profile.city && profile.state
                  ? `${profile.city}, ${profile.state} · `
                  : ""}
                Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {questions.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {questions.length}
              </p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {answeredCount}
              </p>
              <p className="text-xs text-gray-500">Answered</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {deliveredCount}
              </p>
              <p className="text-xs text-gray-500">Delivered</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {totalUpvotes.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Signatures</p>
            </div>
          </div>
        )}

        {/* Questions */}
        <h2 className="mb-4 text-xl font-bold text-gray-900">Questions</h2>
        {questions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              No published questions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
