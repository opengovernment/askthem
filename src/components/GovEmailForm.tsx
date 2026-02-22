"use client";

import { useState } from "react";

export function GovEmailForm() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800"
      >
        To sign up with a government email address, click here.
      </button>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-gray-600">
        Government employees may sign in with a <strong>.gov</strong> email address. A moderator will assign your district access.
      </p>
      <form
        action="/api/auth/gov-signin"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const trimmed = email.trim().toLowerCase();
          if (!trimmed.endsWith(".gov")) {
            setError("Only .gov email addresses are accepted.");
            return;
          }
          // Submit via server action
          const form = e.currentTarget;
          const formData = new FormData(form);
          fetch("/api/auth/gov-signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: trimmed }),
          }).then(async (res) => {
            if (res.ok) {
              window.location.href = "/auth/verify-request";
            } else {
              const data = await res.json();
              setError(data.error || "Something went wrong.");
            }
          }).catch(() => {
            setError("Network error. Please try again.");
          });
        }}
      >
        <label htmlFor="gov-email" className="mb-1.5 block text-sm font-medium text-gray-700">
          Government email address
        </label>
        <input
          id="gov-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="you@agency.gov"
          className="mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        {error && (
          <p className="mb-2 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
            <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
          </svg>
          Sign in with .gov email
        </button>
      </form>
    </div>
  );
}
