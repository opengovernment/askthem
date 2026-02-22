"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


interface District {
  officialId: string;
  name: string;
  title: string;
  party: string;
  state: string;
  district: string | null;
  chamber: string;
  photoUrl: string | null;
}

interface AccountSettingsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    state: string | null;
    isProfilePublic: boolean;
    emailConsent: boolean;
    isAddressVerified: boolean;
    createdAt: string;
  };
  districts: District[];
}

const CHAMBER_ORDER: Record<string, number> = {
  senate: 0,
  house: 1,
  state_exec: 2,
  state_senate: 3,
  state_house: 4,
  local: 5,
};

function chamberLabel(chamber: string): string {
  switch (chamber) {
    case "senate":
      return "U.S. Senate";
    case "house":
      return "U.S. House";
    case "state_exec":
      return "State Executive";
    case "state_senate":
      return "State Senate";
    case "state_house":
      return "State House";
    case "local":
      return "Local";
    default:
      return chamber;
  }
}

export function AccountSettings({ user, districts }: AccountSettingsProps) {
  const router = useRouter();
  const [profilePublic, setProfilePublic] = useState(user.isProfilePublic);
  const [emailConsent, setEmailConsent] = useState(user.emailConsent);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirming" | "typing" | "deleting">("idle");
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function toggleSetting(field: "isProfilePublic" | "emailConsent", newValue: boolean) {
    setSaving(field);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (res.ok) {
        if (field === "isProfilePublic") setProfilePublic(newValue);
        if (field === "emailConsent") setEmailConsent(newValue);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete() {
    if (deleteInput !== "DELETE") return;
    setDeleteStep("deleting");
    setDeleteError(null);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (res.ok) {
        // Account deleted — redirect to home. The session is now invalid.
        window.location.href = "/";
      } else {
        const data = await res.json();
        setDeleteError(data.error ?? "Something went wrong. Please try again.");
        setDeleteStep("typing");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
      setDeleteStep("typing");
    }
  }

  // Deduplicate district labels (e.g. "NY-14") sorted by chamber level
  const uniqueDistricts = [
    ...new Set(
      [...districts]
        .sort((a, b) => (CHAMBER_ORDER[a.chamber] ?? 99) - (CHAMBER_ORDER[b.chamber] ?? 99))
        .map((d) => (d.district ? `${d.state}-${d.district}` : d.state))
        .filter(Boolean),
    ),
  ];

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mt-6 space-y-8">
      {/* Profile Info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img src={user.image} alt="" className="h-10 w-10 rounded-full" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                {(user.name ?? user.email)
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name ?? "—"}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Member since {joinDate}</p>
        </div>
      </section>

      {/* District Info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Your Districts</h2>

        {!user.isAddressVerified ? (
          <p className="mt-3 text-sm text-gray-500">
            You haven&apos;t verified your address yet.
          </p>
        ) : uniqueDistricts.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No district information found.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {uniqueDistricts.map((label) => (
              <span
                key={label}
                className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Preferences */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
        <div className="mt-4 space-y-4">
          {/* Public Profile Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Public Profile</p>
              <p className="text-xs text-gray-500">
                Allow others to see your profile page with your questions and activity.
              </p>
            </div>
            <button
              onClick={() => toggleSetting("isProfilePublic", !profilePublic)}
              disabled={saving === "isProfilePublic"}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: profilePublic ? "#4f46e5" : "#d1d5db" }}
              aria-label="Toggle public profile"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  profilePublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Email Updates Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Updates</p>
              <p className="text-xs text-gray-500">
                Receive email notifications about your questions and platform updates.
              </p>
            </div>
            <button
              onClick={() => toggleSetting("emailConsent", !emailConsent)}
              disabled={saving === "emailConsent"}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: emailConsent ? "#4f46e5" : "#d1d5db" }}
              aria-label="Toggle email updates"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  emailConsent ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
        <p className="mt-2 text-sm text-gray-500">
          Having trouble or have a question? Reach out to our support team.
        </p>
        <a
          href={process.env.NEXT_PUBLIC_SUPPORT_URL ?? "mailto:support@askthem.io"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.14 43.14 0 00-4.853 0C9.182 4.751 7.5 6.293 7.5 8.25v1.5c0 1.957 1.682 3.5 3.5 3.5h1.5c.028 0 .055 0 .083-.002.388.457.842.857 1.348 1.186A7.486 7.486 0 0110 15.5a7.486 7.486 0 01-3.269-.762C5.412 15.426 3.9 16 2.246 16A.247.247 0 012 15.754c0-.09.048-.17.126-.22a4.463 4.463 0 001.349-1.74A6.979 6.979 0 012 10.25v-1.5c0-2.732 1.552-5.052 3.505-6.385z" />
            <path d="M12.5 7.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zm3 0a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM18 8.25c0 1.77-.983 3.337-2.458 4.132A3.748 3.748 0 0018 9.25v-1c0-1.088-.463-2.07-1.202-2.757A3.253 3.253 0 0118 8.25z" />
          </svg>
          Contact Support
        </a>
      </section>

      {/* Danger Zone: Delete Account */}
      <section className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">Delete Account</h2>
        <p className="mt-2 text-sm text-red-700">
          Permanently delete your account and all your public questions.
          This action cannot be undone.
        </p>

        {deleteStep === "idle" && (
          <button
            onClick={() => setDeleteStep("confirming")}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete My Account
          </button>
        )}

        {deleteStep === "confirming" && (
          <div className="mt-4 rounded-lg border border-red-300 bg-white p-4">
            <p className="text-sm font-medium text-red-900">
              Are you sure? This will permanently delete:
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-red-700">
              <li>Your account and profile</li>
              <li>All questions you have asked</li>
              <li>All your upvotes and comments</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setDeleteStep("typing")}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, I want to delete my account
              </button>
              <button
                onClick={() => setDeleteStep("idle")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {(deleteStep === "typing" || deleteStep === "deleting") && (
          <div className="mt-4 rounded-lg border border-red-300 bg-white p-4">
            <label htmlFor="delete-confirm" className="block text-sm font-medium text-red-900">
              Type <span className="font-mono font-bold">DELETE</span> to confirm:
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              disabled={deleteStep === "deleting"}
              placeholder="DELETE"
              className="mt-2 w-full rounded-lg border border-red-300 px-4 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 disabled:opacity-50"
              autoComplete="off"
            />
            {deleteError && (
              <p className="mt-2 text-sm text-red-600">{deleteError}</p>
            )}
            <div className="mt-3 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteInput !== "DELETE" || deleteStep === "deleting"}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {deleteStep === "deleting" ? "Deleting..." : "Permanently Delete My Account"}
              </button>
              <button
                onClick={() => {
                  setDeleteStep("idle");
                  setDeleteInput("");
                  setDeleteError(null);
                }}
                disabled={deleteStep === "deleting"}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
