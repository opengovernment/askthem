import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate - AskThem",
  description:
    "Support AskThem — a free, nonpartisan platform connecting constituents with elected officials through public Q&A.",
};

const channels = [
  {
    name: "OpenCollective",
    description:
      "Our primary fiscal sponsor. Contributions through OpenCollective are tax-deductible and fully transparent — every dollar in and out is public.",
    cta: "Coming soon",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.466.732-3.558" />
      </svg>
    ),
  },
  {
    name: "Action Network",
    description:
      "Make a one-time or recurring donation through Action Network. Your contribution helps us keep the platform free and accessible to every constituent.",
    cta: "Coming soon",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    name: "Donor-Advised Fund (DAF)",
    description:
      "If you have a donor-advised fund, you can recommend a grant to AskThem. Contact us for our EIN and mailing details.",
    cta: "Coming soon",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
      </svg>
    ),
  },
  {
    name: "PayPal",
    description:
      "Send a quick contribution via PayPal. No account required — just a credit or debit card.",
    cta: "Coming soon",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
  },
];

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Support AskThem</h1>
        <p className="mb-10 text-lg text-gray-600">
          AskThem is a free, nonpartisan civic platform. We rely on individual donations
          to keep the lights on, pay for infrastructure, and stay independent. Every
          contribution — large or small — helps us connect more constituents with their
          elected officials.
        </p>

        <div className="space-y-4">
          {channels.map((ch) => (
            <div
              key={ch.name}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-indigo-50 p-3">{ch.icon}</div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{ch.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{ch.description}</p>
                  <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                    {ch.cta}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-indigo-100 bg-indigo-50 p-6 text-center">
          <p className="text-sm text-indigo-800">
            Questions about donating? Reach out at{" "}
            <span className="font-medium">donate@askthem.org</span>
          </p>
        </div>
      </div>
    </div>
  );
}
