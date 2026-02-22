import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";

/**
 * POST /api/auth/gov-signin
 * Validates that the email ends with .gov, then triggers the Nodemailer magic link flow.
 * On account creation, the auth event handler will flag the user as isGovUser.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email as string)?.trim().toLowerCase();

  if (!email || !email.endsWith(".gov")) {
    return NextResponse.json(
      { error: "Only .gov email addresses are accepted." },
      { status: 400 },
    );
  }

  try {
    // Use redirect: false so we can return JSON instead of an automatic redirect
    await signIn("nodemailer", { email, redirect: false });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    // signIn with redirect:false may throw a NEXT_REDIRECT which is expected
    // when NextAuth issues a redirect for the verify-request page
    if (error instanceof Error && error.message?.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "Failed to send verification email. Please try again." },
      { status: 500 },
    );
  }
}
