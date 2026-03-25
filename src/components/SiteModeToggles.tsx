"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SiteModeTogglesProps {
  initialReadOnly: boolean;
  initialMaintenance: boolean;
}

export function SiteModeToggles({ initialReadOnly, initialMaintenance }: SiteModeTogglesProps) {
  const router = useRouter();
  const [readOnly, setReadOnly] = useState(initialReadOnly);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(field: "readOnlyMode" | "maintenanceMode") {
    const newValue = field === "readOnlyMode" ? !readOnly : !maintenance;
    setSaving(field);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (res.ok) {
        if (field === "readOnlyMode") setReadOnly(newValue);
        if (field === "maintenanceMode") setMaintenance(newValue);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Read-Only Mode */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div>
          <p className="text-sm font-medium text-amber-900">Read-Only Mode</p>
          <p className="mt-0.5 text-xs text-amber-700">
            Blocks new questions and new user registrations. Existing content remains visible.
            Moderators and admins can still operate normally.
          </p>
        </div>
        <button
          onClick={() => toggle("readOnlyMode")}
          disabled={saving === "readOnlyMode"}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50"
          style={{ backgroundColor: readOnly ? "#d97706" : "#d1d5db" }}
          aria-label="Toggle read-only mode"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              readOnly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Maintenance Mode */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
        <div>
          <p className="text-sm font-medium text-red-900">Maintenance Mode</p>
          <p className="mt-0.5 text-xs text-red-700">
            Shows a full-page maintenance placard to all visitors. Only moderators and admins
            can bypass it. Use for emergencies only.
          </p>
        </div>
        <button
          onClick={() => toggle("maintenanceMode")}
          disabled={saving === "maintenanceMode"}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50"
          style={{ backgroundColor: maintenance ? "#dc2626" : "#d1d5db" }}
          aria-label="Toggle maintenance mode"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              maintenance ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
