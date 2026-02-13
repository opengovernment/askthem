import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskThem - Ask Your Elected Officials",
  description:
    "A civic engagement platform where constituents ask questions and elected officials answer publicly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Navigation */}
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              AskThem
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/officials"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Officials
              </Link>
              <Link
                href="/ask"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Ask a Question
              </Link>
              <Link
                href="/moderate"
                className="text-sm font-medium text-gray-400 hover:text-gray-600"
              >
                Moderate
              </Link>
              <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Sign In
              </button>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-4 py-8">
          <div className="mx-auto max-w-5xl text-center text-sm text-gray-500">
            <p className="mb-2">
              <span className="font-semibold text-gray-700">AskThem</span> &mdash; Ask questions.
              Get answers. Hold officials accountable.
            </p>
            <p>
              A civic engagement platform for democratic dialogue. Questions are only delivered
              after constituent verification.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
