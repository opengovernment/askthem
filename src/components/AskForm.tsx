"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { POLICY_AREAS } from "@/lib/types";

interface OfficialOption {
  id: string;
  name: string;
  title: string;
  state: string;
  district: string | null;
}

interface GroupOption {
  id: string;
  name: string;
}

interface ModerationFeedback {
  result: "pass" | "fail" | "error";
  reason: string;
  suggestion: string | null;
}

interface AskFormProps {
  /** When provided, the question is linked to this event */
  eventId?: string;
  /** When provided, locks the official selector to this ID */
  lockedOfficialId?: string;
  /** When provided, shows the event name in the header context */
  eventName?: string;
}

export function AskForm({ eventId: propEventId, lockedOfficialId, eventName }: AskFormProps = {}) {
  const searchParams = useSearchParams();
  const [officials, setOfficials] = useState<OfficialOption[]>([]);
  const [selectedOfficial, setSelectedOfficial] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [loadingOfficials, setLoadingOfficials] = useState(true);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // AI moderation state
  const [moderationFeedback, setModerationFeedback] = useState<ModerationFeedback | null>(null);
  const [isCheckingModeration, setIsCheckingModeration] = useState(false);
  const moderationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedTextRef = useRef<string>("");

  // Resolve eventId from prop or URL search param
  const eventId = propEventId || searchParams.get("eventId") || undefined;

  useEffect(() => {
    fetch("/api/officials")
      .then((res) => res.json())
      .then((data: OfficialOption[]) => {
        setOfficials(data);
        // Pre-select official from prop or ?official=<id> query param
        const preselect = lockedOfficialId || searchParams.get("official");
        if (preselect && data.some((o) => o.id === preselect)) {
          setSelectedOfficial(preselect);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingOfficials(false));

    // Fetch user's verified groups (if any)
    fetch("/api/groups/my-groups")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: GroupOption[]) => setGroups(data))
      .catch(() => {});
  }, [searchParams]);

  // Debounced AI moderation check — runs 1.5s after user stops typing
  const runModerationCheck = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 10 || trimmed === lastCheckedTextRef.current) return;

    lastCheckedTextRef.current = trimmed;
    setIsCheckingModeration(true);

    try {
      const res = await fetch("/api/moderation/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (res.ok) {
        const data: ModerationFeedback = await res.json();
        setModerationFeedback(data);
      } else {
        // Don't block user on moderation errors
        setModerationFeedback(null);
      }
    } catch {
      setModerationFeedback(null);
    } finally {
      setIsCheckingModeration(false);
    }
  }, []);

  function handleQuestionTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newText = e.target.value;
    setQuestionText(newText);

    // Clear previous moderation feedback when user starts editing again
    if (moderationFeedback?.result === "fail") {
      // Keep showing the feedback while they edit so they can reference the suggestion
    }

    // Debounce the moderation check
    if (moderationTimerRef.current) {
      clearTimeout(moderationTimerRef.current);
    }

    if (newText.trim().length >= 10) {
      moderationTimerRef.current = setTimeout(() => {
        runModerationCheck(newText);
      }, 1500);
    } else {
      setModerationFeedback(null);
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (moderationTimerRef.current) {
        clearTimeout(moderationTimerRef.current);
      }
    };
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOfficial || !questionText.trim() || selectedTags.length === 0) return;

    // If the question failed moderation and user hasn't changed text, block submission
    if (moderationFeedback?.result === "fail" && questionText.trim() === lastCheckedTextRef.current) {
      setError(
        "Your question does not appear to relate to Official Conduct. Please revise your question using the suggestion above before submitting."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officialId: selectedOfficial,
          text: questionText.trim(),
          tags: selectedTags,
          groupId: selectedGroupId || undefined,
          videoUrl: videoUrl.trim() || undefined,
          eventId: eventId || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        if (data.dailyLimitReached) {
          setLimitReached(true);
        }
        if (data.moderationFailed) {
          setModerationFeedback({
            result: "fail",
            reason: data.moderationReason || "Question does not relate to Official Conduct.",
            suggestion: data.moderationSuggestion || null,
          });
        }
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-8 w-8 text-green-600"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Question Submitted!</h1>
          <p className="mb-2 text-gray-600">
            Your question has been submitted for review. It will be published after passing our
            content safety check.
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Note: Questions are not marked as &ldquo;delivered&rdquo; until your name and address
            are verified.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to all questions
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Ask a Question</h1>
        <p className="mb-8 text-gray-600">
          Submit a question to one of your elected officials. Your question will be reviewed for
          safety before being published.
        </p>

        {/* Official Conduct Guidelines */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-1 text-sm font-semibold text-blue-900">Official Conduct Guidelines</h3>
          <p className="text-sm text-blue-800">
            Questions must relate to an official&apos;s <strong>public duties</strong>, <strong>voting record</strong>,{" "}
            <strong>policy positions</strong>, or <strong>use of public resources</strong>. Questions about
            personal matters unrelated to their official role will not be accepted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ask as Group (only shown if user has verified groups) */}
          {groups.length > 0 && (
            <div>
              <label htmlFor="group" className="mb-2 block text-sm font-medium text-gray-700">
                Ask as (optional)
              </label>
              <select
                id="group"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              >
                <option value="">Yourself (individual)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} (Verified Group)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select a verified group to ask on behalf of your organization.
              </p>
            </div>
          )}

          {/* Select Official */}
          <div>
            <label htmlFor="official" className="mb-2 block text-sm font-medium text-gray-700">
              Select an Elected Official
            </label>
            {!loadingOfficials && officials.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="mb-2 font-medium">No officials found for your account.</p>
                <p>
                  <Link href="/address" className="font-medium underline hover:text-amber-900">
                    Enter your address
                  </Link>{" "}
                  to find your elected representatives, then come back to ask a question.
                </p>
              </div>
            ) : (
              <select
                id="official"
                value={selectedOfficial}
                onChange={(e) => setSelectedOfficial(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              >
                <option value="">Choose an official...</option>
                {officials.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} &mdash; {o.title}, {o.state}
                    {o.district ? ` (${o.district})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Question Text */}
          <div>
            <label htmlFor="question" className="mb-2 block text-sm font-medium text-gray-700">
              Your Question
            </label>
            <textarea
              id="question"
              value={questionText}
              onChange={handleQuestionTextChange}
              rows={4}
              maxLength={500}
              placeholder="What would you like to ask your elected official about their public duties, voting record, or policy positions?"
              className={`w-full rounded-lg border px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
                moderationFeedback?.result === "fail"
                  ? "border-amber-400 focus:border-amber-500 focus:ring-amber-200"
                  : moderationFeedback?.result === "pass"
                    ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
              }`}
            />
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCheckingModeration && (
                  <span className="text-xs text-gray-400">Checking guidelines...</span>
                )}
                {!isCheckingModeration && moderationFeedback?.result === "pass" && (
                  <span className="text-xs text-green-600">Meets Official Conduct guidelines</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {questionText.length}/500 characters
              </p>
            </div>
          </div>

          {/* AI Moderation Feedback — shown when question fails Official Conduct check */}
          {moderationFeedback?.result === "fail" && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-amber-600">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Outside Official Conduct Guidelines</h4>
                  <p className="mt-1 text-sm text-amber-800">{moderationFeedback.reason}</p>
                  {moderationFeedback.suggestion && (
                    <div className="mt-3 rounded-md border border-amber-200 bg-white p-3">
                      <p className="text-xs font-medium text-amber-700">Suggestion to align with guidelines:</p>
                      <p className="mt-1 text-sm text-gray-700">{moderationFeedback.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Category Tags */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Policy Area Tags (pick at least 1, up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {POLICY_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleTag(area)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    selectedTags.includes(area)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Video Link (optional) */}
          <div>
            <label htmlFor="videoUrl" className="mb-2 block text-sm font-medium text-gray-700">
              Video Link (optional)
            </label>
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or TikTok, Instagram, X link"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add a short video to make your question more compelling. Supports YouTube, TikTok, Instagram, X/Twitter, Bluesky, and Facebook.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || limitReached || !selectedOfficial || !questionText.trim() || selectedTags.length === 0}
            className="w-full rounded-full bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Submitting..." : "Submit Question for Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
