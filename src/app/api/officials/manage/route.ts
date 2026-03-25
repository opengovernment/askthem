import { NextRequest, NextResponse } from "next/server";
import { requireModerator } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const { applicationId, action, officialId, reviewNote } = await req.json();

  if (!applicationId || typeof applicationId !== "string") {
    return NextResponse.json({ error: "Application ID is required." }, { status: 400 });
  }

  const application = await prisma.responderApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (application.status !== "pending") {
    return NextResponse.json({ error: "This application has already been reviewed." }, { status: 400 });
  }

  if (action === "approve") {
    if (!officialId || typeof officialId !== "string") {
      return NextResponse.json(
        { error: "Please select the matching official to approve this application." },
        { status: 400 },
      );
    }

    // Verify the official exists
    const official = await prisma.official.findUnique({ where: { id: officialId } });
    if (!official) {
      return NextResponse.json({ error: "Selected official not found." }, { status: 404 });
    }

    // Approve application and mark official as verified responder
    await prisma.$transaction([
      prisma.responderApplication.update({
        where: { id: applicationId },
        data: {
          status: "approved",
          officialId,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote?.trim() || null,
        },
      }),
      prisma.official.update({
        where: { id: officialId },
        data: {
          isVerifiedResponder: true,
          verifiedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ ok: true, action: "approved" });
  }

  if (action === "reject") {
    await prisma.responderApplication.update({
      where: { id: applicationId },
      data: {
        status: "rejected",
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true, action: "rejected" });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
