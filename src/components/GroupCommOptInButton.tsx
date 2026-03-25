"use client";

import { useState, useEffect } from "react";

interface GroupCommOptInButtonProps {
  groupId: string;
  groupName: string;
}

export function GroupCommOptInButton({ groupId, groupName }: GroupCommOptInButtonProps) {
  const [optedIn, setOptedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/opt-in?groupId=${encodeURIComponent(groupId)}`)
      .then((res) => (res.ok ? res.json() : { optedIn: false }))
      .then((data) => {
        setOptedIn(data.optedIn);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [groupId]);

  async function handleToggle() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/groups/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (res.ok) {
        const data = await res.json();
        setOptedIn(data.optedIn);
      }
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={optedIn}
          onChange={handleToggle}
          disabled={isLoading}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <div>
          <p className="text-sm font-medium text-gray-700">
            Receive updates from {groupName}
          </p>
          <p className="text-xs text-gray-500">
            Opt in to receive communications from this group outside of AskThem.
            You can opt out at any time.
          </p>
        </div>
      </label>
    </div>
  );
}
