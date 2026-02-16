"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const EMBED_WIDTH = 500;
const EMBED_HEIGHT = 220;

function parseAskThemPath(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Accept relative paths directly
  const questionRe = /\/questions\/([A-Za-z0-9_-]+)/;
  const officialRe = /\/officials\/([A-Za-z0-9_-]+)/;

  if (questionRe.test(trimmed) || officialRe.test(trimmed)) {
    // Extract just the path portion in case it's a full URL
    try {
      const url = new URL(trimmed, "https://placeholder.local");
      return url.pathname;
    } catch {
      return trimmed;
    }
  }

  return null;
}

export default function WidgetsPage() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const parsedPath = parseAskThemPath(url);
  const embedSrc = parsedPath
    ? `/widgets/embed?url=${encodeURIComponent(parsedPath)}`
    : null;

  const embedCode = embedSrc
    ? `<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}${embedSrc}" width="${EMBED_WIDTH}" height="${EMBED_HEIGHT}" frameborder="0" style="border:1px solid #e5e7eb;border-radius:8px;max-width:100%;"></iframe>`
    : "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [embedCode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; Home
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Embed Widget Builder
        </h1>
        <p className="mb-8 text-gray-600">
          Create an embeddable widget for any AskThem question or elected
          official page. Paste the URL below to generate embed code you can add
          to your website.
        </p>

        {/* URL input */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="widget-url"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            AskThem page URL
          </label>
          <input
            id="widget-url"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setCopied(false);
            }}
            placeholder="e.g. /questions/abc123 or https://askthem.io/officials/xyz"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
          {url && !parsedPath && (
            <p className="mt-2 text-sm text-red-600">
              Please paste a valid question URL (
              <code className="text-xs">/questions/...</code>) or official URL (
              <code className="text-xs">/officials/...</code>).
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Supports <code>/questions/:id</code> and{" "}
            <code>/officials/:id</code> pages.
          </p>
        </div>

        {/* Preview */}
        {embedSrc && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Preview
            </h2>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4">
              <iframe
                src={embedSrc}
                width={EMBED_WIDTH}
                height={EMBED_HEIGHT}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  maxWidth: "100%",
                }}
                title="Widget preview"
              />
            </div>
          </div>
        )}

        {/* Embed code */}
        {embedSrc && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Embed Code
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <pre className="mb-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {copied ? "Copied!" : "Copy Embed Code"}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            How It Works
          </h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600">
            <li>
              Navigate to any <strong>question</strong> or{" "}
              <strong>elected official</strong> page on AskThem.
            </li>
            <li>Copy the page URL from your browser&apos;s address bar.</li>
            <li>Paste it into the field above.</li>
            <li>
              Copy the generated embed code and add it to your website&apos;s
              HTML.
            </li>
          </ol>
          <div className="mt-4 rounded-lg bg-indigo-50 p-3">
            <p className="text-xs text-indigo-800">
              <strong>Widget size:</strong> {EMBED_WIDTH}&times;{EMBED_HEIGHT}px
              (responsive max-width). The widget shows key info at a glance and
              links back to the full page on AskThem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
