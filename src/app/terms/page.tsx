import Link from "next/link";

export const metadata = {
  title: "Terms of Service – AskThem",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to home
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms of Service</h1>

        <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This is a placeholder. Full legal terms are being drafted.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">User-Posted Content</h2>
          <p>
            AskThem is a moderated platform. All questions, comments, and other content posted by
            users are subject to review by AskThem site moderators. Moderators reserve the right to
            edit, remove, or decline to publish any user-posted content at their sole discretion.
          </p>
          <p>
            By submitting content to AskThem, you grant AskThem a non-exclusive, royalty-free license
            to display, distribute, and promote your content in connection with the platform and its
            mission.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account. You agree to provide
            accurate information during registration, including a valid home address for
            representative matching purposes.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Acceptable Use</h2>
          <p>
            You agree not to use AskThem for any unlawful purpose or in violation of our Comment
            Policy. Accounts that violate these terms may be suspended or permanently banned.
          </p>
        </div>
      </div>
    </div>
  );
}
