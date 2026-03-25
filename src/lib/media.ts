// Platform detection and embed URL utilities for social media responses

export type SocialPlatform =
  | "youtube"
  | "twitter"
  | "instagram"
  | "bluesky"
  | "facebook"
  | "tiktok"
  | null;

interface PlatformDetection {
  platform: SocialPlatform;
  embedId?: string; // platform-specific ID for constructing embed URLs
}

/**
 * Detect social media platform from a URL.
 * Returns the platform name and any extractable embed ID.
 */
export function detectPlatform(url: string): PlatformDetection {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { platform: null };
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
  if (host === "youtube.com" || host === "m.youtube.com") {
    const videoId =
      parsed.searchParams.get("v") ||
      parsed.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1];
    if (videoId) return { platform: "youtube", embedId: videoId };
    return { platform: "youtube" };
  }
  if (host === "youtu.be") {
    const videoId = parsed.pathname.slice(1).split("/")[0];
    if (videoId) return { platform: "youtube", embedId: videoId };
    return { platform: "youtube" };
  }

  // Twitter / X: twitter.com/user/status/ID or x.com/user/status/ID
  if (host === "twitter.com" || host === "x.com" || host === "mobile.twitter.com") {
    const match = parsed.pathname.match(/\/\w+\/status\/(\d+)/);
    return { platform: "twitter", embedId: match?.[1] ?? undefined };
  }

  // Instagram: instagram.com/p/ID, instagram.com/reel/ID
  if (host === "instagram.com" || host === "instagr.am") {
    const match = parsed.pathname.match(/\/(?:p|reel|tv)\/([^/?]+)/);
    return { platform: "instagram", embedId: match?.[1] ?? undefined };
  }

  // Bluesky: bsky.app/profile/handle/post/ID
  if (host === "bsky.app") {
    const match = parsed.pathname.match(/\/profile\/[^/]+\/post\/([^/?]+)/);
    return { platform: "bluesky", embedId: match?.[1] ?? undefined };
  }

  // Facebook: facebook.com/watch, facebook.com/*/posts/*, facebook.com/*/videos/*
  if (
    host === "facebook.com" ||
    host === "m.facebook.com" ||
    host === "fb.watch"
  ) {
    return { platform: "facebook" };
  }

  // TikTok: tiktok.com/@user/video/ID
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const match = parsed.pathname.match(/\/video\/(\d+)/);
    return { platform: "tiktok", embedId: match?.[1] ?? undefined };
  }

  return { platform: null };
}

/**
 * Get a YouTube embed URL from a video ID.
 */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
}

/**
 * Get human-readable platform name for display.
 */
export function platformLabel(platform: SocialPlatform): string {
  const labels: Record<string, string> = {
    youtube: "YouTube",
    twitter: "X (Twitter)",
    instagram: "Instagram",
    bluesky: "Bluesky",
    facebook: "Facebook",
    tiktok: "TikTok",
  };
  return platform ? labels[platform] ?? platform : "Link";
}

// Allowed MIME types for moderator uploads
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo",  // .avi
];

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",     // .mp3
  "audio/mp4",      // .m4a
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/aac",
];

export const MAX_UPLOAD_SIZE = 500 * 1024 * 1024; // 500 MB

/**
 * Determine if a MIME type is an allowed upload type.
 * Returns the mediaType classification or null if not allowed.
 */
export function classifyMimeType(
  mimeType: string,
): "video_upload" | "audio_upload" | null {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video_upload";
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return "audio_upload";
  return null;
}
