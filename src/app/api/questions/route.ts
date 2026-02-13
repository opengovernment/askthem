import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { POLICY_AREAS } from "@/lib/types";

async function getOrCreateAnonUser() {
  const cookieStore = await cookies();
  let userId = cookieStore.get("anon_user_id")?.value;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  const anonId = randomUUID().slice(0, 8);
  const user = await prisma.user.create({
    data: {
      email: `anon-${anonId}@demo.askthem.local`,
      name: `Anonymous ${anonId}`,
    },
  });

  cookieStore.set("anon_user_id", user.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return user;
}

// Basic content safety check — returns a rejection reason or null if OK.
// TODO: Replace with AI-powered moderation (e.g. Claude API) in production.
function moderateContent(text: string): string | null {
  if (text.length < 10) return "Question is too short (minimum 10 characters).";
  if (text.length > 500) return "Question is too long (maximum 500 characters).";

  // Block obvious profanity / slurs (very basic list — use a real filter in production)
  const blocked = /\b(fuck|shit|damn|bitch|ass(?:hole)?|cunt|dick|bastard)\b/i;
  if (blocked.test(text)) {
    return "Your question contains language that violates our community guidelines. Please rephrase.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { officialId, text, tags } = body as {
    officialId?: string;
    text?: string;
    tags?: string[];
  };

  // Validate required fields
  if (!officialId || typeof officialId !== "string") {
    return NextResponse.json({ error: "officialId is required" }, { status: 400 });
  }
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > 3) {
    return NextResponse.json({ error: "1-3 policy area tags are required" }, { status: 400 });
  }

  // Validate tags are real policy areas
  const validTags = tags.every((t) => (POLICY_AREAS as readonly string[]).includes(t));
  if (!validTags) {
    return NextResponse.json({ error: "Invalid policy area tag" }, { status: 400 });
  }

  // Validate official exists
  const official = await prisma.official.findUnique({ where: { id: officialId } });
  if (!official) {
    return NextResponse.json({ error: "Official not found" }, { status: 404 });
  }

  // Content moderation
  const rejection = moderateContent(text.trim());
  if (rejection) {
    return NextResponse.json({ error: rejection }, { status: 422 });
  }

  const user = await getOrCreateAnonUser();

  // Build district tag from official info
  const districtTag = official.district
    ? `${official.state}-${official.district}`
    : `${official.state}-${official.chamber}`;

  const question = await prisma.question.create({
    data: {
      text: text.trim(),
      authorId: user.id,
      officialId,
      districtTag,
      status: "pending_review",
      categoryTags: {
        create: tags.map((tag) => ({ tag })),
      },
    },
    include: {
      categoryTags: true,
      official: true,
      author: true,
    },
  });

  return NextResponse.json({ id: question.id, status: question.status }, { status: 201 });
}
