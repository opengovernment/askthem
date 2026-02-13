import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight middleware that protects /moderate routes.
 * Only checks if a session cookie exists — role verification
 * happens server-side in the page component (which has DB access).
 *
 * We avoid importing auth() here because it pulls in Prisma,
 * which uses Node.js APIs incompatible with Edge Runtime.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/moderate")) {
    // Auth.js stores session in this cookie (database strategy)
    const sessionToken =
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/moderate/:path*"],
};
