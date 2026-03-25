import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AddressForm } from "@/components/AddressForm";
import Link from "next/link";

export default async function AddressPage() {
  const session = await auth();
  const user = session?.user;

  if (user?.isAddressVerified) {
    redirect("/");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-7 w-7 text-indigo-600"
            >
              <path
                fillRule="evenodd"
                d="M10 2a6 6 0 00-6 6c0 1.887.87 3.568 2.23 4.664C4.297 13.857 3 15.981 3 18.5a.75.75 0 001.5 0c0-2.09 1.106-3.926 2.763-4.952A5.97 5.97 0 0010 14a5.97 5.97 0 002.737-.952C14.394 14.074 15.5 15.91 15.5 18a.75.75 0 001.5 0c0-2.519-1.297-4.643-3.23-5.836A6.965 6.965 0 0016 8a6 6 0 00-6-6zm-3.5 6a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Sign In to Get Started</h1>
          <p className="mb-6 text-gray-600">
            Create an account or sign in to find your elected officials and start asking questions.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block rounded-full bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return <AddressForm userName={user.name} />;
}
