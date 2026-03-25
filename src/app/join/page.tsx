import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Join Us - AskThem",
  description:
    "Stay connected with AskThem. Sign up to get updates on events, campaigns, and ways to engage with your elected officials.",
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Join Us</h1>
        <p className="mb-10 text-lg text-gray-600">
          Sign up to get updates from AskThem.
        </p>

        <section>
          <link
            href="https://actionnetwork.org/css/style-embed-v3.css"
            rel="stylesheet"
            type="text/css"
          />
          <Script
            src="https://actionnetwork.org/widgets/v6/form/get-updates-from-askthem?format=js&source=widget"
            strategy="afterInteractive"
          />
          <div
            id="can-form-area-get-updates-from-askthem"
            style={{ width: "100%" }}
          >
            {/* this div is the target for our HTML insertion */}
          </div>
        </section>
      </div>
    </div>
  );
}
