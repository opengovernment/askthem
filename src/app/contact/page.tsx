import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - AskThem",
  description:
    "Get in touch with the AskThem team. Email us or follow us on social media.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Contact</h1>
        <p className="mb-10 text-lg text-gray-600">
          We&apos;d love to hear from you.
        </p>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Email</h2>
          <p className="text-gray-700">
            Email us: <span className="text-gray-400">[soon]</span>
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Follow Us
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <a
                href="https://bsky.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Bluesky
              </a>
            </li>
            <li>
              <a
                href="https://mastodon.social"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Mastodon
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
