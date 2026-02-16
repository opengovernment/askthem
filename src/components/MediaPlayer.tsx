"use client";

interface MediaPlayerProps {
  url: string;
  mimeType?: string;
  mediaType: "video_upload" | "audio_upload";
  originalFilename?: string;
  caption?: string;
}

/**
 * HTML5 media player for uploaded video/audio files.
 */
export function MediaPlayer({
  url,
  mimeType,
  mediaType,
  originalFilename,
  caption,
}: MediaPlayerProps) {
  if (mediaType === "audio_upload") {
    return (
      <div className="my-3">
        {caption && (
          <p className="mb-2 text-sm text-gray-600 italic">{caption}</p>
        )}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          {originalFilename && (
            <p className="mb-2 text-xs text-gray-500">{originalFilename}</p>
          )}
          <audio controls className="w-full" preload="metadata">
            <source src={url} type={mimeType || "audio/mpeg"} />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  }

  return (
    <div className="my-3">
      {caption && (
        <p className="mb-2 text-sm text-gray-600 italic">{caption}</p>
      )}
      <div className="overflow-hidden rounded-lg bg-black">
        <video
          controls
          className="w-full"
          preload="metadata"
          playsInline
          style={{ maxHeight: "500px" }}
        >
          <source src={url} type={mimeType || "video/mp4"} />
          Your browser does not support the video element.
        </video>
      </div>
      {originalFilename && (
        <p className="mt-1 text-xs text-gray-400">{originalFilename}</p>
      )}
    </div>
  );
}
