"use client";

import { useState } from "react";
import Link from "next/link";

const ORG_TYPES = [
  { value: "advocacy", label: "Issue Advocacy Group" },
  { value: "think_tank", label: "Think Tank / Research Institute" },
  { value: "nonprofit", label: "Nonprofit Organization" },
  { value: "other", label: "Other" },
];

export function GroupApplicationForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [statement, setStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/groups/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          websiteUrl: websiteUrl.trim(),
          applicantEmail: applicantEmail.trim(),
          contactName: contactName.trim(),
          organizationType,
          statement: statement.trim(),
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
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-green-600">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Application Submitted!</h1>
        <p className="mb-2 text-gray-600">
          Your group verification application has been submitted for review by our site moderators.
        </p>
        <p className="mb-6 text-sm text-gray-500">
          You&apos;ll be notified once your application is reviewed. The verification process typically
          takes 2-5 business days.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
        &larr; Back to home
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">Apply for Group Verification</h1>
      <p className="mb-8 text-gray-600">
        Verified groups (advocacy organizations, think tanks, and nonprofits) can ask questions on
        behalf of their organization and display a verified badge. To verify your group, you must
        submit this application from an email address on your organization&apos;s web domain.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Name */}
        <div>
          <label htmlFor="groupName" className="mb-2 block text-sm font-medium text-gray-700">
            Organization Name
          </label>
          <input
            id="groupName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sierra Club"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
            Organization Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Briefly describe your organization's mission and focus areas."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="websiteUrl" className="mb-2 block text-sm font-medium text-gray-700">
            Organization Website
          </label>
          <input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.org"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        {/* Applicant Email */}
        <div>
          <label htmlFor="applicantEmail" className="mb-2 block text-sm font-medium text-gray-700">
            Your Email at the Organization
          </label>
          <p className="mb-2 text-xs text-gray-500">
            This must be an email address on the same domain as your website (e.g. you@example.org for example.org).
          </p>
          <input
            id="applicantEmail"
            type="email"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            placeholder="you@example.org"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        {/* Contact Name */}
        <div>
          <label htmlFor="contactName" className="mb-2 block text-sm font-medium text-gray-700">
            Contact Name
          </label>
          <input
            id="contactName"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        {/* Organization Type */}
        <div>
          <label htmlFor="orgType" className="mb-2 block text-sm font-medium text-gray-700">
            Organization Type
          </label>
          <select
            id="orgType"
            value={organizationType}
            onChange={(e) => setOrganizationType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          >
            <option value="">Select a type...</option>
            {ORG_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Verification Statement */}
        <div>
          <label htmlFor="statement" className="mb-2 block text-sm font-medium text-gray-700">
            Why should your group be verified?
          </label>
          <textarea
            id="statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Explain why your organization should be a verified group on AskThem. Include relevant context about your work and how you plan to use the platform."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
          <p className="mt-1 text-right text-xs text-gray-500">{statement.length}/1000 characters</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !name || !description || !websiteUrl || !applicantEmail || !contactName || !organizationType || !statement}
          className="w-full rounded-full bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "Submitting..." : "Submit Application for Review"}
        </button>
      </form>
    </div>
  );
}
