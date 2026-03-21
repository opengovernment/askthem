/**
 * Cicero API client for elected official lookup by address.
 *
 * Cicero (by Melissa) matches a street address to legislative districts
 * and returns elected officials at every level: federal, state, and local.
 *
 * One credit is consumed per address lookup. We store `addressLookedUpAt`
 * on the User model to avoid repeat lookups for the same address.
 *
 * Docs: https://app.cicerodata.com/docs/
 */

const CICERO_API_BASE = "https://app.cicerodata.com/v3.1";

function getApiKey(): string | undefined {
  return process.env.CICERO_API_KEY;
}

export function isEnabled(): boolean {
  return !!getApiKey();
}

// ─── Cicero API response types ─────────────────────────────────────

interface CiceroAddress {
  phone_1?: string;
  phone_2?: string;
  fax_1?: string;
}

interface CiceroDistrict {
  district_type: string; // NATIONAL_UPPER, NATIONAL_LOWER, STATE_EXEC, STATE_UPPER, STATE_LOWER, LOCAL, LOCAL_EXEC, COUNTY
  label: string;
  district_id: number;
  state?: string;
  city?: string;
  sk: number;
}

interface CiceroChamber {
  type: string; // UPPER, LOWER, EXEC
}

interface CiceroOffice {
  title: string;
  district: CiceroDistrict;
  chamber: CiceroChamber;
}

interface CiceroOfficial {
  sk: number;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  party: string;
  photo_origin_url?: string;
  email_addresses: string[];
  urls: string[];
  addresses: CiceroAddress[];
  office: CiceroOffice;
  identifiers?: { identifier_type: string; identifier_value: string }[];
  notes?: string[];
}

interface CiceroCandidate {
  match_addr: string;
  wkid: number;
  x: number;
  y: number;
  officials: CiceroOfficial[];
  districts: unknown[];
}

interface CiceroResponse {
  response: {
    errors: string[];
    messages: string[];
    results: {
      candidates: CiceroCandidate[];
    };
  };
}

// ─── Normalized output types ────────────────────────────────────────

export interface NormalizedOfficial {
  ciceroId: string; // Cicero sk as string for stable keying
  name: string;
  title: string;
  party: string;
  state: string;
  district: string | null;
  chamber: string;
  level: string; // raw district_type for richer filtering
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  twitter: string | null;
}

// Map Cicero district_type → our chamber value
const CHAMBER_MAP: Record<string, string> = {
  NATIONAL_UPPER: "senate",
  NATIONAL_LOWER: "house",
  STATE_EXEC: "state_exec",
  STATE_UPPER: "state_senate",
  STATE_LOWER: "state_house",
  LOCAL: "local",
  LOCAL_EXEC: "local",
  COUNTY: "local",
};

function mapChamber(districtType: string): string {
  return CHAMBER_MAP[districtType] ?? "local";
}

function extractTwitter(urls: string[]): string | null {
  const twitterUrl = urls.find(
    (u) => u.includes("twitter.com/") || u.includes("x.com/"),
  );
  if (!twitterUrl) return null;
  const match = twitterUrl.match(/(?:twitter\.com|x\.com)\/(@?\w+)/);
  return match ? (match[1].startsWith("@") ? match[1] : `@${match[1]}`) : null;
}

function buildDistrictLabel(official: CiceroOfficial): string | null {
  const dist = official.office.district;
  const districtType = dist.district_type;

  // Senators don't have numbered districts
  if (districtType === "NATIONAL_UPPER" || districtType === "STATE_EXEC") {
    return null;
  }

  // Use the label from Cicero (e.g. "Congressional District 14")
  // We convert to our format: "NY-14", "TX-2", etc.
  const state = dist.state ?? "";
  const label = dist.label ?? "";

  // Try to extract a district number from the label
  const numberMatch = label.match(/(\d+)/);
  if (numberMatch && state) {
    return `${state}-${numberMatch[1]}`;
  }

  return label || null;
}

function normalizeParty(party: string): string {
  if (!party) return "Unknown";
  const lower = party.toLowerCase();
  if (lower.includes("democrat")) return "D";
  if (lower.includes("republican")) return "R";
  if (lower.includes("independent")) return "I";
  if (lower.includes("libertarian")) return "L";
  if (lower.includes("green")) return "G";
  // Already abbreviated
  if (party.length <= 3) return party;
  return party;
}

function normalizeOfficial(official: CiceroOfficial): NormalizedOfficial {
  const districtType = official.office.district.district_type;
  const state = official.office.district.state ?? "";
  const phone = official.addresses?.[0]?.phone_1 ?? null;
  const website = official.urls?.find(
    (u) => !u.includes("twitter.com") && !u.includes("x.com"),
  ) ?? null;

  return {
    ciceroId: String(official.sk),
    name: [official.first_name, official.last_name].filter(Boolean).join(" "),
    title: official.office.title,
    party: normalizeParty(official.party),
    state,
    district: buildDistrictLabel(official),
    chamber: mapChamber(districtType),
    level: districtType,
    photoUrl: official.photo_origin_url ?? null,
    email: official.email_addresses?.[0] ?? null,
    phone,
    website,
    twitter: extractTwitter(official.urls ?? []),
  };
}

