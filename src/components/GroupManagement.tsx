"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  applicantEmail: string;
  contactName: string;
  organizationType: string;
  statement: string;
  status: string;
  createdAt: string;
  group: {
    id: string;
    name: string;
    slug: string;
    description: string;
    websiteDomain: string;
    websiteUrl: string;
    isVerified: boolean;
    commsOptInEnabled: boolean;
    adminUser: { name: string; email: string };
  };
}

interface VerifiedGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteDomain: string;
  websiteUrl: string;
  isVerified: boolean;
  commsOptInEnabled: boolean;
  adminUser: { name: string; email: string };
  _count: { questions: number };
}

interface GroupManagementProps {
  pendingApplications: Application[];
  verifiedGroups: VerifiedGroup[];
  activeTab: string;
}

const orgTypeLabels: Record<string, string> = {
  advocacy: "Advocacy Group",
  think_tank: "Think Tank",
  nonprofit: "Nonprofit",
  other: "Other",
};

export function GroupManagement({ pendingApplications, verifiedGroups, activeTab }: GroupManagementProps) {
  if (activeTab === "verified") {
    return (
      <div className="space-y-4">
        {verifiedGroups.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No verified groups yet.</p>
          </div>
        ) : (
          verifiedGroups.map((group) => (
            <VerifiedGroupCard key={group.id} group={group} />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingApplications.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No pending applications.</p>
        </div>
      ) : (
        pendingApplications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))
      )}
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const router = useRouter();
  const [isActing, setIsActing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  async function handleAction(action: "approve" | "reject") {
    setIsActing(true);
    try {
      const res = await fetch("/api/groups/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          applicationId: application.id,
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
    <div className={`rounded-lg border bg-white p-5 shadow-sm transition-opacity ${result ? "opacity-60" : ""}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{application.group.name}</h3>
          <p className="text-sm text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {orgTypeLabels[application.organizationType] || application.organizationType}
            </span>
            <span className="ml-2">
              <a href={application.group.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
                {application.group.websiteDomain}
              </a>
            </span>
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(application.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="mb-3 text-sm text-gray-700">{application.group.description}</p>

      <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
        <p className="mb-1 text-xs font-medium text-gray-500">Verification Statement</p>
        <p className="text-sm text-gray-700">{application.statement}</p>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        <span>Contact: {application.contactName}</span>
        <span className="mx-2">&middot;</span>
        <span>{application.applicantEmail}</span>
        <span className="mx-2">&middot;</span>
        <span>Account: {application.group.adminUser.name} ({application.group.adminUser.email})</span>
      </div>

      {result ? (
        <div className={`rounded px-3 py-2 text-sm font-medium ${result.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {result}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor={`note-${application.id}`} className="mb-1 block text-xs font-medium text-gray-500">
              Review note (optional)
            </label>
            <input
              id={`note-${application.id}`}
              type="text"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Optional note for the applicant..."
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={isActing}
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
          </div>
        </div>
      )}
    </div>
  );
}

function VerifiedGroupCard({ group }: { group: VerifiedGroup }) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [commsEnabled, setCommsEnabled] = useState(group.commsOptInEnabled);

  async function toggleComms() {
    setIsToggling(true);
    try {
      const res = await fetch("/api/groups/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_comms", groupId: group.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setCommsEnabled(data.commsOptInEnabled);
        router.refresh();
      }
    } catch {
      // silently ignore
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        </div>
        <span className="text-sm text-gray-500">{group._count.questions} questions</span>
      </div>

      <p className="mb-3 text-sm text-gray-600">{group.description}</p>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <a href={group.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
          {group.websiteDomain}
        </a>
        <span>&middot;</span>
        <span>Admin: {group.adminUser.name}</span>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={commsEnabled}
            onChange={toggleComms}
            disabled={isToggling}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-gray-700">
            Allow users to opt in to communications from this group
          </span>
        </label>
        {isToggling && <span className="text-xs text-gray-400">Saving...</span>}
      </div>
    </div>
  );
}
