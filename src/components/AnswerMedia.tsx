"use client";

import { SocialEmbed } from "./SocialEmbed";
import { MediaPlayer } from "./MediaPlayer";
import type { SocialPlatform } from "@/lib/media";

interface ResponseMediaItem {
  id: string;
  mediaType: string;
  platform: string | null;
  url: string;
  originalFilename: string | null;
  mimeType: string | null;
  caption: string | null;
  sortOrder: number;
}

interface AnswerMediaProps {
  media: ResponseMediaItem[];
}

/**
 * Renders all media items attached to an answer.
 * Delegates to SocialEmbed or MediaPlayer based on mediaType.
 */
export function AnswerMedia({ media }: AnswerMediaProps) {
  if (!media.length) return null;

  return (
    <div className="mt-4 space-y-4">
      {media.map((item) => {
        if (item.mediaType === "social_embed") {
          return (
            <SocialEmbed
              key={item.id}
              url={item.url}
              platform={item.platform as SocialPlatform}
              caption={item.caption ?? undefined}
            />
          );
        }

        if (item.mediaType === "video_upload" || item.mediaType === "audio_upload") {
          return (
            <MediaPlayer
              key={item.id}
              url={item.url}
              mimeType={item.mimeType ?? undefined}
              mediaType={item.mediaType}
              originalFilename={item.originalFilename ?? undefined}
              caption={item.caption ?? undefined}
            />
          );
        }

        // Unknown media type — render as link
        return (
          <div key={item.id} className="my-2">
            {item.caption && (
              <p className="mb-1 text-sm text-gray-600 italic">{item.caption}</p>
            )}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 underline hover:text-indigo-800"
            >
              View media
            </a>
          </div>
        );
      })}
    </div>
  );
}
