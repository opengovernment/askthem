"use client";

import { useState, useRef, useEffect } from "react";
import { VerifiedBadge } from "./VerifiedBadge";

interface Endorsement {
  id: string;
  note: string | null;
  group: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
    websiteUrl: string;
  };
}

export function GroupEndorsementBadge({ endorsements }: { endorsements: Endorsement[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (endorsements.length === 0) return null;

  const firstGroup = endorsements[0].group;
  const extraCount = endorsements.length - 1;

  return (
    <div className="relative inline-block" ref={ref}>
      {/* The compact badge — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM6 3a1 1 0 00-1 1v11.07a1 1 0 00.629.929l2.09.836a5 5 0 003.49.106l.474-.158a3 3 0 012.094 0l.866.289A1 1 0 0016 16.131V5.078a1 1 0 00-.629-.928l-.866-.29a5 5 0 00-3.49-.106l-.474.158a3 3 0 01-2.094 0L6.357 3.076A1 1 0 006 3z" />
        </svg>
        Endorsed by {firstGroup.name}
        {extraCount > 0 && ` +${extraCount}`}
      </button>

      {/* Hover/click popover with details */}
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute left-0 top-full z-20 mt-1.5 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Group Endorsements
          </p>
          <div className="space-y-2.5">
            {endorsements.map((e) => (
              <div key={e.id} className="flex items-start gap-2">
                {e.group.logoUrl ? (
                  <img
                    src={e.group.logoUrl}
                    alt={e.group.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                    {e.group.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <a
                      href={e.group.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate"
                    >
                      {e.group.name}
                    </a>
                    <VerifiedBadge />
                  </div>
                  {e.note ? (
                    <p className="text-xs text-gray-500 italic">&ldquo;{e.note}&rdquo;</p>
                  ) : (
                    <p className="text-xs text-gray-500">supports this question</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
