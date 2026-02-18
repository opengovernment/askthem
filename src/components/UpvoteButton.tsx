"use client";

import { useState } from "react";
import Link from "next/link";
import { SignerCommentForm } from "./SignerComments";

interface OfficialSummary {
  id: string;
  name: string;
  title: string;
  state: string;
  district: string | null;
}

interface UpvoteButtonProps {
  questionId: string;
  initialCount: number;
  questionText?: string;
  officialName?: string;
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

export function UpvoteButton({ questionId, initialCount, questionText, officialName }: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isConstituent, setIsConstituent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gateReason, setGateReason] = useState<"sign_in" | "address" | "not_constituent" | null>(null);
  const [yourOfficials, setYourOfficials] = useState<OfficialSummary[]>([]);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

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
        // Show share prompt only on new signatures, not on un-signing
        if (data.upvoted && !wasUpvoted) {
          setShowSharePrompt(true);
        }
      } else {
        setHasUpvoted(wasUpvoted);
        setCount(wasUpvoted ? count : count);
        if (res.status === 401) {
          setGateReason("sign_in");
        } else {
          const data = await res.json().catch(() => ({}));
          if (data.notConstituent) {
            setGateReason("not_constituent");
            setYourOfficials(data.yourOfficials ?? []);
          } else if (data.addressRequired) {
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

      {/* Gate callout — not a constituent of this official */}
      {gateReason === "not_constituent" && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 animate-[fadeSlideIn_0.25s_ease-out] rounded-lg border border-indigo-200 bg-white p-4 shadow-lg">
          <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-indigo-200 bg-white" />
          <p className="mb-1 text-center text-sm font-semibold text-gray-800">
            This one&apos;s not your rep!
          </p>
          <p className="mb-3 text-center text-xs text-gray-500">
            You can only sign questions to your own elected officials. But the good news? Your reps are waiting to hear from you:
          </p>
          {yourOfficials.length > 0 ? (
            <div className="max-h-40 space-y-1.5 overflow-y-auto">
              {yourOfficials.map((o) => (
                <Link
                  key={o.id}
                  href={`/officials/${o.id}`}
                  className="flex items-center gap-2 rounded-md border border-gray-100 bg-indigo-50 px-3 py-2 text-left transition-colors hover:bg-indigo-100"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold text-indigo-800">
                    {o.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-indigo-800">{o.name}</span>
                    <span className="block truncate text-[10px] text-gray-500">{o.title}</span>
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0 text-indigo-400">
                    <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href="/questions"
              className="block rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
            >
              Browse all questions
            </Link>
          )}
          <button
            onClick={() => setGateReason(null)}
            className="mt-2 block w-full text-center text-xs text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Post-signature share prompt */}
      {showSharePrompt && (
        <PostSignatureShare
          questionId={questionId}
          questionText={questionText}
          officialName={officialName}
          onClose={() => setShowSharePrompt(false)}
        />
      )}
    </div>
  );
}

function PostSignatureShare({
  questionId,
  questionText,
  officialName,
  onClose,
}: {
  questionId: string;
  questionText?: string;
  officialName?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/questions/${questionId}`
    : "";
  const shareText = questionText && officialName
    ? `I just signed a question to ${officialName}: "${questionText.length > 100 ? questionText.slice(0, 100) + "..." : questionText}" — Add your name on AskThem`
    : "I just signed a question on AskThem — Add your name!";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);
  const emailSubject = encodeURIComponent(
    officialName
      ? `Sign this question to ${officialName} on AskThem`
      : "Sign this question on AskThem",
  );
  const emailBody = encodeURIComponent(
    `${shareText}\n\n${url}`,
  );

  return (
    <div className="absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 animate-[fadeSlideIn_0.25s_ease-out] rounded-lg border border-green-200 bg-white p-4 shadow-lg">
      <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-green-200 bg-white" />
      <p className="mb-1 text-center text-sm font-semibold text-green-800">
        Thanks for signing!
      </p>
      <p className="mb-3 text-center text-xs text-gray-500">
        Share this question to help it reach the delivery threshold
      </p>

      <div className="grid grid-cols-2 gap-2">
        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          Post
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md bg-[#1877F2] px-3 py-2 text-xs font-medium text-white hover:bg-[#166FE5]"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Share
        </a>

        {/* Bluesky */}
        <a
          href={`https://bsky.app/intent/compose?text=${encodeURIComponent(shareText + " " + url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md bg-[#0085FF] px-3 py-2 text-xs font-medium text-white hover:bg-[#0077E6]"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 568 501"><path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.89-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C10.945 203.66 1 75.293 1 57.947 1-28.906 76.134-1.611 123.121 33.664z"/></svg>
          Post
        </a>

        {/* Email */}
        <a
          href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
          className="flex items-center justify-center gap-1.5 rounded-md bg-gray-600 px-3 py-2 text-xs font-medium text-white hover:bg-gray-500"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg>
          Email
        </a>
      </div>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
      >
        {copied ? (
          <>
            <svg className="h-3.5 w-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
            <span className="text-green-600">Link copied!</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z"/><path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865z"/></svg>
            Copy link
          </>
        )}
      </button>

      {/* Why I signed comment form */}
      <SignerCommentForm questionId={questionId} />

      <button
        onClick={onClose}
        className="mt-2 block w-full text-center text-xs text-gray-400 hover:text-gray-600"
      >
        Dismiss
      </button>
    </div>
  );
}
