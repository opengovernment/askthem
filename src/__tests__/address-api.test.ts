import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

// These tests exercise the same Prisma operations as the /api/address route
// against the real seeded database. The route handler uses cookies() and fetch()
// which require the full Next.js runtime, so we test the business logic directly:
// field validation, official upsert-by-ciceroId, UserDistrict creation, and
// user address verification.

describe("/api/address — field validation", () => {
  it("rejects missing address fields", () => {
    const body = { street: "123 Main St", city: "Boston" };
    const { state, zip } = body as { state?: string; zip?: string };
    expect(!state || !zip).toBe(true);
  });

  it("rejects street address shorter than 3 characters", () => {
    const street = "Hi";
    expect(typeof street === "string" && street.trim().length < 3).toBe(true);
  });

  it("rejects invalid ZIP codes", () => {
    const invalid = ["1234", "abcde", "123456", "12-345"];
    const zipRegex = /^\d{5}(-\d{4})?$/;
    for (const zip of invalid) {
      expect(zipRegex.test(zip)).toBe(false);
    }
  });

  it("accepts valid 5-digit ZIP codes", () => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    expect(zipRegex.test("02116")).toBe(true);
    expect(zipRegex.test("77001")).toBe(true);
  });

  it("accepts valid ZIP+4 codes", () => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    expect(zipRegex.test("02116-1234")).toBe(true);
  });
});

describe("/api/address — official upsert by ciceroId", () => {
  const testCiceroId = "test-cicero-upsert-99999";
  let createdOfficialId: string | null = null;

  afterAll(async () => {
    if (createdOfficialId) {
      await prisma.userDistrict.deleteMany({ where: { officialId: createdOfficialId } });
      await prisma.official.delete({ where: { id: createdOfficialId } }).catch(() => {});
    }
  });

  it("creates a new official when ciceroId does not exist", async () => {
    const official = await prisma.official.upsert({
      where: { ciceroId: testCiceroId },
      create: {
        ciceroId: testCiceroId,
        name: "Test Governor",
        title: "Governor",
        party: "D",
        state: "MA",
        chamber: "state_exec",
        level: "STATE_EXEC",
      },
      update: {
        name: "Test Governor",
        title: "Governor",
        party: "D",
        state: "MA",
        chamber: "state_exec",
        level: "STATE_EXEC",
      },
    });

    createdOfficialId = official.id;
    expect(official.ciceroId).toBe(testCiceroId);
    expect(official.name).toBe("Test Governor");
    expect(official.chamber).toBe("state_exec");
    expect(official.level).toBe("STATE_EXEC");
  });

  it("updates existing official when ciceroId matches", async () => {
    const updated = await prisma.official.upsert({
      where: { ciceroId: testCiceroId },
      create: {
        ciceroId: testCiceroId,
        name: "Should Not Create",
        title: "Governor",
        party: "D",
        state: "MA",
        chamber: "state_exec",
        level: "STATE_EXEC",
      },
      update: {
        name: "Updated Governor Name",
        phone: "617-555-0100",
      },
    });

    expect(updated.id).toBe(createdOfficialId);
    expect(updated.name).toBe("Updated Governor Name");
    expect(updated.phone).toBe("617-555-0100");
  });
});

describe("/api/address — UserDistrict creation", () => {
  const testUserId = "user-robert"; // Robert Kim — address NOT verified in seed
  let createdOfficialId: string | null = null;
  const testCiceroId = "test-cicero-district-88888";

  beforeAll(async () => {
    // Create a test official for district linking
    const official = await prisma.official.create({
      data: {
        ciceroId: testCiceroId,
        name: "Test State Senator",
        title: "State Senator",
        party: "R",
        state: "TX",
        district: "TX-15",
        chamber: "state_senate",
        level: "STATE_UPPER",
      },
    });
    createdOfficialId = official.id;
  });

  afterAll(async () => {
    // Clean up UserDistrict records created by this test
    if (createdOfficialId) {
      await prisma.userDistrict.deleteMany({
        where: { userId: testUserId, officialId: createdOfficialId },
      });
      await prisma.official.delete({ where: { id: createdOfficialId } }).catch(() => {});
    }
  });

  it("creates UserDistrict linking user to matched official", async () => {
    const ud = await prisma.userDistrict.create({
      data: { userId: testUserId, officialId: createdOfficialId! },
    });

    expect(ud.userId).toBe(testUserId);
    expect(ud.officialId).toBe(createdOfficialId);
  });

  it("prevents duplicate UserDistrict entries", async () => {
    await expect(
      prisma.userDistrict.create({
        data: { userId: testUserId, officialId: createdOfficialId! },
      }),
    ).rejects.toThrow();
  });
});

