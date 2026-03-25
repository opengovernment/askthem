"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ModerationLogEntry {
  id: string;
  userId: string;
  questionId: string | null;
  questionText: string;
  result: string;
  reason: string | null;
  suggestion: string | null;
  createdAt: string;
}

interface AiModerationLogProps {
  logs: ModerationLogEntry[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

export function AiModerationLog({
  logs,
  totalCount,
  page = 1,
  pageSize = 25,
}: AiModerationLogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1;

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      sp.set(key, value);
    }
    return `/moderate?${sp.toString()}`;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing questions flagged by AI moderation as outside Official Conduct guidelines.
        </p>
        {totalCount != null && (
          <span className="text-sm text-gray-500">
            {(page - 1) * pageSize + 1}&ndash;{Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
        )}
      </div>

      {/* Log entries */}
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  AI Flagged
                </span>
                {log.questionId && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    Question: {log.questionId.slice(0, 8)}...
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>

            {/* The question text that was flagged */}
            <p className="mb-3 text-lg font-medium text-gray-900">
              &ldquo;{log.questionText}&rdquo;
            </p>

            {/* User ID */}
            <p className="mb-3 text-sm text-gray-500">
              User ID: {log.userId}
            </p>

            {/* AI reasoning */}
            {log.reason && (
              <div className="mb-3 rounded-md border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-700">AI Reason</p>
                <p className="mt-1 text-sm text-amber-900">{log.reason}</p>
              </div>
            )}

            {/* AI suggestion */}
            {log.suggestion && (
              <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-700">Suggested Rephrasing</p>
                <p className="mt-1 text-sm text-blue-900">{log.suggestion}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => router.push(buildUrl({ page: String(page - 1) }))}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
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
