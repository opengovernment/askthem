import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { action, applicationId, groupId, reviewNote } = body as {
    action?: string;
    applicationId?: string;
    groupId?: string;
    reviewNote?: string;
  };

  if (action === "approve" || action === "reject") {
    if (!applicationId || typeof applicationId !== "string") {
      return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
    }

    const application = await prisma.groupApplication.findUnique({
      where: { id: applicationId },
      include: { group: true },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    if (application.status !== "pending") {
      return NextResponse.json({ error: "Application has already been reviewed" }, { status: 422 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupApplication.update({
        where: { id: applicationId },
        data: {
          status: action === "approve" ? "approved" : "rejected",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote?.trim() || null,
        },
      });

      if (action === "approve") {
        await tx.group.update({
          where: { id: application.groupId },
          data: { isVerified: true },
        });
      }
    });

    return NextResponse.json({ status: action === "approve" ? "approved" : "rejected" });
  }

  if (action === "toggle_comms") {
    if (!groupId || typeof groupId !== "string") {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    if (!group.isVerified) {
      return NextResponse.json({ error: "Group must be verified first" }, { status: 422 });
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: { commsOptInEnabled: !group.commsOptInEnabled },
    });

    return NextResponse.json({ commsOptInEnabled: updated.commsOptInEnabled });
  }

  return NextResponse.json({ error: "Invalid action. Must be: approve, reject, or toggle_comms" }, { status: 400 });
}
