import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

/**
 * PATCH /api/profile/visibility
 * Toggle the current user's public profile on or off.
 * Body: { isPublic: boolean }
 */
export async function PATCH(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  const { isPublic } = body as { isPublic?: boolean };

  if (typeof isPublic !== "boolean") {
    return NextResponse.json({ error: "isPublic must be a boolean" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isProfilePublic: isPublic },
    select: { isProfilePublic: true },
  });

  return NextResponse.json({ isProfilePublic: updated.isProfilePublic });
}
