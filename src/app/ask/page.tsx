import { auth } from "@/auth";
import { AskForm } from "@/components/AskForm";
import Link from "next/link";

export default async function AskPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Sign In to Ask a Question</h1>
          <p className="mb-6 text-gray-600">
            Create an account or sign in to submit questions to your elected officials.
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

  if (!user.isAddressVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Complete Your Registration</h1>
          <p className="mb-6 text-gray-600">
            Before you can ask a question, we need your address to match you with your elected
            representatives.
          </p>
          <Link
            href="/address"
            className="inline-block rounded-full bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Enter Your Address
          </Link>
        </div>
      </div>
    );
  }

  return <AskForm />;
}
