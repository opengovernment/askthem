"use client";

import { useState } from "react";

interface DailyQuestionLimitProps {
  initialLimit: number;
}

export function DailyQuestionLimit({ initialLimit }: DailyQuestionLimitProps) {
  const [limit, setLimit] = useState(String(initialLimit));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const num = Number(limit);
    if (!Number.isInteger(num) || num < 1 || num > 100) {
      setError("Must be a number between 1 and 100.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyQuestionLimit: num }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="daily-limit" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Questions per user per day
      </label>
      <input
        id="daily-limit"
        type="number"
        min={1}
        max={100}
        value={limit}
        onChange={(e) => {
          setLimit(e.target.value);
          setSaved(false);
        }}
        className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
      {saved && <span className="text-sm text-green-600">Saved</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
