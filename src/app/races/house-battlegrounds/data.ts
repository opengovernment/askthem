// ── Cook Political Report House Race Ratings ────────────────────────
// According to Cook Political Report, as of Feb. 16, 2026
// Source: https://www.cookpolitical.com/ratings/house-race-ratings

export type HouseRace = {
  slug: string; // e.g. "ca-21"
  district: string; // e.g. "CA-21"
  name: string; // e.g. "Costa"
  isOpen: boolean;
};

export type HouseRatingCategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  races: HouseRace[];
};

function parseDistrict(entry: string): HouseRace {
  // "CA-21: Costa" or "MN-02: OPEN (Craig)"
  const [district, rest] = entry.split(": ");
  const isOpen = rest.startsWith("OPEN");
  const name = isOpen ? rest.replace("OPEN (", "").replace(")", "") : rest;
  return {
    slug: district.toLowerCase(),
    district,
    name,
    isOpen,
  };
}

const LIKELY_D_RAW = [
  "CA-21: Costa",
  "IN-01: Mrvan",
  "MN-02: OPEN (Craig)",
  "NH-01: OPEN (Pappas)",
  "NH-02: Goodlander",
  "NV-01: Titus",
  "NV-04: Horsford",
  "OR-05: Bynum",
];

const LEAN_D_RAW = [
  "CA-13: Gray",
  "CA-45: Tran",
  "FL-23: Moskowitz",
  "MI-08: McDonald Rivet",
  "NE-02: OPEN (Bacon)",
  "NJ-09: Pou",
  "NM-02: Vasquez",
  "NV-03: Lee",
  "NY-03: Suozzi",
  "NY-04: Gillen",
  "NY-19: Riley",
  "OH-13: Sykes",
  "TX-28: Cuellar",
  "VA-07: Vindman",
];

const TOSS_UP_RAW = [
  "AZ-01: OPEN (Schweikert)",
  "AZ-06: Ciscomani",
  "CA-22: Valadao",
  "CA-48: Issa",
  "CO-08: Evans",
  "IA-01: Miller-Meeks",
  "IA-03: Nunn",
  "MI-07: Barrett",
  "NJ-07: Kean Jr.",
  "NY-17: Lawler",
  "OH-01: Landsman",
  "OH-09: Kaptur",
  "PA-07: Mackenzie",
  "PA-10: Perry",
  "TX-34: Gonzalez",
  "VA-02: Kiggans",
  "WA-03: Perez",
  "WI-03: Van Orden",
];

const LEAN_R_RAW = [
  "MI-10: OPEN (James)",
  "NC-01: Davis",
  "PA-08: Bresnahan",
  "VA-01: Wittman",
];

const LIKELY_R_RAW = [
  "AK-AL: Begich III",
  "AZ-02: Crane",
  "CO-03: Hurd",
  "CO-05: Crank",
  "FL-07: Mills",
  "FL-13: Luna",
  "IA-02: OPEN (Hinson)",
  "ME-02: OPEN (Golden)",
  "MI-04: Huizenga",
  "MT-01: Zinke",
  "NC-11: Edwards",
  "PA-01: Fitzpatrick",
  "TN-05: Ogles",
  "TX-15: De La Cruz",
  "TX-35: OPEN (Casar)",
  "WI-01: Steil",
];

export const RATINGS: HouseRatingCategory[] = [
  {
    label: "Likely D",
    color: "text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    races: LIKELY_D_RAW.map(parseDistrict),
  },
  {
    label: "Lean D",
    color: "text-blue-700",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-100",
    races: LEAN_D_RAW.map(parseDistrict),
  },
  {
    label: "Toss-Up",
    color: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    races: TOSS_UP_RAW.map(parseDistrict),
  },
  {
    label: "Lean R",
    color: "text-red-700",
    bgColor: "bg-red-50/50",
    borderColor: "border-red-100",
    races: LEAN_R_RAW.map(parseDistrict),
  },
  {
    label: "Likely R",
    color: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    races: LIKELY_R_RAW.map(parseDistrict),
  },
];

/** Flat lookup: slug → { race, rating label } */
export function findHouseRace(slug: string) {
  for (const rating of RATINGS) {
    const race = rating.races.find((r) => r.slug === slug);
    if (race) return { race, rating: rating.label };
  }
  return null;
}

/** All slugs, for generateStaticParams */
export function allHouseSlugs(): string[] {
  return RATINGS.flatMap((r) => r.races.map((race) => race.slug));
}
