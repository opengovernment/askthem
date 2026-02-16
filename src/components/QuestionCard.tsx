"use client";

import Link from "next/link";
import { UpvoteButton } from "./UpvoteButton";
import { ShareButton } from "./ShareButton";
import { VerifiedBadge } from "./VerifiedBadge";
import { OfficialAvatar } from "./OfficialAvatar";

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    status: string;
    upvoteCount: number;
    districtTag: string;
    createdAt: Date;
    author: { id: string; name: string; city: string | null; state: string | null; isProfilePublic?: boolean };
    official: { id: string; name: string; title: string; photoUrl?: string | null };
    categoryTags: { tag: string }[];
    group?: { id: string; name: string; slug: string; isVerified: boolean } | null;
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  published: { label: "Published", color: "bg-blue-100 text-blue-800" },
  delivered: { label: "Delivered", color: "bg-purple-100 text-purple-800" },
  answered: { label: "Answered", color: "bg-green-100 text-green-800" },
};

export function QuestionCard({ question }: QuestionCardProps) {
  const status = statusLabels[question.status] ?? statusLabels.published;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <UpvoteButton questionId={question.id} initialCount={question.upvoteCount} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full font-medium ${
              question.status === "answered"
                ? "bg-green-100 px-3 py-1 text-sm text-green-800"
                : `px-2.5 py-0.5 text-xs ${status.color}`
            }`}>
              {question.status === "answered" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              )}
              {status.label}
            </span>
            <Link
              href={`/officials/${question.official.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <OfficialAvatar name={question.official.name} photoUrl={question.official.photoUrl ?? null} size="sm" />
              To: {question.official.name} ({question.official.title})
            </Link>
          </div>
          <Link href={`/questions/${question.id}`} className="group">
            <h3 className="mb-2 text-lg font-medium text-gray-900 group-hover:text-indigo-600">
              {question.text}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            {question.group?.isVerified ? (
              <span className="inline-flex items-center gap-1">
                Asked by <span className="font-medium text-gray-700">{question.group.name}</span>
                <VerifiedBadge />
              </span>
            ) : (
              <span>
                Asked by{" "}
                {question.author.isProfilePublic ? (
                  <Link
                    href={`/profile/${question.author.id}`}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {question.author.name}
                  </Link>
                ) : (
                  question.author.name
                )}
                {question.author.city && question.author.state
                  ? ` from ${question.author.city}, ${question.author.state}`
                  : ""}
              </span>
            )}
            <span>&middot;</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            <span>&middot;</span>
            <ShareButton questionId={question.id} text={question.text} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {question.categoryTags.map((ct) => (
              <span
                key={ct.tag}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {ct.tag}
              </span>
            ))}
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
              {question.districtTag}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
