"use client";

import { useState, useCallback } from "react";

interface Batch {
  batchId: string;
  text: string;
  tags: string[];
  createdAt: string;
  createdBy: string;
  total: number;
  published: number;
  delivered: number;
  answered: number;
}

interface BatchHistoryProps {
  batches: Batch[];
}

export function BatchHistory({ batches }: BatchHistoryProps) {
  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ batchId: string; text: string; type: "success" | "error" } | null>(null);

  const startEdit = useCallback((batch: Batch) => {
    setEditingBatch(batch.batchId);
    setEditText(batch.text);
    setMessage(null);
  }, []);

  const saveEdit = useCallback(async (batchId: string) => {
    if (editText.trim().length < 10) {
      setMessage({ batchId, text: "Question must be at least 10 characters.", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/moderate/broadcast/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      const data = await res.json();
      setMessage({
        batchId,
        text: `Updated ${data.updated} question${data.updated === 1 ? "" : "s"}.`,
        type: "success",
      });
      setEditingBatch(null);
    } catch (err) {
      setMessage({
        batchId,
        text: err instanceof Error ? err.message : "Failed to update",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [editText]);

  return (
    <div className="space-y-3">
      {batches.map((batch) => {
        const isEditing = editingBatch === batch.batchId;
        const batchMessage = message?.batchId === batch.batchId ? message : null;
        const editable = batch.published > 0;
        const date = new Date(batch.createdAt);

        return (
          <div key={batch.batchId} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(batch.batchId)}
                        disabled={isSaving}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setEditingBatch(null)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">&ldquo;{batch.text}&rdquo;</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {batch.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400">
                    by {batch.createdBy} &middot; {date.toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-2 flex gap-3 text-xs">
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-700">{batch.total}</span> officials
                  </span>
                  {batch.published > 0 && (
                    <span className="text-indigo-600">{batch.published} published</span>
                  )}
                  {batch.delivered > 0 && (
                    <span className="text-amber-600">{batch.delivered} delivered</span>
                  )}
                  {batch.answered > 0 && (
                    <span className="text-green-600">{batch.answered} answered</span>
                  )}
                </div>

                {batchMessage && (
                  <p className={`mt-2 text-xs ${batchMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {batchMessage.text}
                  </p>
                )}
              </div>

              {!isEditing && editable && (
                <button
                  onClick={() => startEdit(batch)}
                  className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Edit Text
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
