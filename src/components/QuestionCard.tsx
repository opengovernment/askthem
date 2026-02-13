"use client";

import Link from "next/link";
import { Question } from "@/lib/types";
import { getOfficialById } from "@/lib/mock-data";
import { UpvoteButton } from "./UpvoteButton";

interface QuestionCardProps {
  question: Question;
}

const statusLabels: Record<Question["status"], { label: string; color: string }> = {
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  published: { label: "Published", color: "bg-blue-100 text-blue-800" },
  delivered: { label: "Delivered", color: "bg-purple-100 text-purple-800" },
  answered: { label: "Answered", color: "bg-green-100 text-green-800" },
};

export function QuestionCard({ question }: QuestionCardProps) {
  const official = getOfficialById(question.officialId);
  const status = statusLabels[question.status];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <UpvoteButton questionId={question.id} initialCount={question.upvoteCount} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
            {official && (
              <Link
                href={`/officials/${official.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                To: {official.name} ({official.title})
              </Link>
            )}
          </div>
          <Link href={`/questions/${question.id}`} className="group">
            <h3 className="mb-2 text-lg font-medium text-gray-900 group-hover:text-indigo-600">
              {question.text}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>
              Asked by {question.authorName} from {question.authorCity}, {question.authorState}
            </span>
            <span>&middot;</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {question.categoryTags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
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
