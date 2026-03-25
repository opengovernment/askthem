import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, websiteUrl, applicantEmail, contactName, organizationType, statement } =
    body as {
      name?: string;
      description?: string;
      websiteUrl?: string;
      applicantEmail?: string;
      contactName?: string;
      organizationType?: string;
      statement?: string;
    };

  // Validate required fields
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Group name is required (min 2 characters)" }, { status: 400 });
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return NextResponse.json({ error: "Description is required (min 10 characters)" }, { status: 400 });
  }
  if (!websiteUrl || typeof websiteUrl !== "string") {
    return NextResponse.json({ error: "Website URL is required" }, { status: 400 });
  }
  if (!applicantEmail || typeof applicantEmail !== "string") {
    return NextResponse.json({ error: "Applicant email is required" }, { status: 400 });
  }
  if (!contactName || typeof contactName !== "string" || contactName.trim().length < 2) {
    return NextResponse.json({ error: "Contact name is required" }, { status: 400 });
  }
  const validOrgTypes = ["advocacy", "think_tank", "nonprofit", "other"];
  if (!organizationType || !validOrgTypes.includes(organizationType)) {
    return NextResponse.json({ error: "Organization type must be one of: " + validOrgTypes.join(", ") }, { status: 400 });
  }
  if (!statement || typeof statement !== "string" || statement.trim().length < 20) {
    return NextResponse.json({ error: "Statement is required (min 20 characters)" }, { status: 400 });
  }

  // Parse domain from websiteUrl
  let websiteDomain: string;
  try {
    const url = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`);
    websiteDomain = url.hostname.replace(/^www\./, "");
  } catch {
    return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
  }

  // Verify that applicant email domain matches the website domain
  const emailDomain = applicantEmail.split("@")[1]?.toLowerCase();
  if (!emailDomain || emailDomain !== websiteDomain.toLowerCase()) {
    return NextResponse.json(
      { error: `Your application email must be from the same domain as your website (${websiteDomain}). You entered an email from "${emailDomain}".` },
      { status: 422 },
    );
  }

  // Generate slug from name
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check for existing group with same slug
  const existing = await prisma.group.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A group with a similar name already exists. Please choose a different name." },
      { status: 409 },
    );
  }

  // Create the group (unverified) and the application in one transaction
  const result = await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim(),
        websiteDomain,
        websiteUrl: websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`,
        adminUserId: user.id,
      },
    });

    const application = await tx.groupApplication.create({
      data: {
        groupId: group.id,
        applicantEmail: applicantEmail.toLowerCase().trim(),
        contactName: contactName.trim(),
        organizationType,
        statement: statement.trim(),
      },
    });

    return { group, application };
  });

  return NextResponse.json(
    { groupId: result.group.id, applicationId: result.application.id, slug: result.group.slug },
    { status: 201 },
  );
}
