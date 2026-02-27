"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnswerForm } from "@/components/AnswerForm";
import { QuestionVideo } from "@/components/QuestionVideo";

interface QuestionFlag {
  id: string;
  reason: string;
  createdAt: Date;
  user: { id: string; name: string | null; email: string };
}

interface Question {
  id: string;
  text: string;
  videoUrl: string | null;
  status: string;
  upvoteCount: number;
  districtTag: string;
  createdAt: Date;
  author: { name: string | null; city: string | null; state: string | null };
  official: {
    id: string;
    name: string;
    title: string;
    deliveryThreshold: number | null;
    deliveryThresholdType: string;
  };
  categoryTags: { tag: string }[];
  keywords?: { keyword: string }[];
  flags?: QuestionFlag[];
}

interface ModerationQueueProps {
  questions: Question[];
  activeTab: string;
  /** Map of questionId → constituent signature count, used for threshold progress on the "published" tab */
  constituentCounts?: Record<string, number>;
  /** Total number of questions for this status (for pagination) */
  totalCount?: number;
  /** Current page (1-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function ModerationQueue({
  questions,
  activeTab,
  constituentCounts,
  totalCount,
  page = 1,
  pageSize = 25,
}: ModerationQueueProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkActing, setBulkActing] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1;

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === questions.length) return new Set();
      return new Set(questions.map((q) => q.id));
    });
  }, [questions]);

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      sp.set(key, value);
    }
    return `/moderate?${sp.toString()}`;
  }

  async function handleBulkAction(action: "hide" | "delete") {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    const label = action === "hide" ? "Hide" : "Delete";
    if (!confirm(`${label} ${ids.length} question${ids.length > 1 ? "s" : ""}? ${action === "delete" ? "This cannot be undone." : "Hidden questions are removed from public view."}`)) {
      return;
    }

    setBulkActing(true);
    setBulkResult(null);
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: ids, action }),
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.hidden ?? data.deleted ?? ids.length;
        setBulkResult(`${count} question${count !== 1 ? "s" : ""} ${action === "hide" ? "hidden" : "deleted"}`);
        setSelected(new Set());
        setTimeout(() => router.refresh(), 800);
      } else {
        const err = await res.json();
        setBulkResult(`Error: ${err.error}`);
      }
    } catch {
      setBulkResult("Network error");
    } finally {
      setBulkActing(false);
    }
  }

  return (
    <div>
      {/* Per-page selector + pagination info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => router.push(buildUrl({ pageSize: e.target.value, page: "1" }))}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>per page</span>
        </div>
        {totalCount != null && (
          <span className="text-sm text-gray-500">
            {(page - 1) * pageSize + 1}&ndash;{Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
        )}
      </div>

      {/* Bulk selection bar */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={questions.length > 0 && selected.size === questions.length}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          {selected.size > 0
            ? `${selected.size} selected`
            : "Select all"}
        </label>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {bulkResult && (
              <span className={`text-sm font-medium ${bulkResult.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                {bulkResult}
              </span>
            )}
            <button
              onClick={() => handleBulkAction("hide")}
              disabled={bulkActing}
              className="rounded-md bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              {bulkActing ? "Working..." : "Hide Selected"}
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={bulkActing}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {bulkActing ? "Working..." : "Delete Selected"}
            </button>
          </div>
        )}
      </div>

      {/* Question cards */}
      <div className="space-y-4">
        {questions.map((q) => (
          <ModerationCard
            key={q.id}
            question={q}
            activeTab={activeTab}
            constituentCount={constituentCounts?.[q.id]}
            isSelected={selected.has(q.id)}
            onToggleSelect={() => toggleSelect(q.id)}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => router.push(buildUrl({ page: String(page - 1) }))}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          {generatePageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">&hellip;</span>
            ) : (
              <button
                key={p}
                onClick={() => router.push(buildUrl({ page: String(p) }))}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  p === page
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => router.push(buildUrl({ page: String(page + 1) }))}
            disabled={page >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/** Generate a compact array of page numbers with ellipsis for large ranges */
function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

const DEFAULT_THRESHOLD = 5;

function ModerationCard({
  question,
  activeTab,
  constituentCount,
  isSelected,
  onToggleSelect,
}: {
  question: Question;
  activeTab: string;
  constituentCount?: number;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const router = useRouter();
  const [isActing, setIsActing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleAction(action: "publish" | "reject" | "deliver" | "hide" | "delete") {
    if (action === "delete" && !confirm("Permanently delete this question? This cannot be undone.")) {
      return;
    }
    if (action === "hide" && !confirm("Hide this question from public view?")) {
      return;
    }

    setIsActing(true);
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, action }),
      });

      if (res.ok) {
        await res.json();
        const labels: Record<string, string> = {
          publish: "Published",
          reject: "Rejected",
          deliver: "Delivered",
          hide: "Hidden",
          delete: "Deleted",
        };
        setResult(labels[action] ?? "Done");
        setTimeout(() => router.refresh(), 800);
      } else {
        const errData = await res.json();
        setResult(`Error: ${errData.error}`);
      }
    } catch {
      setResult("Network error");
    } finally {
      setIsActing(false);
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm transition-opacity ${
        result ? "opacity-60" : ""
      } ${isSelected ? "ring-2 ring-indigo-400" : ""}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          <div className="flex flex-wrap items-center gap-2">
            {question.categoryTags.map((ct) => (
              <span
                key={ct.tag}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {ct.tag}
              </span>
            ))}
            {question.keywords && question.keywords.length > 0 && question.keywords.map((kw) => (
              <span
                key={kw.keyword}
                className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
              >
                {kw.keyword}
              </span>
            ))}
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
              {question.districtTag}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(question.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="mb-2 text-lg font-medium text-gray-900">{question.text}</p>

      {question.videoUrl && (
        <div className="mb-3">
          <QuestionVideo url={question.videoUrl} />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>
          By {question.author.name ?? "Anonymous"}
          {question.author.city && question.author.state
            ? ` (${question.author.city}, ${question.author.state})`
            : ""}
        </span>
        <span>&middot;</span>
        <span>
          To: {question.official.name} ({question.official.title})
        </span>
        <span>&middot;</span>
        <span>{question.upvoteCount} upvotes</span>
      </div>

      {/* Threshold progress for published questions */}
      {activeTab === "published" && !result && (() => {
        const threshold = question.official.deliveryThreshold ?? DEFAULT_THRESHOLD;
        const isSupporter = question.official.deliveryThresholdType === "supporter";
        const current = isSupporter ? question.upvoteCount : (constituentCount ?? 0);
        const progress = Math.min(current / threshold, 1);
        const reached = current >= threshold;
        const label = isSupporter ? "total" : "constituent";

        return (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {reached
                  ? <span className="font-semibold text-green-700">Threshold reached</span>
                  : `${current} / ${threshold} ${label} signatures`}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${reached ? "bg-green-500" : "bg-indigo-600"}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Action buttons based on current status */}
      {result ? (
        <div
          className={`rounded px-3 py-2 text-sm font-medium ${
            result.startsWith("Error")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {result}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activeTab === "pending_review" && (
            <>
              <button
                onClick={() => handleAction("publish")}
                disabled={isActing}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve &amp; Publish
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={isActing}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          {activeTab === "published" && (
            <button
              onClick={() => handleAction("deliver")}
              disabled={isActing}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Mark as Delivered
            </button>
          )}
          {activeTab === "answered" && (
            <span className="text-sm text-gray-400 italic">Answered</span>
          )}

          {/* Hide and Delete buttons — available on all tabs */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleAction("hide")}
              disabled={isActing}
              className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              Hide
            </button>
            <button
              onClick={() => handleAction("delete")}
              disabled={isActing}
              className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Inline answer form for delivered questions */}
      {activeTab === "delivered" && !result && (
        <AnswerForm
          questionId={question.id}
          officialName={question.official.name}
          compact
        />
      )}

      {/* Flag reports for the flagged tab */}
      {activeTab === "flagged" && question.flags && question.flags.length > 0 && !result && (
        <FlagReports questionId={question.id} flags={question.flags} />
      )}
    </div>
  );
}

function FlagReports({ questionId, flags }: { questionId: string; flags: QuestionFlag[] }) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);

  async function handleDismiss() {
    setDismissing(true);
    try {
      await fetch("/api/moderate/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action: "dismiss" }),
      });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setDismissing(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4">
      <p className="mb-2 text-sm font-medium text-red-800">
        {flags.length} {flags.length === 1 ? "report" : "reports"}
      </p>
      <div className="space-y-2">
        {flags.map((flag) => (
          <div key={flag.id} className="rounded bg-white px-3 py-2 text-sm">
            <p className="text-gray-800">&ldquo;{flag.reason}&rdquo;</p>
            <p className="mt-1 text-xs text-gray-400">
              {flag.user.name ?? flag.user.email} &middot;{" "}
              {new Date(flag.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={handleDismiss}
        disabled={dismissing}
        className="mt-3 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {dismissing ? "Dismissing..." : "Dismiss Reports"}
      </button>
    </div>
  );
}
