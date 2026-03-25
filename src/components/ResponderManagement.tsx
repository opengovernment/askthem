"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  officialName: string;
  officialTitle: string;
  contactName: string;
  contactEmail: string;
  websiteUrl: string;
  createdAt: string;
}

interface OfficialMatch {
  id: string;
  name: string;
  title: string;
  state: string;
  party: string;
}

interface ResponderManagementProps {
  applications: Application[];
}

export function ResponderManagement({ applications }: ResponderManagementProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No pending responder applications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const router = useRouter();
  const [isActing, setIsActing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showActions, setShowActions] = useState(false);

  // Official matching
  const [searchQuery, setSearchQuery] = useState(application.officialName);
  const [matches, setMatches] = useState<OfficialMatch[]>([]);
  const [selectedOfficialId, setSelectedOfficialId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  async function searchOfficials() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/officials/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.officials ?? []);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }

  async function handleAction(action: "approve" | "reject") {
    if (action === "approve" && !selectedOfficialId) return;
    setIsActing(true);
    try {
      const res = await fetch("/api/officials/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          action,
          officialId: selectedOfficialId,
          reviewNote: reviewNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setResult(action === "approve" ? "Approved" : "Rejected");
        setTimeout(() => router.refresh(), 800);
      } else {
        const data = await res.json();
        setResult(`Error: ${data.error}`);
      }
    } catch {
      setResult("Network error");
    } finally {
      setIsActing(false);
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm transition-opacity ${
        result ? "opacity-60" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{application.officialName}</h3>
          <p className="text-sm text-gray-600">{application.officialTitle}</p>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(application.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mb-4 space-y-1 text-sm text-gray-500">
        <p>
          <span className="font-medium text-gray-700">Contact:</span> {application.contactName}
        </p>
        <p>
          <span className="font-medium text-gray-700">Email:</span>{" "}
          <a href={`mailto:${application.contactEmail}`} className="text-indigo-600 hover:text-indigo-800">
            {application.contactEmail}
          </a>
        </p>
        <p>
          <span className="font-medium text-gray-700">Website:</span>{" "}
          <a
            href={application.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
          >
            {application.websiteUrl}
          </a>
        </p>
      </div>

      {result ? (
        <div
          className={`rounded px-3 py-2 text-sm font-medium ${
            result.startsWith("Error")
              ? "bg-red-50 text-red-700"
              : result === "Approved"
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {result}
        </div>
      ) : !showActions ? (
        <button
          onClick={() => {
            setShowActions(true);
            searchOfficials();
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Review Application
        </button>
      ) : (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          {/* Match to existing official */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Match to official in database
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search officials..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
              <button
                onClick={searchOfficials}
                disabled={searching}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>
            {matches.length > 0 && (
              <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {matches.map((o) => (
                  <label
                    key={o.id}
                    className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm ${
                      selectedOfficialId === o.id ? "bg-indigo-50 text-indigo-900" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="official"
                      value={o.id}
                      checked={selectedOfficialId === o.id}
                      onChange={() => setSelectedOfficialId(o.id)}
                      className="text-indigo-600"
                    />
                    <span className="font-medium">{o.name}</span>
                    <span className="text-gray-500">
                      {o.title} &middot; {o.party} &middot; {o.state}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {matches.length === 0 && !searching && showActions && (
              <p className="mt-2 text-xs text-gray-400">
                No matching officials found. Try a different search.
              </p>
            )}
          </div>

          {/* Review note */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Review note (optional)
            </label>
            <input
              type="text"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Internal note..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={isActing || !selectedOfficialId}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve &amp; Verify
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={isActing}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
