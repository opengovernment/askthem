import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { checkOfficialConduct } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/moderation/check
 * Real-time Official Conduct moderation check for question text.
 * Called from the AskForm as the user composes their question.
 */
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in required" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { text } = body as { text?: string };

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json(
      { error: "Question text must be at least 10 characters" },
      { status: 400 },
    );
  }

  const moderationResult = await checkOfficialConduct(text.trim());

  // Log the moderation check for moderator auditing
  prisma.moderationLog
    .create({
      data: {
        userId: user.id,
        questionText: text.trim(),
        result: moderationResult.result,
        reason: moderationResult.reason,
        suggestion: moderationResult.suggestion,
      },
    })
    .catch((err: unknown) => {
      console.error("Failed to log moderation check:", err);
    });

  return NextResponse.json({
    result: moderationResult.result,
    reason: moderationResult.reason,
    suggestion: moderationResult.suggestion,
  });
}
