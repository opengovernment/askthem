"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions";

interface MobileNavProps {
  user: { name?: string | null; role: string } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isModerator = user?.role === "moderator" || user?.role === "admin";

  const links = [
    { href: "/", label: "Home" },
    { href: "/officials", label: "Officials" },
    { href: "/questions", label: "Questions" },
    { href: "/ask", label: "Ask a Question" },
    ...(isModerator ? [{ href: "/moderate", label: "Moderate" }] : []),
  ];

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 z-50 border-b border-gray-200 bg-white shadow-lg sm:hidden">
          <div className="space-y-1 px-4 py-3">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === href
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-2">
              {user ? (
                <>
                  <p className="px-3 py-1 text-xs text-gray-500">{user.name ?? "Account"}</p>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Account Settings
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      onClick={() => setOpen(false)}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setOpen(false)}
                  className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
