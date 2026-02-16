import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - AskThem",
  description:
    "Learn how AskThem works: ask your elected officials questions, get verified answers, and hold representatives accountable.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">About AskThem</h1>
        <p className="mb-10 text-lg text-gray-600">
          A free platform that connects constituents with their elected officials
          through public Q&amp;A.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Free to sign up
            </h2>
            <p className="leading-relaxed text-gray-700">
              Creating an account on AskThem is completely free. Once you sign up
              you can browse questions and answers from officials across the
              country.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Find your elected officials
            </h2>
            <p className="leading-relaxed text-gray-700">
              Enter your street address to see who represents you at the
              federal, state, and local level. From there you can ask them a
              question directly or upvote questions submitted by other
              constituents.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Verified delivery
            </h2>
            <p className="leading-relaxed text-gray-700">
              Before a question is delivered to an official, we check the
              voter-registration status at your address using trusted
              third-party verification services. This ensures that officials
              hear from real, verified constituents.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Public answers for everyone
            </h2>
            <p className="leading-relaxed text-gray-700">
              When an elected official responds, their answer is shared publicly
              so every constituent can see it &mdash; not just the person who
              asked. Transparency is at the core of how AskThem works.
            </p>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/auth/signin"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign up free
          </Link>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400"
          >
            Browse questions
          </Link>
        </div>
      </div>
    </div>
  );
}
