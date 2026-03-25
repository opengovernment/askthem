"use client";

import { useState } from "react";

interface ShareButtonProps {
  questionId: string;
  text: string;
  officialName?: string;
}

export function ShareButton({ questionId, text, officialName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function getUrl() {
    return `${window.location.origin}/questions/${questionId}`;
  }

  async function handleShare() {
    const url = getUrl();

    // Use Web Share API on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({ title: "AskThem Question", text, url });
        return;
      } catch {
        // User cancelled or API not supported; fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleEmailFriend() {
    const url = getUrl();
    const truncated = text.length > 200 ? text.slice(0, 200) + "..." : text;
    const subject = encodeURIComponent(
      officialName
        ? `Sign this question to ${officialName} on AskThem`
        : "Sign this question on AskThem",
    );
    const body = encodeURIComponent(
      `I think you'd want to sign this question on AskThem:\n\n"${truncated}"\n\nAdd your signature here: ${url}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        title="Share this question"
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-600">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.474l6.733-3.367A2.52 2.52 0 0113 4.5z" />
            </svg>
            Share
          </>
        )}
      </button>
      <button
        onClick={handleEmailFriend}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        title="Email this question to a friend"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
          <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
        </svg>
        Email a friend
      </button>
    </div>
  );
}
