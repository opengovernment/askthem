import Image from "next/image";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <Link href="/">
            <Image src="/logo.svg" alt="AskThem" width={135} height={30} priority />
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-7 w-7 text-indigo-600"
            >
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
          </div>

          <h1 className="mb-2 text-xl font-bold text-gray-900">Check your email</h1>
          <p className="mb-4 text-gray-600">
            A sign-in link has been sent to your email address. Click the link in the email to sign in.
          </p>
          <p className="text-sm text-gray-500">
            If you don&apos;t see the email, check your spam folder. The link expires in 24 hours.
          </p>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
