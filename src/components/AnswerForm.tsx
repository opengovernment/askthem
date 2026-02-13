"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnswerFormProps {
  questionId: string;
  officialName: string;
}

export function AnswerForm({ questionId, officialName }: AnswerFormProps) {
  const [responseText, setResponseText] = useState("");
  const [responseVideoUrl, setResponseVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!responseText.trim() && !responseVideoUrl.trim()) return;

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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post answer");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
      <h3 className="mb-1 text-lg font-semibold text-amber-900">Post Official Response</h3>
      <p className="mb-4 text-sm text-amber-700">
        Post a response on behalf of {officialName}. This will mark the question as answered.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="responseText" className="mb-1 block text-sm font-medium text-gray-700">
            Response Text
          </label>
          <textarea
            id="responseText"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            placeholder="Enter the official's response..."
          />
        </div>

        <div>
          <label htmlFor="responseVideoUrl" className="mb-1 block text-sm font-medium text-gray-700">
            Video URL (optional)
          </label>
          <input
            id="responseVideoUrl"
            type="url"
            value={responseVideoUrl}
            onChange={(e) => setResponseVideoUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || (!responseText.trim() && !responseVideoUrl.trim())}
          className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Answer"}
        </button>
      </form>
    </div>
  );
}
