"use client";

import { useState } from "react";

interface ReportButtonProps {
  questionId: string;
  isSignedIn: boolean;
}

export function ReportButton({ questionId, isSignedIn }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/questions/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, reason: reason.trim() }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Could not submit report. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="mt-6 text-center text-xs text-gray-400">
        Thank you for your report. Our moderators will review it.
      </p>
    );
  }

  if (!open) {
    return (
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            if (!isSignedIn) {
              setError("Please sign in to report a question.");
              return;
            }
            setOpen(true);
          }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Report this question
        </button>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <form onSubmit={handleSubmit}>
        <label htmlFor="flag-reason" className="mb-1.5 block text-sm font-medium text-gray-700">
          Why are you reporting this question?
        </label>
        <textarea
          id="flag-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly explain why this question violates our Q&A rules..."
          maxLength={500}
          rows={3}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{reason.length}/500</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setReason("");
                setError("");
              }}
              className="rounded px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || reason.trim().length < 5}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:bg-gray-300"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </form>
    </div>
  );
}
