import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware that:
 * 1. Gates the entire site behind a simple password (SITE_PASSWORD env var)
 * 2. Protects /moderate routes behind auth
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Site-wide password gate ---
  const sitePassword = process.env.SITE_PASSWORD;
  if (sitePassword) {
    const authCookie = req.cookies.get("site-auth")?.value;
    if (authCookie !== sitePassword) {
      // Allow the public preview homepage, static assets, and Auth.js routes through
      if (
        pathname === "/" ||
        pathname.startsWith("/api/auth") ||
        /\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|css|js)$/.test(pathname)
      ) {
        return NextResponse.next();
      }
      // If this is the password form submission, check the password
      if (req.method === "POST" && pathname === "/api/site-auth") {
        // Handled by the API route
        return NextResponse.next();
      }
      // Show the password page
      return new NextResponse(passwordPage(), {
        status: 401,
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  // --- Moderator auth gate ---
  if (pathname.startsWith("/moderate")) {
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function passwordPage(): string {
  return `<!DOCTYPE html>
<html><head><title>Password Required</title>
<style>
  body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
  form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
  input { display: block; margin: 1rem auto; padding: 0.5rem 1rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; }
  button { padding: 0.5rem 2rem; font-size: 1rem; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
</style></head>
<body><form method="POST" action="/api/site-auth">
  <h2>Password Required</h2>
  <input type="password" name="password" placeholder="Enter password" autofocus />
  <button type="submit">Enter</button>
</form></body></html>`;
}
