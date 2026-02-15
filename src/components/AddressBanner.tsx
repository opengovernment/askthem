"use client";

import Link from "next/link";

export function AddressBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800">
      <span className="font-medium">Complete your profile:</span>{" "}
      <Link href="/address" className="underline hover:text-amber-900">
        Enter your address
      </Link>{" "}
      to find your elected officials and start asking questions.
    </div>
  );
}
