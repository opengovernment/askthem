// ── Cook Political Report Senate Race Ratings ───────────────────────
// According to Cook Political Report, as of Feb. 16, 2026
// Source: https://www.cookpolitical.com/ratings/senate-race-ratings
//
// 35 seats up in 2026 (23 R, 12 D + 2 special elections)
// Democrats need net +4 to retake majority.

export type SenateRace = {
  slug: string; // e.g. "ga"
  state: string; // e.g. "GA"
  name: string; // e.g. "Ossoff"
  isOpen: boolean;
};

export type SenateRatingCategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  races: SenateRace[];
};

function parseRace(entry: string): SenateRace {
  // "GA: Ossoff" or "MI: OPEN"
  const [state, rest] = entry.split(": ");
  const isOpen = rest === "OPEN" || rest.startsWith("OPEN (");
  const name = isOpen
    ? rest === "OPEN"
      ? ""
      : rest.replace("OPEN (", "").replace(")", "")
    : rest;
  return {
    slug: state.toLowerCase(),
    state,
    name,
    isOpen,
  };
}

const LIKELY_D_RAW = ["MN: OPEN"];
const LEAN_D_RAW = ["NH: OPEN"];
const TOSS_UP_RAW = ["GA: Ossoff", "ME: Collins", "MI: OPEN", "NC: OPEN"];
const LEAN_R_RAW = ["AK: Sullivan", "OH: Husted"];
const LIKELY_R_RAW = ["IA: OPEN", "TX: Cornyn"];

export const RATINGS: SenateRatingCategory[] = [
  {
    label: "Likely D",
    color: "text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    races: LIKELY_D_RAW.map(parseRace),
  },
  {
    label: "Lean D",
    color: "text-blue-700",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-100",
    races: LEAN_D_RAW.map(parseRace),
  },
  {
    label: "Toss-Up",
    color: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    races: TOSS_UP_RAW.map(parseRace),
  },
  {
    label: "Lean R",
    color: "text-red-700",
    bgColor: "bg-red-50/50",
    borderColor: "border-red-100",
    races: LEAN_R_RAW.map(parseRace),
  },
  {
    label: "Likely R",
    color: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    races: LIKELY_R_RAW.map(parseRace),
  },
];

/** Flat lookup: slug → { race, rating label } */
export function findSenateRace(slug: string) {
  for (const rating of RATINGS) {
    const race = rating.races.find((r) => r.slug === slug);
    if (race) return { race, rating: rating.label };
  }
  return null;
}

/** All slugs, for generateStaticParams */
export function allSenateSlugs(): string[] {
  return RATINGS.flatMap((r) => r.races.map((race) => race.slug));
}
