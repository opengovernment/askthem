import { NextRequest, NextResponse } from "next/server";

/**
 * Diagnostic endpoint that shows the OAuth callback URLs Auth.js will use.
 * Helps verify that AUTH_URL is configured correctly on Vercel.
 *
 * GET /api/auth/debug
 */
export async function GET(req: NextRequest) {
  const detectedOrigin = req.nextUrl.origin;
  const authUrl = process.env.AUTH_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const baseUrl = authUrl || (vercelUrl ? `https://${vercelUrl}` : detectedOrigin);

  return NextResponse.json({
    detectedOrigin,
    AUTH_URL: authUrl ?? "(not set)",
    VERCEL_URL: vercelUrl ?? "(not set)",
    resolvedBaseUrl: baseUrl,
    callbackUrls: {
      google: `${baseUrl}/api/auth/callback/google`,
      facebook: `${baseUrl}/api/auth/callback/facebook`,
    },
    hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    hasFacebookCredentials: !!(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
    hasAuthSecret: !!process.env.AUTH_SECRET,
  });
}
