"use client";

import { useState } from "react";

export default function Home() {
  const [selected, setSelected] = useState<"kyle" | "kuzma" | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#00471B]">
      <div className="flex gap-8">
        <button
          onClick={() => setSelected("kyle")}
          className={`px-12 py-6 text-2xl font-bold rounded-lg transition-all duration-200 cursor-pointer border-4 ${
            selected === "kyle"
              ? "bg-white text-[#00471B] border-white scale-110 shadow-2xl"
              : "bg-[#8B0000] text-white border-[#8B0000] hover:bg-[#a00000] hover:border-[#a00000] hover:scale-105"
          }`}
        >
          Kyle
        </button>
        <button
          onClick={() => setSelected("kuzma")}
          className={`px-12 py-6 text-2xl font-bold rounded-lg transition-all duration-200 cursor-pointer border-4 ${
            selected === "kuzma"
              ? "bg-white text-[#00471B] border-white scale-110 shadow-2xl"
              : "bg-[#8B0000] text-white border-[#8B0000] hover:bg-[#a00000] hover:border-[#a00000] hover:scale-105"
          }`}
        >
          Kuzma
        </button>
      </div>
    </div>
  );
}
