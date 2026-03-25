import { NextRequest, NextResponse } from "next/server";
import { requireModerator } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ officials: [] });
  }

  const officials = await prisma.official.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      title: true,
      state: true,
      party: true,
    },
    orderBy: { name: "asc" },
    take: 10,
  });

  return NextResponse.json({ officials });
}
