import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Preview - AskThem",
  description:
    "AskThem is a free Q&A platform with elected officials. We're seeking partners to launch a new version with civic AI for moderated public dialogue.",
};

/* ── Mock Q&A screenshots ─────────────────────────────────────────── */

const mockQAs = [
  {
    official: "Sen. Diana Marquez",
    title: "State Senator, District 14",
    party: "D",
    question:
      "The city's lead pipe replacement program is two years behind schedule. Will you support emergency funding in the next state budget to accelerate the timeline?",
    questioner: "Maria T., Springfield",
    upvotes: 47,
    answer:
      "Thank you for raising this. I've co-sponsored S.B. 2041 which allocates $12M in emergency infrastructure funds specifically for lead pipe remediation. I expect a committee vote in April and will push for floor action before the summer recess.",
  },
  {
    official: "Rep. James Whitfield",
    title: "State Representative, District 8",
    party: "R",
    question:
      "Our school district lost 3 bus routes this year, leaving families in rural areas without reliable transportation. What is your plan to restore school transit funding?",
    questioner: "David R., Oak Hills",
    upvotes: 32,
    answer:
      "I hear you. I've requested a hearing in the Education Committee to review the transit formula. My office is also working with the county to explore a shared-ride pilot program that could restore coverage by fall semester.",
  },
  {
    official: "Council Member Priya Nair",
    title: "City Council, Ward 6",
    party: "I",
    question:
      "The vacant lot on Elm and 5th has been attracting illegal dumping for over a year. Will the city take action to clean and fence the property?",
    questioner: "James K., Riverside",
    upvotes: 21,
    answer: null,
  },
];

const partyColor: Record<string, string> = {
  D: "bg-blue-100 text-blue-700",
  R: "bg-red-100 text-red-700",
  I: "bg-gray-100 text-gray-700",
};

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-indigo-600 to-indigo-800 px-4 py-20 text-center text-white">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          AskThem
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100">
          A free questions-and-answers platform with elected officials. Created
          in 2014, we&rsquo;re now seeking partners to launch a new version with
          civic AI for moderated public dialogue.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base text-indigo-200">
          Get in touch and support our nonprofit work for democratic
          accountability.
        </p>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* ── Action Network Signup ─────────────────────────────── */}
        <section className="mb-20">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Stay Connected
          </h2>
          <p className="mb-8 text-center text-gray-600">
            Sign up for updates on our relaunch and ways to get involved.
          </p>
          <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
            />
          </div>
        </section>

        {/* ── Mock Q&A Screenshots ──────────────────────────────── */}
        <section className="mb-20">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mb-10 text-center text-gray-600">
            Constituents ask. Officials answer. Everyone sees.
          </p>

          <div className="space-y-6">
            {mockQAs.map((qa, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Official header */}
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {qa.official
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {qa.official}
                    </p>
                    <p className="text-xs text-gray-500">{qa.title}</p>
                  </div>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${partyColor[qa.party]}`}
                  >
                    {qa.party}
                  </span>
                </div>

                {/* Question */}
                <div className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {qa.question}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>Asked by {qa.questioner}</span>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5 text-indigo-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {qa.upvotes} upvotes
                    </span>
                  </div>
                </div>

                {/* Answer */}
                {qa.answer ? (
                  <div className="border-t border-gray-100 bg-emerald-50/50 px-5 py-4">
                    <div className="mb-1 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 text-emerald-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-emerald-700">
                        Official Response
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {qa.answer}
                    </p>
                  </div>
                ) : (
                  <div className="border-t border-gray-100 bg-amber-50/50 px-5 py-3">
                    <span className="text-xs font-medium text-amber-700">
                      Awaiting response&hellip;
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── AI Uses Infographic ───────────────────────────────── */}
        <section className="mb-20">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            How We Use Civic AI
          </h2>
          <p className="mb-8 text-center text-gray-600">
            AI assists moderation and delivery &mdash; humans stay in control.
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Image
              src="/ai-uses-infographic.png"
              alt="AskThem AI Uses Infographic — how civic AI assists question moderation, delivery, monitoring, alerts, and sentiment analysis"
              width={1200}
              height={800}
              className="h-auto w-full"
              unoptimized
            />
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────── */}
        <section className="pb-8 text-center">
          <p className="text-sm text-gray-500">
            Contact: <span className="italic">[soon]</span>
          </p>
        </section>
      </div>
    </div>
  );
}
