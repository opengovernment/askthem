"use client";

import { useState, useEffect } from "react";

interface Moderator {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  state: string | null;
  createdAt: string;
}

interface SearchResult {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  _count: { questions: number; upvotes: number };
}

export function ModeratorManagement() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchModerators();
  }, []);

  async function fetchModerators() {
    try {
      const res = await fetch("/api/moderate/moderators");
      if (res.ok) {
        const data = await res.json();
        setModerators(data.moderators);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    if (query.trim().length < 2) return;
    setSearching(true);
    setResults([]);
    setMessage(null);
    try {
      const res = await fetch(`/api/moderate/users?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out users who are already moderators/admins
        setResults(data.users.filter((u: SearchResult) => u.role === "user"));
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }

  async function promote(userId: string) {
    setActing(userId);
    setMessage(null);
    try {
      const res = await fetch("/api/moderate/moderators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "promote" }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "User promoted to moderator." });
        setResults((prev) => prev.filter((u) => u.id !== userId));
        await fetchModerators();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error ?? "Failed to promote user." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setActing(null);
    }
  }

  async function demote(userId: string) {
    setActing(userId);
    setMessage(null);
    try {
      const res = await fetch("/api/moderate/moderators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "demote" }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Moderator demoted to regular user." });
        await fetchModerators();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error ?? "Failed to demote." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Current moderators */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Current Moderators</h3>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : moderators.length === 0 ? (
          <p className="text-sm text-gray-500">No moderators assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {moderators.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {m.image ? (
                    <img src={m.image} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                      {(m.name ?? m.email).slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name ?? m.email}</p>
                    <p className="text-xs text-gray-500">
                      {m.email}
                      {m.state ? ` · ${m.state}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {m.role}
                  </span>
                  {m.role === "moderator" && (
                    <button
                      onClick={() => demote(m.id)}
                      disabled={acting === m.id}
                      className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {acting === m.id ? "..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search to add */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Add a Moderator</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            placeholder="Search by name or email..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
          <button
            onClick={searchUsers}
            disabled={searching || query.trim().length < 2}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {message && (
          <p
            className={`mt-2 text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-3 space-y-2">
            {results.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {u.image ? (
                    <img src={u.image} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                      {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name ?? u.email}</p>
                    <p className="text-xs text-gray-500">
                      {u.email}
                      {u.state ? ` · ${u.state}` : ""}
                      {" · "}
                      {u._count.questions} question{u._count.questions !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => promote(u.id)}
                  disabled={acting === u.id}
                  className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {acting === u.id ? "..." : "Make Moderator"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
