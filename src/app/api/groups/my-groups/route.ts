import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json([], { status: 200 });
  }

  const groups = await prisma.group.findMany({
    where: {
      adminUserId: user.id,
      isVerified: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(groups);
}
