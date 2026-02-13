"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnswerFormProps {
  questionId: string;
  officialName: string;
  compact?: boolean; // for inline use in moderation queue
}

export function AnswerForm({ questionId, officialName, compact }: AnswerFormProps) {
  const [responseText, setResponseText] = useState("");
  const [responseVideoUrl, setResponseVideoUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!responseText.trim() && !responseVideoUrl.trim() && !sourceUrl.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          responseText: responseText.trim() || undefined,
          responseVideoUrl: responseVideoUrl.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post answer");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-4 ${compact ? "mt-3" : "mt-6"}`}>
        <p className="text-sm font-medium text-green-700">Answer posted successfully.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-${compact ? "4" : "6"} ${compact ? "mt-3" : "mt-6"}`}>
      {!compact && (
        <>
          <h3 className="mb-1 text-lg font-semibold text-amber-900">Post Official Response</h3>
          <p className="mb-4 text-sm text-amber-700">
            Post a response on behalf of {officialName}. This will mark the question as answered.
          </p>
        </>
      )}
      {compact && (
        <p className="mb-3 text-sm font-medium text-amber-800">
          Post answer for {officialName}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor={`responseText-${questionId}`} className="mb-1 block text-sm font-medium text-gray-700">
            Response Text
          </label>
          <textarea
            id={`responseText-${questionId}`}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={compact ? 3 : 5}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            placeholder="Enter the official's response..."
          />
        </div>

        <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-3"}>
          <div>
            <label htmlFor={`responseVideoUrl-${questionId}`} className="mb-1 block text-sm font-medium text-gray-700">
              Video URL {compact ? "" : "(optional)"}
            </label>
            <input
              id={`responseVideoUrl-${questionId}`}
              type="url"
              value={responseVideoUrl}
              onChange={(e) => setResponseVideoUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label htmlFor={`sourceUrl-${questionId}`} className="mb-1 block text-sm font-medium text-gray-700">
              Source Link {compact ? "" : "(optional)"}
            </label>
            <input
              id={`sourceUrl-${questionId}`}
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              placeholder="Link to tweet, press release, gov website..."
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || (!responseText.trim() && !responseVideoUrl.trim() && !sourceUrl.trim())}
          className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Answer"}
        </button>
      </form>
    </div>
  );
}
