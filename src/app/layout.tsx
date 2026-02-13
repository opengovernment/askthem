import type { Metadata } from "next";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { UserMenu } from "@/components/UserMenu";
import { auth } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskThem - Ask Your Elected Officials",
  description:
    "A civic engagement platform where constituents ask questions and elected officials answer publicly.",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;
  const isModerator = user?.role === "moderator" || user?.role === "admin";

  return (
    <html lang="en">
      <body className="antialiased">
        {/* Navigation */}
        <nav className="relative border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              AskThem
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-4 sm:flex">
              <Link
                href="/officials"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Officials
              </Link>
              <Link
                href="/questions"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Questions
              </Link>
              <Link
                href="/ask"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Ask a Question
              </Link>
              {isModerator && (
                <Link
                  href="/moderate"
                  className="text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  Moderate
                </Link>
              )}
              {user ? (
                <UserMenu
                  user={{
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                  }}
                />
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile nav */}
            <MobileNav user={user ? { name: user.name, role: user.role } : null} />
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
            <p className="mt-2">
              <Link href="/feed.xml" className="text-indigo-500 hover:text-indigo-600">
                RSS Feed
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
