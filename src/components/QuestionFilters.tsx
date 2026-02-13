"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface QuestionFiltersProps {
  tags: string[];
  officials: { id: string; name: string }[];
}

export function QuestionFilters({ tags, officials }: QuestionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "votes";
  const currentTag = searchParams.get("tag") || "";
  const currentOfficial = searchParams.get("official") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/questions?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="votes">Most Votes</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>

      <select
        value={currentTag}
        onChange={(e) => updateParam("tag", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="">All Topics</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <select
        value={currentOfficial}
        onChange={(e) => updateParam("official", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="">All Officials</option>
        {officials.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      {(currentTag || currentOfficial || currentSort !== "votes") && (
        <button
          onClick={() => router.push("/questions")}
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
