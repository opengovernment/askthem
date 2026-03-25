"use client";

import { SocialEmbed } from "./SocialEmbed";
import { detectPlatform, platformLabel } from "@/lib/media";

interface QuestionVideoProps {
  url: string;
}

/**
 * Renders a social media video embed attached to a question.
 * Reuses the existing SocialEmbed component used for answer media.
 */
export function QuestionVideo({ url }: QuestionVideoProps) {
  const { platform } = detectPlatform(url);

  if (!platform) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        Watch video
      </a>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        Video via {platformLabel(platform)}
      </p>
      <SocialEmbed url={url} platform={platform} />
    </div>
  );
}
