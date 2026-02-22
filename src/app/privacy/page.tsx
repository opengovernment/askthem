import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – AskThem",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to home
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This is a placeholder. A full privacy policy is being drafted.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Information We Collect</h2>
          <p>
            When you register, we collect your name, email address, and home street address. Your
            address is used solely to match you with your elected officials at every level of
            government and is never shared with third parties for marketing purposes.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">How We Use Your Information</h2>
          <p>
            Your information is used to operate the AskThem platform: matching you with
            representatives, displaying your questions (with your name if your profile is public),
            and sending transactional notifications about questions you submit or sign.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share limited data with service
            providers (email delivery, address lookup) strictly as needed to operate the platform.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Your Rights</h2>
          <p>
            You may request deletion of your account and personal data at any time by contacting us.
          </p>
        </div>
      </div>
    </div>
  );
}
