"use client";

import { useState } from "react";
import Image from "next/image";

interface UserResult {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  status: string;
  pausedUntil: string | null;
  city: string | null;
  state: string | null;
  createdAt: string;
  _count: { questions: number; upvotes: number };
}

export function UserManagement({ isAdmin }: { isAdmin: boolean }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/moderate/users?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Search failed");
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setSearched(true);
    } catch {
      setError("Network error");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or name..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={searching || query.trim().length < 2}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {searched && users.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          No users found matching &ldquo;{query}&rdquo;
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isAdmin={isAdmin}
              onUpdate={(updated) => {
                setUsers((prev) =>
                  updated
                    ? prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
                    : prev.filter((u) => u.id !== user.id),
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserCard({
  user,
  isAdmin,
  onUpdate,
}: {
  user: UserResult;
  isAdmin: boolean;
  onUpdate: (updated: Partial<UserResult> & { id: string } | null) => void;
}) {
  const [acting, setActing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [pauseDays, setPauseDays] = useState(7);

  async function handleAction(action: string, extraBody?: Record<string, unknown>) {
    setActing(true);
    setResult(null);
    try {
      const res = await fetch("/api/moderate/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action, ...extraBody }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult(`Error: ${data.error}`);
        return;
      }

      if (action === "delete") {
        setResult("Deleted");
        setTimeout(() => onUpdate(null), 800);
      } else {
        const newStatus = data.status || "active";
        setResult(
          action === "ban" ? "Banned" :
          action === "unban" ? "Unbanned" :
          action === "pause" ? `Paused for ${pauseDays} days` :
          "Unpaused",
        );
        onUpdate({
          id: user.id,
          status: newStatus,
          pausedUntil: data.pausedUntil || null,
        });
      }
    } catch {
      setResult("Network error");
    } finally {
      setActing(false);
      setShowConfirm(null);
    }
  }

  const statusBadge = {
    active: "bg-green-100 text-green-800",
    banned: "bg-red-100 text-red-800",
    paused: "bg-amber-100 text-amber-800",
  }[user.status] || "bg-gray-100 text-gray-600";

  const isPaused = user.status === "paused";
  const isBanned = user.status === "banned";
  const isActive = user.status === "active";

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${isBanned ? "border-red-200" : "border-gray-200"}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          {user.image ? (
            <Image src={user.image} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center text-sm font-medium text-gray-500">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-gray-900">{user.name ?? user.email}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge}`}>
              {user.status}
            </span>
            {user.role !== "user" && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {user.role}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
            {user.city && user.state && <span>{user.city}, {user.state}</span>}
            <span>{user._count.questions} questions</span>
            <span>{user._count.upvotes} upvotes</span>
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            {isPaused && user.pausedUntil && (
              <span className="text-amber-600">
                Paused until {new Date(user.pausedUntil).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`mt-3 rounded px-3 py-2 text-sm font-medium ${
            result.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {result}
        </div>
      )}

      {/* Action buttons */}
      {!result && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Ban / Unban */}
          {isActive || isPaused ? (
            showConfirm === "ban" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Ban this user?</span>
                <button
                  onClick={() => handleAction("ban")}
                  disabled={acting}
                  className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Ban
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm("ban")}
                disabled={acting}
                className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                Ban
              </button>
            )
          ) : isBanned ? (
            <button
              onClick={() => handleAction("unban")}
              disabled={acting}
              className="rounded border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              Unban
            </button>
          ) : null}

          {/* Pause / Unpause */}
          {isActive ? (
            showConfirm === "pause" ? (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">
                  Pause for
                  <select
                    value={pauseDays}
                    onChange={(e) => setPauseDays(Number(e.target.value))}
                    className="mx-1 rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </label>
                <button
                  onClick={() => handleAction("pause", { pauseDays })}
                  disabled={acting}
                  className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm("pause")}
                disabled={acting}
                className="rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                Pause
              </button>
            )
          ) : isPaused ? (
            <button
              onClick={() => handleAction("unpause")}
              disabled={acting}
              className="rounded border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              Unpause
            </button>
          ) : null}

          {/* Delete (admin only) */}
          {isAdmin && (
            showConfirm === "delete" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Permanently delete this user and all their data?</span>
                <button
                  onClick={() => handleAction("delete")}
                  disabled={acting}
                  className="rounded bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-50"
                >
                  Delete Forever
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm("delete")}
                disabled={acting}
                className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Delete
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
