"use client";

import { useState, useCallback } from "react";
import { POLICY_AREAS, US_STATES } from "@/lib/types";

const CHAMBER_OPTIONS = [
  { value: "senate", label: "U.S. Senate" },
  { value: "house", label: "U.S. House" },
  { value: "state_exec", label: "Governor / State Executive" },
  { value: "state_senate", label: "State Senate" },
  { value: "state_house", label: "State House" },
  { value: "local", label: "Local / County" },
] as const;

interface PreviewOfficial {
  id: string;
  name: string;
  title: string;
  party: string;
  state: string;
  district: string | null;
  chamber: string;
}

interface BatchResult {
  batchId: string;
  count: number;
  questionIds: string[];
}

export function BroadcastForm() {
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [targetState, setTargetState] = useState("");
  const [targetChambers, setTargetChambers] = useState<string[]>([]);

  const [preview, setPreview] = useState<PreviewOfficial[] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState("");

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev,
    );
  }, []);

  const toggleChamber = useCallback((chamber: string) => {
    setTargetChambers((prev) =>
      prev.includes(chamber) ? prev.filter((c) => c !== chamber) : [...prev, chamber],
    );
  }, []);

  const loadPreview = useCallback(async () => {
    setError("");
    setIsLoadingPreview(true);
    try {
      const params = new URLSearchParams();
      if (targetState) params.set("state", targetState);
      if (targetChambers.length > 0) params.set("chamber", targetChambers.join(","));

      const res = await fetch(`/api/officials?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load officials");
      const data = await res.json();
      setPreview(data.officials || data);
    } catch {
      setError("Failed to load matching officials. Try adjusting your filters.");
      setPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [targetState, targetChambers]);

  const publish = useCallback(async () => {
    setError("");

    if (text.trim().length < 10) {
      setError("Question must be at least 10 characters.");
      return;
    }
    if (selectedTags.length === 0) {
      setError("Select at least one policy area tag.");
      return;
    }
    if (!preview || preview.length === 0) {
      setError("Preview officials first before publishing.");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/moderate/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          tags: selectedTags,
          officialIds: preview.map((o) => o.id),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      const data: BatchResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish questions");
    } finally {
      setIsPublishing(false);
    }
  }, [text, selectedTags, preview]);

  // Success screen
  if (result) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-900">Questions Published</h3>
        <p className="mt-1 text-sm text-green-700">
          {result.count} question{result.count === 1 ? "" : "s"} published to officials.
        </p>
        <p className="mt-1 text-xs text-green-600">Batch ID: {result.batchId}</p>
        <button
          onClick={() => {
            setResult(null);
            setText("");
            setSelectedTags([]);
            setPreview(null);
          }}
          className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Create Another Broadcast
        </button>
      </div>
    );
  }

  const chamberLabel = (chamber: string) =>
    CHAMBER_OPTIONS.find((c) => c.value === chamber)?.label ?? chamber;

  return (
    <div className="space-y-6">
      {/* Step 1: Draft the question */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          1. Draft Your Question
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type the question that will be published to all selected officials..."
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">{text.length}/500 characters</p>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-gray-500">Policy area tags (1-3):</p>
          <div className="flex flex-wrap gap-1.5">
            {POLICY_AREAS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Target officials */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          2. Choose Target Officials
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">State (optional)</label>
            <select
              value={targetState}
              onChange={(e) => setTargetState(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            >
              <option value="">All States</option>
              {Object.entries(US_STATES).sort(([, a], [, b]) => a.localeCompare(b)).map(([abbr, name]) => (
                <option key={abbr} value={abbr}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Chamber / Level (select one or more)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CHAMBER_OPTIONS.map((ch) => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => toggleChamber(ch.value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    targetChambers.includes(ch.value)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={loadPreview}
          disabled={isLoadingPreview}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoadingPreview ? "Loading..." : "Preview Matching Officials"}
        </button>
      </div>

      {/* Step 3: Preview & publish */}
      {preview !== null && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            3. Review &amp; Publish
          </h3>

          {preview.length === 0 ? (
            <p className="text-sm text-gray-500">
              No officials match the selected criteria. Try broadening your filters.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{preview.length}</span> official
                {preview.length === 1 ? "" : "s"} will receive this question:
              </p>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded border border-gray-100 bg-gray-50 p-3">
                {preview.map((o) => (
                  <div key={o.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        o.party === "D" ? "bg-blue-500" : o.party === "R" ? "bg-red-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="font-medium text-gray-900">{o.name}</span>
                    <span className="text-gray-400">&middot;</span>
                    <span className="text-gray-500">{o.title}</span>
                    <span className="text-gray-400">&middot;</span>
                    <span className="text-xs text-gray-400">
                      {o.state}{o.district ? `-${o.district}` : ""} {chamberLabel(o.chamber)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  This will create <span className="font-bold">{preview.length}</span> published question
                  {preview.length === 1 ? "" : "s"}, one for each official above. Questions go live immediately
                  (no moderation queue).
                </p>
              </div>

              <button
                onClick={publish}
                disabled={isPublishing || text.trim().length < 10 || selectedTags.length === 0}
                className="mt-4 rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isPublishing ? "Publishing..." : `Publish to ${preview.length} Official${preview.length === 1 ? "" : "s"}`}
              </button>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
