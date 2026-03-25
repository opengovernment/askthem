"use client";

import { useEffect, useRef } from "react";
import { detectPlatform, youtubeEmbedUrl, platformLabel } from "@/lib/media";
import type { SocialPlatform } from "@/lib/media";

interface SocialEmbedProps {
  url: string;
  platform: SocialPlatform;
  caption?: string;
}

/**
 * Renders a social media embed based on platform.
 * Falls back to an external link for unsupported/unrecognized platforms.
 */
export function SocialEmbed({ url, platform, caption }: SocialEmbedProps) {
  const detection = detectPlatform(url);

  return (
    <div className="my-3">
      {caption && (
        <p className="mb-2 text-sm text-gray-600 italic">{caption}</p>
      )}
      <EmbedContent url={url} platform={platform ?? detection.platform} detection={detection} />
    </div>
  );
}

function EmbedContent({
  url,
  platform,
  detection,
}: {
  url: string;
  platform: SocialPlatform;
  detection: ReturnType<typeof detectPlatform>;
}) {
  switch (platform) {
    case "youtube":
      if (detection.embedId) {
        return (
          <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={youtubeEmbedUrl(detection.embedId)}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full rounded-lg"
              loading="lazy"
            />
          </div>
        );
      }
      return <ExternalLink url={url} platform={platform} />;

    case "twitter":
      return <TwitterEmbed url={url} />;

    case "instagram":
      return <InstagramEmbed url={url} />;

    case "bluesky":
      return <BlueskyEmbed url={url} />;

    case "facebook":
      return <FacebookEmbed url={url} />;

    case "tiktok":
      return <TikTokEmbed url={url} />;

    default:
      return <ExternalLink url={url} platform={platform} />;
  }
}

/**
 * Twitter/X embed using their embed script.
 */
function TwitterEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Twitter widget script if not already loaded
    const win = window as typeof window & { twttr?: { widgets?: { load?: (el?: HTMLElement) => void } } };
    if (win.twttr?.widgets?.load) {
      win.twttr.widgets.load(containerRef.current ?? undefined);
    } else {
      const existing = document.getElementById("twitter-wjs");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "twitter-wjs";
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [url]);

  return (
    <div ref={containerRef} className="max-w-lg">
      <blockquote className="twitter-tweet" data-dnt="true">
        <a href={url}>Loading tweet...</a>
      </blockquote>
    </div>
  );
}

/**
 * Instagram embed using their oEmbed approach.
 */
function InstagramEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = window as typeof window & { instgrm?: { Embeds?: { process?: () => void } } };
    if (win.instgrm?.Embeds?.process) {
      win.instgrm.Embeds.process();
    } else {
      const existing = document.getElementById("instagram-embed-js");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "instagram-embed-js";
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [url]);

  // Ensure URL ends with /embed for Instagram
  const embedUrl = url.endsWith("/") ? url + "embed" : url + "/embed";

  return (
    <div ref={containerRef} className="max-w-lg">
      <iframe
        src={embedUrl}
        title="Instagram post"
        className="w-full rounded-lg border-0"
        style={{ minHeight: "500px" }}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/**
 * Bluesky embed using their embed URL pattern.
 */
function BlueskyEmbed({ url }: { url: string }) {
  // Bluesky supports embed via appending /embed to the post URL
  const embedUrl = url.endsWith("/") ? url + "embed" : url + "/embed";

  return (
    <div className="max-w-lg">
      <iframe
        src={embedUrl}
        title="Bluesky post"
        className="w-full rounded-lg border-0"
        style={{ minHeight: "300px" }}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/**
 * Facebook embed using their oEmbed iframe approach.
 */
function FacebookEmbed({ url }: { url: string }) {
  const encodedUrl = encodeURIComponent(url);
  const embedSrc = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500`;

  return (
    <div className="max-w-lg">
      <iframe
        src={embedSrc}
        title="Facebook post"
        className="w-full rounded-lg border-0"
        style={{ minHeight: "400px", width: "500px", maxWidth: "100%" }}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/**
 * TikTok embed using their oEmbed iframe approach.
 */
function TikTokEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = document.getElementById("tiktok-embed-js");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "tiktok-embed-js";
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [url]);

  return (
    <div ref={containerRef} className="max-w-lg">
      <blockquote className="tiktok-embed" cite={url} data-video-id="">
        <a href={url}>Loading TikTok...</a>
      </blockquote>
    </div>
  );
}

/**
 * Fallback: plain link to the source with platform badge.
 */
function ExternalLink({ url, platform }: { url: string; platform: SocialPlatform }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 hover:text-indigo-800 transition-colors"
    >
      <span className="font-medium">{platformLabel(platform)}</span>
      <span className="text-gray-400">— View original post</span>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
