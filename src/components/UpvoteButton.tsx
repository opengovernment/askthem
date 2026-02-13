"use client";

import { useState } from "react";

interface UpvoteButtonProps {
  questionId: string;
  initialCount: number;
}

export function UpvoteButton({ questionId, initialCount }: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  function handleUpvote() {
    if (hasUpvoted) {
      setCount(count - 1);
      setHasUpvoted(false);
    } else {
      setCount(count + 1);
      setHasUpvoted(true);
    }
    // TODO: In production, call API to persist upvote
    // and verify user is a constituent of this official
    void questionId;
  }

  return (
    <button
      onClick={handleUpvote}
      className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
        hasUpvoted
          ? "bg-indigo-100 text-indigo-700"
          : "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
      aria-label={hasUpvoted ? "Remove upvote" : "Upvote this question"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm font-semibold">{count}</span>
    </button>
  );
}