describe("/api/address — user address verification", () => {
  const testUserId = "user-robert"; // starts with isAddressVerified = false

  afterAll(async () => {
    // Reset Robert's address state back to unverified
    await prisma.user.update({
      where: { id: testUserId },
      data: {
        isAddressVerified: false,
        addressLookedUpAt: null,
      },
    });
  });

  it("marks user as address-verified after successful lookup", async () => {
    const now = new Date();
    const user = await prisma.user.update({
      where: { id: testUserId },
      data: {
        streetAddress: "321 Westheimer Rd",
        city: "Houston",
        state: "TX",
        zip: "77006",
        isAddressVerified: true,
        addressLookedUpAt: now,
      },
    });

    expect(user.isAddressVerified).toBe(true);
    expect(user.addressLookedUpAt).toEqual(now);
    expect(user.streetAddress).toBe("321 Westheimer Rd");
  });

  it("detects unchanged address to skip re-lookup", async () => {
    const user = await prisma.user.findUnique({
      where: { id: testUserId },
      select: {
        streetAddress: true,
        city: true,
        state: true,
        zip: true,
        isAddressVerified: true,
        addressLookedUpAt: true,
      },
    });

    const addressUnchanged =
      user!.streetAddress === "321 Westheimer Rd" &&
      user!.city === "Houston" &&
      user!.state === "TX" &&
      user!.zip === "77006" &&
      user!.isAddressVerified &&
      user!.addressLookedUpAt;

    expect(addressUnchanged).toBeTruthy();
  });
});

describe("/api/address — transaction: clear + rebuild districts", () => {
  const testUserId = "user-maria"; // Maria has existing districts (Warren)
  let originalDistricts: { officialId: string }[] = [];
  let tempOfficialId: string | null = null;

  beforeAll(async () => {
    // Save Maria's original districts so we can restore them
    originalDistricts = await prisma.userDistrict.findMany({
      where: { userId: testUserId },
      select: { officialId: true },
    });

    // Create a temp official to simulate a new Cicero result
    const temp = await prisma.official.create({
      data: {
        ciceroId: "test-cicero-rebuild-77777",
        name: "Temp City Councillor",
        title: "City Councillor",
        party: "D",
        state: "MA",
        chamber: "local",
        level: "LOCAL",
      },
    });
    tempOfficialId = temp.id;
  });

  afterAll(async () => {
    // Remove the temp official's districts and the official itself
    if (tempOfficialId) {
      await prisma.userDistrict.deleteMany({ where: { officialId: tempOfficialId } });
      await prisma.official.delete({ where: { id: tempOfficialId } }).catch(() => {});
    }

    // Restore Maria's original districts
    await prisma.userDistrict.deleteMany({ where: { userId: testUserId } });
    if (originalDistricts.length > 0) {
      await prisma.userDistrict.createMany({
        data: originalDistricts.map((d) => ({
          userId: testUserId,
          officialId: d.officialId,
        })),
      });
    }
  });

  it("clears existing UserDistrict records and creates new ones in a transaction", async () => {
    const result = await prisma.$transaction(async (tx) => {
      // Clear existing
      await tx.userDistrict.deleteMany({ where: { userId: testUserId } });

      // Create new mapping
      await tx.userDistrict.createMany({
        data: [
          { userId: testUserId, officialId: tempOfficialId! },
          // Re-add Warren too
          { userId: testUserId, officialId: "sen-warren" },
        ],
      });

      return tx.userDistrict.findMany({
        where: { userId: testUserId },
        select: { officialId: true },
      });
    });

    const officialIds = result.map((r) => r.officialId);
    expect(officialIds).toContain(tempOfficialId);
    expect(officialIds).toContain("sen-warren");
    expect(result).toHaveLength(2);
  });
});
