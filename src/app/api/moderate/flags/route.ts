import { NextRequest, NextResponse } from "next/server";
import { requireModerator } from "@/lib/session";
import { dismissFlags } from "@/lib/queries";

export async function POST(req: NextRequest) {
  const user = await requireModerator();
  if (!user) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const { questionId, action } = await req.json();

  if (!questionId || typeof questionId !== "string") {
    return NextResponse.json({ error: "Question ID is required." }, { status: 400 });
  }

  if (action === "dismiss") {
    await dismissFlags(questionId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
