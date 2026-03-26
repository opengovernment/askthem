import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { UserMenu } from "@/components/UserMenu";
import { AddressBanner } from "@/components/AddressBanner";
import { auth } from "@/auth";
import { getSiteMode } from "@/lib/site-mode";
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
  const [session, siteMode] = await Promise.all([auth(), getSiteMode()]);
  const user = session?.user;
  const isModerator = user?.role === "moderator" || user?.role === "admin";

  // Maintenance mode: show full-page placard for non-moderators
  if (siteMode.maintenance && !isModerator) {
    return (
      <html lang="en">
        <body className="antialiased">
          <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-amber-600">
                  <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900">Under Maintenance</h1>
              <p className="mb-8 text-gray-600">
                AskThem is temporarily undergoing maintenance. We&apos;ll be back shortly.
                Thank you for your patience.
              </p>
              <a
                href="/auth/signin?callbackUrl=/moderate"
                className="text-xs text-gray-400 hover:text-gray-500"
              >
                Site administrator?
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased">
        {/* Maintenance mode banner for moderators */}
        {siteMode.maintenance && isModerator && (
          <div className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
            Maintenance mode is active — only moderators and admins can see the site.{" "}
            <Link href="/moderate" className="underline hover:text-red-100">
              Turn off
            </Link>
          </div>
        )}

        {/* Read-only mode banner */}
        {siteMode.readOnly && (
          <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
            The site is currently in read-only mode. New questions and registrations are temporarily paused.
            {isModerator && (
              <>
                {" "}
                <Link href="/moderate" className="underline hover:text-amber-100">
                  Turn off
                </Link>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="relative border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/">
              <Image src="/logo.svg" alt="AskThem" width={135} height={30} priority unoptimized />
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
                className="text-sm font-medium text-gray-600 hover:text-orange-600"
              >
                Ask a Question
              </Link>
              {/* TODO: Restore moderator-only check: isModerator && (...) */}
              {user && (
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
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    isProfilePublic: user.isProfilePublic,
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

        {user && !user.isAddressVerified && <AddressBanner />}

        {children}

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-4 py-6">
          <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-gray-500">
            <Image src="/logo.svg" alt="AskThem" width={100} height={22} unoptimized />
            <div className="flex items-center gap-4">
              <Link href="/about" className="text-gray-500 hover:text-indigo-600">
                About
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-indigo-600">
                Contact
              </Link>
              <Link href="/join" className="text-gray-500 hover:text-indigo-600">
                Join Us
              </Link>
              <Link href="/events" className="text-gray-500 hover:text-indigo-600">
                Events
              </Link>
              <Link href="/groups" className="text-gray-500 hover:text-indigo-600">
                Groups
              </Link>
              <Link href="/events#ama" className="text-gray-500 hover:text-indigo-600">
                Live Q&amp;A
              </Link>
              <Link href="/races" className="text-gray-500 hover:text-indigo-600">
                Races
              </Link>
              <Link href="/states" className="text-gray-500 hover:text-indigo-600">
                States
              </Link>
              <Link href="/visualize" className="text-gray-500 hover:text-indigo-600">
                Visualize
              </Link>
              <Link href="/widgets" className="text-gray-500 hover:text-indigo-600">
                Widgets
              </Link>
              <Link href="/donate" className="text-gray-500 hover:text-indigo-600">
                Donate
              </Link>
              <Link href="/feed.xml" className="text-indigo-500 hover:text-indigo-600">
                RSS Feed
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
