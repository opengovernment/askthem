"use client";

import { useState } from "react";
import Link from "next/link";

interface UpvoteButtonProps {
  questionId: string;
  initialCount: number;
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function UpvoteButton({ questionId, initialCount }: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isConstituent, setIsConstituent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gateReason, setGateReason] = useState<"sign_in" | "address" | null>(null);

  async function handleUpvote() {
    if (isLoading) return;
    setIsLoading(true);
    setGateReason(null);

    const wasUpvoted = hasUpvoted;
    setHasUpvoted(!wasUpvoted);
    setCount(wasUpvoted ? count - 1 : count + 1);

    try {
      const res = await fetch("/api/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setHasUpvoted(data.upvoted);
        setCount(data.upvoteCount);
        setIsConstituent(data.isConstituent);
      } else {
        setHasUpvoted(wasUpvoted);
        setCount(wasUpvoted ? count : count);
        if (res.status === 401) {
          setGateReason("sign_in");
        } else {
          const data = await res.json().catch(() => ({}));
          if (data.addressRequired) {
            setGateReason("address");
          }
        }
      }
    } catch {
      setHasUpvoted(wasUpvoted);
      setCount(count);
    } finally {
      setIsLoading(false);
    }
  }

  // After first interaction we know their status
  const showConstituent = hasUpvoted && isConstituent === true;
  const showSupporter = hasUpvoted && isConstituent === false;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleUpvote}
        disabled={isLoading}
        className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
          showConstituent
            ? "bg-indigo-100 text-indigo-700"
            : showSupporter
              ? "bg-amber-50 text-amber-700"
              : hasUpvoted
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
        } disabled:opacity-50`}
        aria-label={hasUpvoted ? "Remove your signature" : "Sign this question"}
      >
        {showSupporter ? <EyeIcon /> : <ArrowIcon />}
        <span className="text-sm font-semibold">{count}</span>
      </button>
      {showConstituent && (
        <span className="text-[10px] font-medium text-indigo-600">Signed</span>
      )}
      {showSupporter && (
        <span className="text-[10px] font-medium text-amber-600">Supported</span>
      )}
      {gateReason === "sign_in" && (
        <Link
          href="/auth/signin"
          className="mt-1 text-[10px] font-medium text-indigo-600 underline hover:text-indigo-800"
        >
          Sign in to sign
        </Link>
      )}
      {gateReason === "address" && (
        <Link
          href="/address"
          className="mt-1 text-[10px] font-medium text-amber-700 underline hover:text-amber-800"
        >
          Verify address
        </Link>
      )}
    </div>
  );
}
