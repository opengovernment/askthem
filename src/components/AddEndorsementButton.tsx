"use client";

import { useState, useEffect } from "react";

interface VerifiedGroup {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface ExistingEndorsement {
  id: string;
  group: { id: string; name: string };
}

interface Props {
  questionId: string;
  existingEndorsements: ExistingEndorsement[];
}

export function AddEndorsementButton({ questionId, existingEndorsements }: Props) {
  const [groups, setGroups] = useState<VerifiedGroup[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [endorsedGroupIds, setEndorsedGroupIds] = useState<Set<string>>(
    new Set(existingEndorsements.map((e) => e.group.id))
  );

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/groups/verified")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGroups(data);
      })
      .catch(() => {});
  }, [isOpen]);

  const availableGroups = groups.filter((g) => !endorsedGroupIds.has(g.id));

  async function handleAdd() {
    if (!selectedGroupId) return;
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/questions/endorse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, groupId: selectedGroupId, note: note.trim() || undefined }),
    });

    if (res.ok) {
      const selected = groups.find((g) => g.id === selectedGroupId);
      setSuccess(`Added endorsement from ${selected?.name ?? "group"}`);
      setEndorsedGroupIds((prev) => new Set([...prev, selectedGroupId]));
      setSelectedGroupId("");
      setNote("");
      // Reload page to show new endorsement in sidebar
      setTimeout(() => window.location.reload(), 800);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to add endorsement");
    }
    setLoading(false);
  }

  async function handleRemove(groupId: string, groupName: string) {
    if (!confirm(`Remove endorsement from ${groupName}?`)) return;

    const res = await fetch(
      `/api/questions/endorse?questionId=${questionId}&groupId=${groupId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setEndorsedGroupIds((prev) => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
      setTimeout(() => window.location.reload(), 400);
    }
  }

  return (
    <div className="mt-3">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add Group Endorsement
        </button>
      ) : (
        <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-700">Add Group Endorsement</h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Existing endorsements with remove option */}
          {existingEndorsements.filter((e) => endorsedGroupIds.has(e.group.id)).length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-[11px] text-gray-500">Current endorsements:</p>
              {existingEndorsements
                .filter((e) => endorsedGroupIds.has(e.group.id))
                .map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded bg-gray-50 px-2 py-1">
                    <span className="text-xs text-gray-700">{e.group.name}</span>
                    <button
                      onClick={() => handleRemove(e.group.id, e.group.name)}
                      className="text-[11px] text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          )}

          {availableGroups.length === 0 && groups.length > 0 ? (
            <p className="text-xs text-gray-500">All verified groups have already endorsed this question.</p>
          ) : (
            <>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">Select a verified group...</option>
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note (e.g. &quot;Key policy priority&quot;)"
                maxLength={200}
                className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                onClick={handleAdd}
                disabled={!selectedGroupId || loading}
                className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Endorsement"}
              </button>
            </>
          )}

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {success && <p className="mt-2 text-xs text-green-600">{success}</p>}
        </div>
      )}
    </div>
  );
}
