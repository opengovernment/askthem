"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    isProfilePublic: boolean;
    city: string | null;
    state: string | null;
  };
}

export function SignerComments({ questionId }: { questionId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/questions/comments?questionId=${questionId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setComments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [questionId]);

  if (loading || comments.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Why people signed
      </h3>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="border-l-2 border-indigo-200 pl-3">
            <p className="text-sm text-gray-800">&ldquo;{c.text}&rdquo;</p>
            <p className="mt-1 text-xs text-gray-500">
              &mdash;{" "}
              {c.user.isProfilePublic ? (
                <Link href={`/profile/${c.user.id}`} className="text-indigo-600 hover:text-indigo-800">
                  {c.user.name}
                </Link>
              ) : (
                <span>{c.user.name}</span>
              )}
              {c.user.city && c.user.state && `, ${c.user.city}, ${c.user.state}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SignerCommentForm({ questionId }: { questionId: string }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setStatus("saving");
    try {
      const res = await fetch("/api/questions/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, text: text.trim() }),
      });
      if (res.ok) {
        setStatus("saved");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "saved") {
    return (
      <p className="mt-3 text-xs text-green-600">
        Thanks for sharing why you signed!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Why did you sign? (optional)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I signed because..."
          maxLength={280}
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || status === "saving"}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {status === "saving" ? "..." : "Share"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-1 text-xs text-red-500">Failed to save. You must sign the question first.</p>
      )}
    </form>
  );
}
