import Link from "next/link";

export const metadata = {
  title: "Comment Policy – AskThem",
};

export default function CommentPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to home
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">Comment Policy</h1>

        <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This is a placeholder. The full comment policy is being drafted.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Strict Moderation</h2>
          <p>
            AskThem is a strictly moderated platform. All questions and comments are reviewed by
            moderators before they are published. Content that does not meet our standards will be
            declined or removed.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Prohibited Content</h2>
          <p>The following are not permitted on AskThem:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Hate speech</strong> — content that attacks, demeans, or incites violence
              against individuals or groups based on race, ethnicity, religion, gender, sexual
              orientation, disability, or other protected characteristics.
            </li>
            <li>
              <strong>Personal questions</strong> — questions about an official&rsquo;s personal
              life, family, health, or other private matters unrelated to their public duties.
            </li>
            <li>
              <strong>Harassment and threats</strong> — direct or implied threats, doxxing, or
              targeted harassment of any individual.
            </li>
            <li>
              <strong>Misinformation</strong> — demonstrably false claims presented as fact.
            </li>
            <li>
              <strong>Spam and self-promotion</strong> — commercial solicitations, repeated
              identical submissions, or off-topic promotional content.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">Enforcement</h2>
          <p>
            Violations may result in content removal, account suspension, or permanent banning at
            the discretion of AskThem moderators. Repeated violations will result in escalating
            consequences.
          </p>
        </div>
      </div>
    </div>
  );
}
