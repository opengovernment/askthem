"use client";

import { useState, useEffect } from "react";
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

export function AskForm() {
  const searchParams = useSearchParams();
  const [officials, setOfficials] = useState<OfficialOption[]>([]);
  const [selectedOfficial, setSelectedOfficial] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingOfficials, setLoadingOfficials] = useState(true);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    fetch("/api/officials")
      .then((res) => res.json())
      .then((data: OfficialOption[]) => {
        setOfficials(data);
        // Pre-select official from ?official=<id> query param
        const preselect = searchParams.get("official");
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

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOfficial || !questionText.trim() || selectedTags.length === 0) return;
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
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
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
              onChange={(e) => setQuestionText(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="What would you like to ask your elected official?"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {questionText.length}/500 characters
            </p>
          </div>

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
            disabled={isSubmitting || !selectedOfficial || !questionText.trim() || selectedTags.length === 0}
            className="w-full rounded-full bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Submitting..." : "Submit Question for Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
