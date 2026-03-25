"use client";

import { useState } from "react";
import { POLICY_AREAS } from "@/lib/types";

interface AmaQuestionFormProps {
  eventId: string;
  officialId: string;
  officialName: string;
}

export function AmaQuestionForm({ eventId, officialId, officialName }: AmaQuestionFormProps) {
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || selectedTags.length === 0 || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officialId,
          text: text.trim(),
          tags: selectedTags,
          eventId,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setText("");
        setSelectedTags([]);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
        <p className="mb-1 text-sm font-semibold text-green-800">Question submitted!</p>
        <p className="mb-3 text-xs text-green-700">
          It will appear after passing our content safety check.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium text-green-700 underline hover:text-green-800"
        >
          Ask another question
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder={`What would you like to ask ${officialName}?`}
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <p className="mt-1 text-right text-xs text-gray-400">{text.length}/500</p>

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-gray-500">Policy area (pick 1-3):</p>
        <div className="flex flex-wrap gap-1.5">
          {POLICY_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleTag(area)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
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

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !text.trim() || selectedTags.length === 0}
        className="mt-4 w-full rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {submitting ? "Submitting..." : "Submit Question"}
      </button>
    </form>
  );
}
