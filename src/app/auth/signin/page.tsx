import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image src="/logo.svg" alt="AskThem" width={135} height={30} priority />
          </Link>
          <p className="mt-2 text-gray-600">
            Sign in to ask questions, sign petitions, and hold your elected officials accountable.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {/* Email magic link sign-in */}
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email") as string;
              await signIn("nodemailer", { email, redirectTo: "/address" });
            }}
          >
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.gov"
              className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
              Sign in with email
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google OAuth sign-in */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/address" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Facebook OAuth sign-in */}
          <form
            action={async () => {
              "use server";
              await signIn("facebook", { redirectTo: "/address" });
            }}
          >
            <button
              type="submit"
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy.
            Your email will be shared with Action Network for civic engagement communications.
          </p>
        </div>
      </div>
    </div>
  );
}
