"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddressSearchBar() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/address?q=${encodeURIComponent(address.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your street address to find your officials..."
          className="w-full rounded-full border border-gray-300 bg-white px-6 py-4 pr-14 text-lg text-gray-900 shadow-sm transition-shadow placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-orange-600 p-2.5 text-white transition-colors hover:bg-orange-700"
          aria-label="Find my officials"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