// ─── Public API ─────────────────────────────────────────────────────

export async function lookupOfficialsByAddress(address: {
  street: string;
  city: string;
  state: string;
  zip: string;
}): Promise<NormalizedOfficial[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[Cicero] API key not configured, skipping lookup");
    return [];
  }

  const searchLoc = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;

  const params = new URLSearchParams({
    search_loc: searchLoc,
    key: apiKey,
    format: "json",
  });

  const url = `${CICERO_API_BASE}/official?${params.toString()}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Cicero] API error ${res.status}: ${text}`);
      throw new Error(`Cicero API returned ${res.status}`);
    }

    const data: CiceroResponse = await res.json();

    if (data.response.errors?.length > 0) {
      console.error("[Cicero] API errors:", data.response.errors);
      throw new Error(`Cicero API error: ${data.response.errors[0]}`);
    }

    const candidates = data.response.results?.candidates;
    if (!candidates || candidates.length === 0) {
      return [];
    }

    // Use the first (best-match) candidate
    const officials = candidates[0].officials ?? [];
    return officials.map(normalizeOfficial);
  } catch (err) {
    console.error("[Cicero] lookup failed:", err);
    throw err;
  }
}

// ─── Officials by Region API ────────────────────────────────────────

/**
 * Abbreviated official returned by the /officials_by_region endpoint.
 * Contains a subset of fields compared to the full /official response.
 */
interface CiceroRegionOfficial {
  sk: number;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  party: string;
  photo_origin_url?: string;
  email_addresses: string[];
  urls: string[];
  addresses: CiceroAddress[];
  office: CiceroOffice;
  identifiers?: { identifier_type: string; identifier_value: string }[];
  notes?: string[];
}

interface CiceroRegionResponse {
  response: {
    errors: string[];
    messages: string[];
    results: {
      officials: CiceroRegionOfficial[];
      count?: { total: number; max: number; offset: number };
    };
  };
}

export interface RegionQuery {
  district_type: string[];  // e.g. ["NATIONAL_UPPER", "STATE_LOWER"]
  country?: string;         // default "US"
  state: string;            // e.g. "NY"
  max?: number;             // pagination limit (default 100)
  offset?: number;          // pagination offset (default 0)
}

/**
 * Fetch a single page of officials by region from Cicero.
 * Returns the officials array and total count for pagination.
 */
async function fetchRegionPage(query: RegionQuery): Promise<{
  officials: NormalizedOfficial[];
  total: number;
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Cicero API key not configured");
  }

  const params = new URLSearchParams({
    country: query.country ?? "US",
    state: query.state,
    key: apiKey,
    format: "json",
    max: String(query.max ?? 100),
    offset: String(query.offset ?? 0),
  });

  // district_type can appear multiple times
  for (const dt of query.district_type) {
    params.append("district_type", dt);
  }

  const url = `${CICERO_API_BASE}/officials_by_region?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error(`[Cicero] officials_by_region error ${res.status}: ${text}`);
    throw new Error(`Cicero API returned ${res.status}`);
  }

  const data: CiceroRegionResponse = await res.json();

  if (data.response.errors?.length > 0) {
    console.error("[Cicero] officials_by_region errors:", data.response.errors);
    throw new Error(`Cicero API error: ${data.response.errors[0]}`);
  }

  const rawOfficials = data.response.results?.officials ?? [];
  const total = data.response.results?.count?.total ?? rawOfficials.length;

  // The region endpoint returns the same official shape — normalize it
  const normalized = rawOfficials.map((o) => normalizeOfficial(o as unknown as CiceroOfficial));

  return { officials: normalized, total };
}

/**
 * Fetch ALL officials for a region, handling pagination automatically.
 * Makes multiple API calls if needed (100 per page).
 *
 * Returns all normalized officials and a summary of API calls made.
 */
export async function lookupOfficialsByRegion(query: RegionQuery): Promise<{
  officials: NormalizedOfficial[];
  totalFromApi: number;
  apiCalls: number;
}> {
  const pageSize = query.max ?? 100;
  let offset = query.offset ?? 0;
  let allOfficials: NormalizedOfficial[] = [];
  let totalFromApi = 0;
  let apiCalls = 0;

  // Fetch first page
  const first = await fetchRegionPage({ ...query, max: pageSize, offset });
  apiCalls++;
  allOfficials = first.officials;
  totalFromApi = first.total;

  // Fetch remaining pages
  while (allOfficials.length < totalFromApi) {
    offset += pageSize;
    const page = await fetchRegionPage({ ...query, max: pageSize, offset });
    apiCalls++;
    allOfficials = allOfficials.concat(page.officials);

    // Safety: break if we get an empty page (avoid infinite loop)
    if (page.officials.length === 0) break;
  }

  return { officials: allOfficials, totalFromApi, apiCalls };
}

// Re-export for testing
export { normalizeParty, mapChamber, buildDistrictLabel, extractTwitter, normalizeOfficial };
export type { CiceroOfficial, CiceroResponse, CiceroRegionResponse, CiceroRegionOfficial };
