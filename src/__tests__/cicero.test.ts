import { describe, it, expect } from "vitest";
import {
  normalizeParty,
  mapChamber,
  buildDistrictLabel,
  extractTwitter,
  normalizeOfficial,
} from "@/lib/cicero";
import type { CiceroOfficial } from "@/lib/cicero";

describe("normalizeParty", () => {
  it("abbreviates Democratic", () => {
    expect(normalizeParty("Democratic")).toBe("D");
  });

  it("abbreviates Republican", () => {
    expect(normalizeParty("Republican")).toBe("R");
  });

  it("abbreviates Independent", () => {
    expect(normalizeParty("Independent")).toBe("I");
  });

  it("passes through short abbreviations", () => {
    expect(normalizeParty("D")).toBe("D");
    expect(normalizeParty("R")).toBe("R");
  });

  it("returns Unknown for empty string", () => {
    expect(normalizeParty("")).toBe("Unknown");
  });
});

describe("mapChamber", () => {
  it("maps NATIONAL_UPPER to senate", () => {
    expect(mapChamber("NATIONAL_UPPER")).toBe("senate");
  });

  it("maps NATIONAL_LOWER to house", () => {
    expect(mapChamber("NATIONAL_LOWER")).toBe("house");
  });

  it("maps STATE_EXEC to state_exec", () => {
    expect(mapChamber("STATE_EXEC")).toBe("state_exec");
  });

  it("maps STATE_UPPER to state_senate", () => {
    expect(mapChamber("STATE_UPPER")).toBe("state_senate");
  });

  it("maps STATE_LOWER to state_house", () => {
    expect(mapChamber("STATE_LOWER")).toBe("state_house");
  });

  it("maps LOCAL to local", () => {
    expect(mapChamber("LOCAL")).toBe("local");
  });

  it("maps LOCAL_EXEC to local", () => {
    expect(mapChamber("LOCAL_EXEC")).toBe("local");
  });

  it("defaults unknown types to local", () => {
    expect(mapChamber("UNKNOWN_TYPE")).toBe("local");
  });
});

describe("extractTwitter", () => {
  it("extracts handle from twitter.com URL", () => {
    expect(extractTwitter(["https://twitter.com/SenWarren"])).toBe("@SenWarren");
  });

  it("extracts handle from x.com URL", () => {
    expect(extractTwitter(["https://x.com/RepAOC"])).toBe("@RepAOC");
  });

  it("returns null when no twitter URL present", () => {
    expect(extractTwitter(["https://warren.senate.gov"])).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(extractTwitter([])).toBeNull();
  });

  it("preserves existing @ prefix", () => {
    expect(extractTwitter(["https://twitter.com/@SenWarren"])).toBe("@SenWarren");
  });
});

describe("buildDistrictLabel", () => {
  function makeOfficial(districtType: string, state: string, label: string): CiceroOfficial {
    return {
      sk: 1,
      first_name: "Test",
      last_name: "Official",
      party: "Democratic",
      email_addresses: [],
      urls: [],
      addresses: [],
      office: {
        title: "Senator",
        district: {
          district_type: districtType,
          label,
          district_id: 1,
          state,
          sk: 1,
        },
        chamber: { type: "UPPER" },
      },
    };
  }

  it("returns null for NATIONAL_UPPER (senators have no district)", () => {
    expect(buildDistrictLabel(makeOfficial("NATIONAL_UPPER", "MA", ""))).toBeNull();
  });

  it("returns null for STATE_EXEC (governors have no district)", () => {
    expect(buildDistrictLabel(makeOfficial("STATE_EXEC", "MA", ""))).toBeNull();
  });

  it("extracts district number for NATIONAL_LOWER", () => {
    expect(
      buildDistrictLabel(makeOfficial("NATIONAL_LOWER", "NY", "Congressional District 14")),
    ).toBe("NY-14");
  });

  it("extracts district number for STATE_LOWER", () => {
    expect(
      buildDistrictLabel(makeOfficial("STATE_LOWER", "PA", "State House District 42")),
    ).toBe("PA-42");
  });

  it("falls back to label if no number found", () => {
    expect(
      buildDistrictLabel(makeOfficial("LOCAL", "", "At-Large")),
    ).toBe("At-Large");
  });
});

describe("normalizeOfficial", () => {
  const sampleOfficial: CiceroOfficial = {
    sk: 12345,
    first_name: "Elizabeth",
    last_name: "Warren",
    party: "Democratic",
    photo_origin_url: "https://example.com/photo.jpg",
    email_addresses: ["senator@warren.senate.gov"],
    urls: [
      "https://www.warren.senate.gov",
      "https://twitter.com/SenWarren",
    ],
    addresses: [{ phone_1: "202-555-0100" }],
    office: {
      title: "U.S. Senator",
      district: {
        district_type: "NATIONAL_UPPER",
        label: "Massachusetts",
        district_id: 100,
        state: "MA",
        sk: 200,
      },
      chamber: { type: "UPPER" },
    },
  };

  it("normalizes a senator correctly", () => {
    const result = normalizeOfficial(sampleOfficial);

    expect(result.ciceroId).toBe("12345");
    expect(result.name).toBe("Elizabeth Warren");
    expect(result.title).toBe("U.S. Senator");
    expect(result.party).toBe("D");
    expect(result.state).toBe("MA");
    expect(result.district).toBeNull(); // senators don't have districts
    expect(result.chamber).toBe("senate");
    expect(result.level).toBe("NATIONAL_UPPER");
    expect(result.photoUrl).toBe("https://example.com/photo.jpg");
    expect(result.email).toBe("senator@warren.senate.gov");
    expect(result.phone).toBe("202-555-0100");
    expect(result.website).toBe("https://www.warren.senate.gov");
    expect(result.twitter).toBe("@SenWarren");
  });

  it("normalizes a representative correctly", () => {
    const rep: CiceroOfficial = {
      ...sampleOfficial,
      sk: 67890,
      first_name: "Alexandria",
      last_name: "Ocasio-Cortez",
      office: {
        title: "U.S. Representative",
        district: {
          district_type: "NATIONAL_LOWER",
          label: "Congressional District 14",
          district_id: 200,
          state: "NY",
          sk: 300,
        },
        chamber: { type: "LOWER" },
      },
    };

    const result = normalizeOfficial(rep);
    expect(result.chamber).toBe("house");
    expect(result.district).toBe("NY-14");
    expect(result.state).toBe("NY");
  });

  it("handles missing optional fields", () => {
    const minimal: CiceroOfficial = {
      sk: 99999,
      first_name: "John",
      last_name: "Doe",
      party: "",
      email_addresses: [],
      urls: [],
      addresses: [],
      office: {
        title: "Council Member",
        district: {
          district_type: "LOCAL",
          label: "District 5",
          district_id: 5,
          sk: 500,
        },
        chamber: { type: "LOWER" },
      },
    };

    const result = normalizeOfficial(minimal);
    expect(result.party).toBe("Unknown");
    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.website).toBeNull();
    expect(result.twitter).toBeNull();
    expect(result.photoUrl).toBeNull();
    expect(result.state).toBe("");
    expect(result.chamber).toBe("local");
  });
});
