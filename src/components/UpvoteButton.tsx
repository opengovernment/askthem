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
    <div className="relative flex flex-col items-center gap-1">
      <button
        onClick={handleUpvote}
        disabled={isLoading}
        className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
          gateReason
            ? "animate-[wiggle_0.4s_ease-in-out] bg-red-50 text-red-400"
            : showConstituent
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

      {/* Gate callout — sign in */}
      {gateReason === "sign_in" && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 animate-[fadeSlideIn_0.25s_ease-out] rounded-lg border border-indigo-200 bg-white p-4 shadow-lg">
          <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-indigo-200 bg-white" />
          <p className="mb-3 text-center text-sm font-medium text-gray-800">
            Sign in to add your signature to this question
          </p>
          <Link
            href="/auth/signin"
            className="block rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign In
          </Link>
          <button
            onClick={() => setGateReason(null)}
            className="mt-2 block w-full text-center text-xs text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Gate callout — verify address */}
      {gateReason === "address" && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 animate-[fadeSlideIn_0.25s_ease-out] rounded-lg border border-amber-200 bg-white p-4 shadow-lg">
          <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-amber-200 bg-white" />
          <p className="mb-3 text-center text-sm font-medium text-gray-800">
            Verify your address so we can confirm you are a constituent
          </p>
          <Link
            href="/address"
            className="block rounded-full bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700"
          >
            Verify Address
          </Link>
          <button
            onClick={() => setGateReason(null)}
            className="mt-2 block w-full text-center text-xs text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
