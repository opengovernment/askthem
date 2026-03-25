"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { detectPlatform, platformLabel, classifyMimeType, MAX_UPLOAD_SIZE } from "@/lib/media";
import type { SocialPlatform } from "@/lib/media";

interface AnswerFormProps {
  questionId: string;
  officialName: string;
  compact?: boolean;
}

interface MediaItem {
  id: string; // client-side key
  mediaType: "social_embed" | "video_upload" | "audio_upload";
  platform: SocialPlatform;
  url: string;
  originalFilename?: string;
  mimeType?: string;
  caption: string;
  uploading?: boolean;
}

let nextId = 0;
function genId() {
  return `media-${++nextId}-${Date.now()}`;
}

export function AnswerForm({ questionId, officialName, compact }: AnswerFormProps) {
  const [responseText, setResponseText] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [embedUrl, setEmbedUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ── Add social media link ──────────────────────────────────
  function handleAddEmbed() {
    const url = embedUrl.trim();
    if (!url) return;

    try {
      new URL(url); // validate
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    const detection = detectPlatform(url);
    const item: MediaItem = {
      id: genId(),
      mediaType: "social_embed",
      platform: detection.platform,
      url,
      caption: "",
    };
    setMediaItems((prev) => [...prev, item]);
    setEmbedUrl("");
    setError(null);
  }

  // ── Upload file ────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = classifyMimeType(file.type);
    if (!mediaType) {
      setError("Unsupported file type. Only video and audio files are accepted.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setError(`File too large. Maximum size is ${MAX_UPLOAD_SIZE / (1024 * 1024)} MB.`);
      return;
    }

    const itemId = genId();
    const placeholder: MediaItem = {
      id: itemId,
      mediaType,
      platform: null,
      url: "",
      originalFilename: file.name,
      mimeType: file.type,
      caption: "",
      uploading: true,
    };
    setMediaItems((prev) => [...prev, placeholder]);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json();
        setMediaItems((prev) => prev.filter((m) => m.id !== itemId));
        setError(data.error || "Upload failed");
        return;
      }

      const data = await res.json();
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === itemId
            ? { ...m, url: data.url, uploading: false }
            : m,
        ),
      );
    } catch {
      setMediaItems((prev) => prev.filter((m) => m.id !== itemId));
      setError("Upload failed. Please try again.");
    }

    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Update caption ─────────────────────────────────────────
  function updateCaption(itemId: string, caption: string) {
    setMediaItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, caption } : m)),
    );
  }

  // ── Remove media item ──────────────────────────────────────
  function removeItem(itemId: string) {
    setMediaItems((prev) => prev.filter((m) => m.id !== itemId));
  }

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hasText = responseText.trim().length > 0;
    const hasMedia = mediaItems.some((m) => !m.uploading && m.url);
    if (!hasText && !hasMedia) return;

    // Block if any uploads still in progress
    if (mediaItems.some((m) => m.uploading)) {
      setError("Please wait for uploads to finish.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          responseText: responseText.trim() || undefined,
          media: mediaItems
            .filter((m) => m.url)
            .map((m, i) => ({
              mediaType: m.mediaType,
              platform: m.platform,
              url: m.url,
              originalFilename: m.originalFilename,
              mimeType: m.mimeType,
              caption: m.caption.trim() || undefined,
              sortOrder: i,
            })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post answer");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-4 ${compact ? "mt-3" : "mt-6"}`}>
        <p className="text-sm font-medium text-green-700">Answer posted successfully.</p>
      </div>
    );
  }

  const hasContent =
    responseText.trim().length > 0 ||
    mediaItems.some((m) => !m.uploading && m.url);

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-${compact ? "4" : "6"} ${compact ? "mt-3" : "mt-6"}`}>
      {!compact && (
        <>
          <h3 className="mb-1 text-lg font-semibold text-amber-900">Post Official Response</h3>
          <p className="mb-4 text-sm text-amber-700">
            Post a response on behalf of {officialName}. Embed social media posts, upload video/audio
            files, or add text.
          </p>
        </>
      )}
      {compact && (
        <p className="mb-3 text-sm font-medium text-amber-800">
          Post answer for {officialName}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Response text */}
        <div>
          <label htmlFor={`responseText-${questionId}`} className="mb-1 block text-sm font-medium text-gray-700">
            Response Text (optional)
          </label>
          <textarea
            id={`responseText-${questionId}`}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={compact ? 3 : 4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            placeholder="Add context or a summary of the official's response..."
          />
        </div>

        {/* ── Media items list ────────────────────────────────── */}
        {mediaItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Media ({mediaItems.length})
            </p>
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                {/* Icon/badge */}
                <div className="flex-shrink-0">
                  {item.uploading ? (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                  ) : item.mediaType === "social_embed" ? (
                    <span className="inline-block rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {platformLabel(item.platform)}
                    </span>
                  ) : (
                    <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {item.mediaType === "video_upload" ? "Video" : "Audio"}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-700">
                    {item.originalFilename || item.url}
                  </p>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateCaption(item.id, e.target.value)}
                    className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 focus:outline-none"
                    placeholder="Optional caption..."
                  />
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500"
                  title="Remove"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Add embed URL ───────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Add Social Media Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEmbed();
                }
              }}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              placeholder="Paste YouTube, Twitter/X, Instagram, Bluesky, Facebook, or TikTok URL..."
            />
            <button
              type="button"
              onClick={handleAddEmbed}
              disabled={!embedUrl.trim()}
              className="rounded-lg bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Supports YouTube, Twitter/X, Instagram, Bluesky, Facebook, TikTok
          </p>
        </div>

        {/* ── Upload file ─────────────────────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Upload Video or Audio
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            Max {MAX_UPLOAD_SIZE / (1024 * 1024)} MB. Video (MP4, WebM, MOV) or Audio (MP3, WAV, AAC).
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !hasContent}
          className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Answer"}
        </button>
      </form>
    </div>
  );
}
