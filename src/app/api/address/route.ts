import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { lookupOfficialsByAddress, isEnabled } from "@/lib/cicero";
import { syncPersonToAN } from "@/lib/action-network";

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isEnabled()) {
    return NextResponse.json(
      { error: "Address lookup is not available. Please try again later." },
      { status: 503 },
    );
  }

  // Block new registrations in read-only mode (moderators and admins are exempt)
  if (!user.isAddressVerified && user.role !== "moderator" && user.role !== "admin") {
    const readOnlyRow = await prisma.siteSetting.findUnique({ where: { key: "readOnlyMode" } });
    if (readOnlyRow?.value === "true") {
      return NextResponse.json(
        { error: "New registrations are temporarily paused. The site is currently in read-only mode. Please check back later." },
        { status: 503 },
      );
    }
  }

  const body = await req.json();
  const { street, city, state, zip, name, policiesAccepted } = body;

  // Require policy acceptance for new registrations
  if (!user.isAddressVerified && !policiesAccepted) {
    return NextResponse.json(
      { error: "You must agree to the Terms of Service, Privacy Policy, and Comment Policy." },
      { status: 400 },
    );
  }

  // Validate required fields
  if (!street || !city || !state || !zip) {
    return NextResponse.json(
      { error: "All address fields are required (street, city, state, zip)." },
      { status: 400 },
    );
  }

  if (typeof street !== "string" || street.trim().length < 3) {
    return NextResponse.json({ error: "Please enter a valid street address." }, { status: 400 });
  }
  if (typeof zip !== "string" || !/^\d{5}(-\d{4})?$/.test(zip.trim())) {
    return NextResponse.json({ error: "Please enter a valid 5-digit ZIP code." }, { status: 400 });
  }

  // Skip Cicero call if address hasn't changed and was recently looked up
  const addressUnchanged =
    user.streetAddress === street.trim() &&
    user.city === city.trim() &&
    user.state === state &&
    user.zip === zip.trim() &&
    user.isAddressVerified &&
    user.addressLookedUpAt;

  if (addressUnchanged) {
    // Return existing officials without burning a credit
    const existingDistricts = await prisma.userDistrict.findMany({
      where: { userId: user.id },
      include: { official: true },
    });
    return NextResponse.json({
      officials: existingDistricts.map((ud) => ({
        id: ud.official.id,
        name: ud.official.name,
        title: ud.official.title,
        party: ud.official.party,
        state: ud.official.state,
        district: ud.official.district,
        chamber: ud.official.chamber,
        level: ud.official.level,
        photoUrl: ud.official.photoUrl,
      })),
      cached: true,
    });
  }

  // Call Cicero API
  let normalizedOfficials;
  try {
    normalizedOfficials = await lookupOfficialsByAddress({
      street: street.trim(),
      city: city.trim(),
      state,
      zip: zip.trim(),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not look up your address. Please verify it and try again." },
      { status: 502 },
    );
  }

  if (normalizedOfficials.length === 0) {
    return NextResponse.json(
      { error: "No elected officials found for this address. Please check your address and try again." },
      { status: 404 },
    );
  }

  // Diagnostic: warn if Cicero returned senators but no House representative.
  // This helps catch address-matching issues (e.g. ambiguous addresses that resolve
  // to a state but not a specific congressional district).
  const hasSenators = normalizedOfficials.some((o) => o.level === "NATIONAL_UPPER");
  const hasHouseRep = normalizedOfficials.some((o) => o.level === "NATIONAL_LOWER");
  if (hasSenators && !hasHouseRep) {
    console.warn(
      `[Address] Cicero returned ${normalizedOfficials.filter((o) => o.level === "NATIONAL_UPPER").length} senator(s) but no U.S. House representative for address: ${street.trim()}, ${city.trim()}, ${state} ${zip.trim()}. ` +
      `This may indicate the address could not be resolved to a specific congressional district.`,
    );
  }

  // Upsert officials and build UserDistrict mappings in a transaction
  const upsertedOfficials = await prisma.$transaction(async (tx) => {
    // 1. Upsert each official by ciceroId
    const officials = [];
    for (const o of normalizedOfficials) {
      const official = await tx.official.upsert({
        where: { ciceroId: o.ciceroId },
        create: {
          ciceroId: o.ciceroId,
          name: o.name,
          title: o.title,
          party: o.party,
          state: o.state,
          district: o.district,
          chamber: o.chamber,
          level: o.level,
          photoUrl: o.photoUrl,
          email: o.email,
          phone: o.phone,
          website: o.website,
          twitter: o.twitter,
        },
        update: {
          name: o.name,
          title: o.title,
          party: o.party,
          state: o.state,
          district: o.district,
          chamber: o.chamber,
          level: o.level,
          photoUrl: o.photoUrl,
          email: o.email,
          phone: o.phone,
          website: o.website,
          twitter: o.twitter,
        },
      });
      officials.push(official);
    }

    // 2. Clear existing UserDistrict records for this user
    await tx.userDistrict.deleteMany({ where: { userId: user.id } });

    // 3. Create new UserDistrict records
    await tx.userDistrict.createMany({
      data: officials.map((o) => ({
        userId: user.id,
        officialId: o.id,
      })),
    });

    // 4. Update user address + verification status (and name if provided by email sign-up)
    await tx.user.update({
      where: { id: user.id },
      data: {
        streetAddress: street.trim(),
        city: city.trim(),
        state,
        zip: zip.trim(),
        isAddressVerified: true,
        addressLookedUpAt: new Date(),
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(policiesAccepted && !user.policiesAcceptedAt ? { policiesAcceptedAt: new Date() } : {}),
      },
    });

    return officials;
  });

  // Sync full address to Action Network (fire-and-forget, don't block response)
  const effectiveName = (typeof name === "string" && name.trim()) ? name.trim() : user.name;
  if (user.email && effectiveName) {
    const houseRep = upsertedOfficials.find((o) => o.chamber === "house");
    const districtTag = houseRep?.state && houseRep?.district
      ? `${houseRep.state}-${houseRep.district}`
      : undefined;

    syncPersonToAN({
      email: user.email,
      name: effectiveName,
      street: street.trim(),
      city: city.trim(),
      state,
      zip: zip.trim(),
      districtTag,
    }).then((anId) => {
      if (anId) {
        prisma.user.update({
          where: { id: user.id },
          data: { actionNetworkId: anId },
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  return NextResponse.json({
    officials: upsertedOfficials.map((o) => ({
      id: o.id,
      name: o.name,
      title: o.title,
      party: o.party,
      state: o.state,
      district: o.district,
      chamber: o.chamber,
      level: o.level,
      photoUrl: o.photoUrl,
    })),
  });
}
