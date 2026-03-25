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

// ── Candidate data ──────────────────────────────────────────────────

export type Candidate = {
  name: string;
  party: "D" | "R" | string;
  isIncumbent: boolean;
  bio?: string;
};

export const CANDIDATES: Record<string, Candidate[]> = {
  // ── Likely D ────────────────────────────────────────────────────────
  "ca-21": [
    { name: "Jim Costa", party: "D", isIncumbent: true, bio: "Long-serving representative for the Central Valley since 2005." },
  ],
  "in-01": [
    { name: "Frank Mrvan", party: "D", isIncumbent: true, bio: "Representative for northwest Indiana since 2021." },
  ],
  "mn-02": [
    // OPEN — Angie Craig not seeking re-election
  ],
  "nh-01": [
    // OPEN — Chris Pappas not seeking re-election
  ],
  "nh-02": [
    { name: "Maggie Goodlander", party: "D", isIncumbent: true, bio: "Former federal prosecutor and DOJ official, elected in 2024." },
  ],
  "nv-01": [
    { name: "Dina Titus", party: "D", isIncumbent: true, bio: "Representative for the Las Vegas area since 2013." },
  ],
  "nv-04": [
    { name: "Steven Horsford", party: "D", isIncumbent: true, bio: "Representative for southern Nevada, also serves as CBC chair." },
  ],
  "or-05": [
    { name: "Janelle Bynum", party: "D", isIncumbent: true, bio: "Former Oregon state representative, elected to Congress in 2024." },
  ],

  // ── Lean D ──────────────────────────────────────────────────────────
  "ca-13": [
    { name: "Adam Gray", party: "D", isIncumbent: true, bio: "Former California state assemblymember, elected in 2024." },
  ],
  "ca-45": [
    { name: "Derek Tran", party: "D", isIncumbent: true, bio: "Vietnam-born veteran and attorney, elected in 2024." },
  ],
  "fl-23": [
    { name: "Jared Moskowitz", party: "D", isIncumbent: true, bio: "Former Florida emergency management director, serving since 2023." },
  ],
  "mi-08": [
    { name: "Kristen McDonald Rivet", party: "D", isIncumbent: true, bio: "Former state senator from the Bay City area, elected in 2024." },
  ],
  "ne-02": [
    // OPEN — Don Bacon not seeking re-election
  ],
  "nj-09": [
    { name: "Nellie Pou", party: "D", isIncumbent: true, bio: "Long-serving New Jersey state legislator, elected to Congress in 2024." },
  ],
  "nm-02": [
    { name: "Gabe Vasquez", party: "D", isIncumbent: true, bio: "Representative for southern New Mexico, former Las Cruces city councilor." },
  ],
  "nv-03": [
    { name: "Susie Lee", party: "D", isIncumbent: true, bio: "Representative for the southern Nevada suburbs since 2019." },
  ],
  "ny-03": [
    { name: "Tom Suozzi", party: "D", isIncumbent: true, bio: "Returned to Congress in a 2024 special election for the Long Island-based seat." },
  ],
  "ny-04": [
    { name: "Laura Gillen", party: "D", isIncumbent: true, bio: "Former Hempstead town supervisor, elected in 2024." },
  ],
  "ny-19": [
    { name: "Josh Riley", party: "D", isIncumbent: true, bio: "Labor attorney from the Southern Tier, elected in 2024." },
  ],
  "oh-13": [
    { name: "Emilia Sykes", party: "D", isIncumbent: true, bio: "Representative for the Akron area, former Ohio House minority leader." },
  ],
  "tx-28": [
    { name: "Henry Cuellar", party: "D", isIncumbent: true, bio: "Long-serving representative for the south Texas border region." },
  ],
  "va-07": [
    { name: "Eugene Vindman", party: "D", isIncumbent: true, bio: "Army veteran and attorney, elected in 2024 for the northern Virginia district." },
  ],

  // ── Toss-Up ─────────────────────────────────────────────────────────
  "az-01": [
    // OPEN — David Schweikert not seeking re-election
  ],
  "az-06": [
    { name: "Juan Ciscomani", party: "R", isIncumbent: true, bio: "Representative for southern Arizona since 2023, former Ducey advisor." },
  ],
  "ca-22": [
    { name: "David Valadao", party: "R", isIncumbent: true, bio: "Central Valley dairy farmer, serving in Congress since 2013 (with a gap)." },
  ],
  "ca-48": [
    { name: "Darrell Issa", party: "R", isIncumbent: true, bio: "Veteran congressman, former House Oversight Committee chair." },
  ],
  "co-08": [
    { name: "Gabe Evans", party: "R", isIncumbent: true, bio: "Army helicopter pilot and former state legislator, elected in 2024." },
  ],
  "ia-01": [
    { name: "Mariannette Miller-Meeks", party: "R", isIncumbent: true, bio: "Ophthalmologist and Army veteran, representing southeast Iowa since 2021." },
  ],
  "ia-03": [
    { name: "Zach Nunn", party: "R", isIncumbent: true, bio: "Air Force veteran and former state legislator, serving since 2023." },
  ],
  "mi-07": [
    { name: "Tom Barrett", party: "R", isIncumbent: true, bio: "Army helicopter pilot and former state senator, elected in 2024." },
  ],
  "nj-07": [
    { name: "Tom Kean Jr.", party: "R", isIncumbent: true, bio: "Former NJ Senate minority leader, representing central New Jersey since 2023." },
  ],
  "ny-17": [
    { name: "Mike Lawler", party: "R", isIncumbent: true, bio: "Representative for the lower Hudson Valley since 2023." },
  ],
  "oh-01": [
    { name: "Greg Landsman", party: "D", isIncumbent: true, bio: "Former Cincinnati city councilmember, serving since 2023." },
  ],
  "oh-09": [
    { name: "Marcy Kaptur", party: "D", isIncumbent: true, bio: "Longest-serving woman in House history, representing northern Ohio since 1983." },
  ],
  "pa-07": [
    { name: "Ryan Mackenzie", party: "R", isIncumbent: true, bio: "Former Pennsylvania state representative from the Lehigh Valley, elected in 2024." },
  ],
  "pa-10": [
    { name: "Scott Perry", party: "R", isIncumbent: true, bio: "Army veteran and Freedom Caucus member, representing south-central PA since 2013." },
  ],
  "tx-34": [
    { name: "Vicente Gonzalez", party: "D", isIncumbent: true, bio: "Attorney representing the Rio Grande Valley since 2017." },
  ],
  "va-02": [
    { name: "Jen Kiggans", party: "R", isIncumbent: true, bio: "Navy helicopter pilot and nurse practitioner, representing coastal Virginia since 2023." },
  ],
  "wa-03": [
    { name: "Marie Gluesenkamp Perez", party: "D", isIncumbent: true, bio: "Auto shop owner representing southwest Washington since 2023." },
  ],
  "wi-03": [
    { name: "Derrick Van Orden", party: "R", isIncumbent: true, bio: "Retired Navy SEAL, representing western Wisconsin since 2023." },
  ],

  // ── Lean R ──────────────────────────────────────────────────────────
  "mi-10": [
    // OPEN — John James not seeking re-election
  ],
  "nc-01": [
    { name: "Donald Davis", party: "D", isIncumbent: true, bio: "Former state senator from eastern North Carolina, elected in 2024." },
  ],
  "pa-08": [
    { name: "Rob Bresnahan", party: "R", isIncumbent: true, bio: "Business owner from northeastern Pennsylvania, elected in 2024." },
  ],
  "va-01": [
    { name: "Rob Wittman", party: "R", isIncumbent: true, bio: "Representative for eastern Virginia since 2007." },
  ],

  // ── Likely R ────────────────────────────────────────────────────────
  "ak-al": [
    { name: "Nick Begich III", party: "R", isIncumbent: true, bio: "Businessman from a prominent Alaska political family, elected in 2024." },
  ],
  "az-02": [
    { name: "Eli Crane", party: "R", isIncumbent: true, bio: "Navy SEAL veteran and business owner, serving since 2023." },
  ],
  "co-03": [
    { name: "Jeff Hurd", party: "R", isIncumbent: true, bio: "Western Slope attorney, elected in 2024 for the sprawling rural Colorado district." },
  ],
  "co-05": [
    { name: "Jeff Crank", party: "R", isIncumbent: true, bio: "Conservative radio host from Colorado Springs, elected in 2024." },
  ],
  "fl-07": [
    { name: "Cory Mills", party: "R", isIncumbent: true, bio: "Army combat veteran and defense contractor, serving since 2023." },
  ],
  "fl-13": [
    { name: "Anna Paulina Luna", party: "R", isIncumbent: true, bio: "Air Force veteran representing the St. Petersburg area since 2023." },
  ],
  "ia-02": [
    // OPEN — Ashley Hinson not seeking re-election
  ],
  "me-02": [
    // OPEN — Jared Golden not seeking re-election
  ],
  "mi-04": [
    { name: "Bill Huizenga", party: "R", isIncumbent: true, bio: "Representative for western Michigan since 2011." },
  ],
  "mt-01": [
    { name: "Ryan Zinke", party: "R", isIncumbent: true, bio: "Former Interior Secretary and Navy SEAL, representing western Montana." },
  ],
  "nc-11": [
    { name: "Chuck Edwards", party: "R", isIncumbent: true, bio: "Former state senator representing western North Carolina since 2023." },
  ],
  "pa-01": [
    { name: "Brian Fitzpatrick", party: "R", isIncumbent: true, bio: "Former FBI agent, representing suburban Philadelphia's Bucks County since 2017." },
  ],
  "tn-05": [
    { name: "Andy Ogles", party: "R", isIncumbent: true, bio: "Former Maury County mayor, representing the Nashville area since 2023." },
  ],
  "tx-15": [
    { name: "Monica De La Cruz", party: "R", isIncumbent: true, bio: "Insurance agency owner representing the south Texas border region since 2023." },
  ],
  "tx-35": [
    // OPEN — Greg Casar not seeking re-election
  ],
  "wi-01": [
    { name: "Bryan Steil", party: "R", isIncumbent: true, bio: "Former Ryanʼs aide, representing southeast Wisconsin since 2019." },
  ],
};

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
