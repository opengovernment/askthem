"use client";

import { useState, useEffect, useCallback } from "react";

interface CommentUser {
  id: string;
  name: string;
  image: string | null;
  city: string | null;
  state: string | null;
}

interface Comment {
  id: string;
  text: string;
  status: string;
  createdAt: string;
  user: CommentUser;
}

interface AmaCommentsProps {
  eventId: string;
  isLive: boolean;
  isSignedIn: boolean;
}

export function AmaComments({ eventId, isLive, isSignedIn }: AmaCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/comments?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // silently fail on poll
    }
  }, [eventId]);

  useEffect(() => {
    fetchComments();

    // Poll for new comments every 10 seconds during live AMAs
    if (isLive) {
      const interval = setInterval(fetchComments, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchComments, isLive]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/events/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, text: newComment.trim() }),
      });

      if (res.ok) {
        setNewComment("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch {
      // network error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Discussion
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        )}
      </h2>

      {/* Comment form (live AMAs only) */}
      {isLive && isSignedIn && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              maxLength={500}
              className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {newComment.length}/500 &middot; Comments are reviewed by moderators before appearing
              </p>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
            {submitted && (
              <p className="mt-2 text-xs text-green-600">
                Comment submitted! It will appear once a moderator approves it.
              </p>
            )}
          </div>
        </form>
      )}

      {isLive && !isSignedIn && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
          Sign in to join the discussion.
        </div>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          {isLive ? "No comments yet. Be the first to join the discussion!" : "No comments were posted during this AMA."}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-gray-100 bg-white px-4 py-3"
            >
              <div className="mb-1 flex items-center gap-2">
                {comment.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.user.image}
                    alt=""
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                    {comment.user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
                {comment.user.city && comment.user.state && (
                  <span className="text-xs text-gray-400">
                    {comment.user.city}, {comment.user.state}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                {comment.status === "pending" && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">Pending</span>
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
