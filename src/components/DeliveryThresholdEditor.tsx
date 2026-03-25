"use client";

import { useState } from "react";

const SITE_DEFAULT = 5;

interface DeliveryThresholdEditorProps {
  officialId: string;
  officialName: string;
  initialThreshold: number | null;
  initialType: string;
}

export function DeliveryThresholdEditor({
  officialId,
  officialName,
  initialThreshold,
  initialType,
}: DeliveryThresholdEditorProps) {
  const [threshold, setThreshold] = useState(
    initialThreshold?.toString() ?? "",
  );
  const [thresholdType, setThresholdType] = useState(initialType);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const effectiveThreshold = threshold === "" ? SITE_DEFAULT : Number(threshold);

  async function handleSave() {
    setSaving(true);
    setResult(null);

    try {
      const res = await fetch("/api/officials/threshold", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officialId,
          threshold: threshold === "" ? null : Number(threshold),
          thresholdType,
        }),
      });

      if (res.ok) {
        setResult("Saved");
        setTimeout(() => setResult(null), 2000);
      } else {
        const data = await res.json();
        setResult(`Error: ${data.error}`);
      }
    } catch {
      setResult("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h3 className="mb-1 text-sm font-semibold text-amber-900">
        Delivery Threshold
      </h3>
      <p className="mb-4 text-xs text-amber-700">
        Set the number of signatures required before a question to{" "}
        {officialName.split(" ")[0]} qualifies for delivery.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Threshold
          </label>
          <input
            type="number"
            min="1"
            placeholder={`${SITE_DEFAULT} (default)`}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Count type
          </label>
          <select
            value={thresholdType}
            onChange={(e) => setThresholdType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          >
            <option value="constituent">Constituent signatures</option>
            <option value="supporter">Supporter signatures (all)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <p className="mt-3 text-xs text-amber-700">
        Effective threshold:{" "}
        <span className="font-semibold">{effectiveThreshold}</span>{" "}
        {thresholdType === "constituent" ? "constituent" : "total"} signature
        {effectiveThreshold !== 1 ? "s" : ""}
        {threshold === "" && (
          <span className="text-amber-500"> (site default)</span>
        )}
      </p>

      {result && (
        <p
          className={`mt-2 text-xs font-medium ${
            result.startsWith("Error")
              ? "text-red-600"
              : "text-green-700"
          }`}
        >
          {result}
        </p>
      )}
    </div>
  );
}
