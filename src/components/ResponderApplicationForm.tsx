"use client";

import { useState } from "react";
import Link from "next/link";

export function ResponderApplicationForm() {
  const [officialName, setOfficialName] = useState("");
  const [officialTitle, setOfficialTitle] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/officials/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officialName: officialName.trim(),
          officialTitle: officialTitle.trim(),
          contactName: officialName.trim(),
          contactEmail: contactEmail.trim(),
          websiteUrl: websiteUrl.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-8 w-8 text-green-600"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Application Submitted</h1>
        <p className="mb-6 text-gray-600">
          Thank you for applying. Our team will review your application and be in touch
          at the email address you provided.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/officials" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
        &larr; Back to officials
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Get Verified on AskThem
      </h1>
      <p className="mb-4 text-gray-600">
        Verified officials on AskThem agree to publicly respond to at least one question
        per month from among their top-signed questions.
      </p>
      <p className="mb-8 text-gray-600">
        Fill out the form below and a site moderator will review your application.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="officialName" className="mb-1.5 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="officialName"
            type="text"
            value={officialName}
            onChange={(e) => setOfficialName(e.target.value)}
            placeholder="e.g. Jane Smith"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="officialTitle" className="mb-1.5 block text-sm font-medium text-gray-700">
            Office
          </label>
          <input
            id="officialTitle"
            type="text"
            value={officialTitle}
            onChange={(e) => setOfficialTitle(e.target.value)}
            placeholder="e.g. U.S. Senator, State Representative, City Council Member"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="mb-1.5 block text-sm font-medium text-gray-700">
            Official Government Link
          </label>
          <input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="e.g. https://smith.senate.gov"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-medium text-gray-700">
            Preferred Email Contact
          </label>
          <p className="mb-1.5 text-xs text-gray-500">
            Can be a government employee email address.
          </p>
          <input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="e.g. john.doe@senate.gov"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            !officialName.trim() ||
            !officialTitle.trim() ||
            !contactEmail.trim() ||
            !websiteUrl.trim()
          }
          className="w-full rounded-full bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-indigo-900">What happens next?</h3>
        <ul className="space-y-1 text-sm text-indigo-800">
          <li>1. Our team reviews your application and verifies your identity.</li>
          <li>2. We match your profile with your official record on AskThem.</li>
          <li>3. Your profile is marked as a Verified Responder with a green badge.</li>
          <li>4. Top questions from constituents are surfaced for you to answer.</li>
        </ul>
      </div>
    </div>
  );
}
