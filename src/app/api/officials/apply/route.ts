import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { officialName, officialTitle, contactName, contactEmail, websiteUrl } = body;

  // Validate required fields
  if (!officialName || typeof officialName !== "string" || officialName.trim().length < 2) {
    return NextResponse.json({ error: "Official name is required." }, { status: 400 });
  }
  if (!officialTitle || typeof officialTitle !== "string" || officialTitle.trim().length < 2) {
    return NextResponse.json({ error: "Official title/position is required." }, { status: 400 });
  }
  if (!contactName || typeof contactName !== "string" || contactName.trim().length < 2) {
    return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
  }
  if (!contactEmail || typeof contactEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
    return NextResponse.json({ error: "A valid contact email is required." }, { status: 400 });
  }
  if (!websiteUrl || typeof websiteUrl !== "string") {
    return NextResponse.json({ error: "Official website URL is required." }, { status: 400 });
  }

  // Basic URL validation
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(websiteUrl.trim().startsWith("http") ? websiteUrl.trim() : `https://${websiteUrl.trim()}`);
  } catch {
    return NextResponse.json({ error: "Please enter a valid website URL." }, { status: 400 });
  }

  // Check for duplicate pending applications from same email
  const existing = await prisma.responderApplication.findFirst({
    where: {
      contactEmail: contactEmail.trim().toLowerCase(),
      status: "pending",
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An application from this email is already pending review." },
      { status: 409 },
    );
  }

  const application = await prisma.responderApplication.create({
    data: {
      officialName: officialName.trim(),
      officialTitle: officialTitle.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      websiteUrl: parsedUrl.toString(),
    },
  });

  return NextResponse.json({ id: application.id });
}
