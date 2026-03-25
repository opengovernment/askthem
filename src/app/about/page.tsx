import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - AskThem",
  description:
    "Learn how AskThem works: ask your elected officials questions, get verified answers, and hold representatives accountable.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">About AskThem</h1>
        <p className="mb-10 text-lg text-gray-600">
          A free platform that connects constituents with their elected officials
          through public Q&amp;A.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Free to sign up
            </h2>
            <p className="leading-relaxed text-gray-700">
              Creating an account on AskThem is completely free. Once you sign up
              you can browse questions and answers from officials across the
              country.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Find your elected officials
            </h2>
            <p className="leading-relaxed text-gray-700">
              Enter your street address to see who represents you at the
              federal, state, and local level. From there you can ask them a
              question directly or upvote questions submitted by other
              constituents.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Verified delivery
            </h2>
            <p className="leading-relaxed text-gray-700">
              Before a question is delivered to an official, we check the
              voter-registration status at your address using trusted
              third-party verification services. This ensures that officials
              hear from real, verified constituents.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Public answers for everyone
            </h2>
            <p className="leading-relaxed text-gray-700">
              When an elected official responds, their answer is shared publicly
              so every constituent can see it &mdash; not just the person who
              asked. Transparency is at the core of how AskThem works.
            </p>
          </section>

          {/* ── How to ask a great question ─────────────────────────── */}
          <section className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-6">
            <h2 className="mb-1 text-xl font-semibold text-gray-900">
              How to ask a question that gets answered
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-600">
              Public Q&amp;A platforms around the world &mdash; including
              Germany&rsquo;s{" "}
              <a href="https://www.abgeordnetenwatch.de" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">Abgeordnetenwatch</a>,
              the UK&rsquo;s{" "}
              <a href="https://www.theyworkforyou.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">TheyWorkForYou</a> and{" "}
              <a href="https://www.writetothem.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">WriteToThem</a>,
              Greece&rsquo;s{" "}
              <a href="https://vouliwatch.gr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">VouliWatch</a>, and
              Australia&rsquo;s{" "}
              <a href="https://theyvoteforyou.org.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">They Vote For You</a>{" "}
              &mdash; have found that focused, specific questions are far more
              likely to get a meaningful response. Here&rsquo;s what works.
            </p>

            <h3 className="mb-2 text-base font-semibold text-gray-800">
              Tie your question to something concrete
            </h3>
            <p className="mb-3 text-sm leading-relaxed text-gray-700">
              Officials respond best when a question is anchored to a specific
              legislative item, vote, meeting, or policy position rather than a
              broad topic. Try connecting your question to one of these:
            </p>
            <ul className="mb-5 space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-indigo-500">&#9679;</span>
                <span>
                  <strong className="text-gray-900">A bill or resolution</strong>{" "}
                  &mdash; &ldquo;How do you plan to vote on H.R.&nbsp;1234, the
                  Clean Water Standards Act?&rdquo;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-indigo-500">&#9679;</span>
                <span>
                  <strong className="text-gray-900">A recent vote</strong>{" "}
                  &mdash; &ldquo;You voted against the infrastructure funding
                  amendment on March&nbsp;12. What was your reasoning?&rdquo;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-indigo-500">&#9679;</span>
                <span>
                  <strong className="text-gray-900">A committee hearing or town hall agenda item</strong>{" "}
                  &mdash; &ldquo;At next week&rsquo;s Education Committee
                  hearing on school funding, will you ask about the impact on
                  rural districts?&rdquo;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-indigo-500">&#9679;</span>
                <span>
                  <strong className="text-gray-900">A measurable policy position</strong>{" "}
                  &mdash; &ldquo;Your campaign platform pledged to reduce
                  permitting wait times by 50%. What progress has been made so
                  far?&rdquo;
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-indigo-500">&#9679;</span>
                <span>
                  <strong className="text-gray-900">An issue-group or party stance</strong>{" "}
                  &mdash; &ldquo;The state teachers&rsquo; union has called for
                  smaller class sizes. Do you support their proposal, and what
                  steps would you take?&rdquo;
                </span>
              </li>
            </ul>

            <h3 className="mb-2 text-base font-semibold text-gray-800">
              Tips from global Q&amp;A platforms
            </h3>
            <ol className="mb-5 space-y-2 text-sm text-gray-700 [counter-reset:tips]">
              <li className="flex gap-2 [counter-increment:tips]">
                <span className="mt-0.5 shrink-0 font-semibold text-indigo-500 [content:counter(tips)]">1.</span>
                <span>
                  <strong className="text-gray-900">One question, one topic.</strong>{" "}
                  Keep it focused. Bundling multiple issues into one message
                  makes it easy for none of them to get a real answer.
                </span>
              </li>
              <li className="flex gap-2 [counter-increment:tips]">
                <span className="mt-0.5 shrink-0 font-semibold text-indigo-500">2.</span>
                <span>
                  <strong className="text-gray-900">Ask, don&rsquo;t lecture.</strong>{" "}
                  Germany&rsquo;s Abgeordnetenwatch &mdash; which has delivered
                  over 300,000 citizen questions with an 80%+ response rate
                  &mdash; rejects submissions that are statements rather than
                  genuine questions.
                </span>
              </li>
              <li className="flex gap-2 [counter-increment:tips]">
                <span className="mt-0.5 shrink-0 font-semibold text-indigo-500">3.</span>
                <span>
                  <strong className="text-gray-900">Include a personal story.</strong>{" "}
                  The UK&rsquo;s WriteToThem advises: explain how the issue
                  affects you, your family, or your community. One original
                  letter from a constituent is more powerful than a pile of
                  identical form letters.
                </span>
              </li>
              <li className="flex gap-2 [counter-increment:tips]">
                <span className="mt-0.5 shrink-0 font-semibold text-indigo-500">4.</span>
                <span>
                  <strong className="text-gray-900">State a clear ask.</strong>{" "}
                  Tell them what you want: vote a specific way, raise the issue
                  in committee, write to a department head, or support a
                  particular amendment.
                </span>
              </li>
              <li className="flex gap-2 [counter-increment:tips]">
                <span className="mt-0.5 shrink-0 font-semibold text-indigo-500">5.</span>
                <span>
                  <strong className="text-gray-900">Cite your sources.</strong>{" "}
                  If you reference a statistic or claim, link to the source.
                  This gives your question credibility and helps the official
                  research the issue.
                </span>
              </li>
              <li className="flex gap-2 [counter-increment:tips]">
                <span className="mt-0.5 shrink-0 font-semibold text-indigo-500">6.</span>
                <span>
                  <strong className="text-gray-900">Be brief and respectful.</strong>{" "}
                  Keep your question to a short paragraph. A courteous tone
                  makes officials far more likely to engage.
                </span>
              </li>
            </ol>

            <h3 className="mb-2 text-base font-semibold text-gray-800">
              Examples of effective questions
            </h3>
            <p className="mb-3 text-sm text-gray-600">
              These examples are inspired by real questions asked on citizen
              Q&amp;A platforms worldwide.
            </p>
            <div className="space-y-3">
              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="text-sm italic text-gray-800">
                  &ldquo;The city council voted last month to delay sidewalk
                  repairs on Elm Street for two more years. As someone who uses a
                  wheelchair and lives on that block, I need to know: will you
                  push for emergency ADA-compliance funding in the next budget
                  session?&rdquo;
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="font-medium text-emerald-600">Why it works:</span>{" "}
                  References a specific vote, includes a personal story, and
                  makes a clear ask tied to an upcoming budget decision.
                </p>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="text-sm italic text-gray-800">
                  &ldquo;S.B.&nbsp;567 would require energy companies to
                  disclose methane emissions quarterly. Your website says you
                  support environmental transparency. Will you co-sponsor this
                  bill?&rdquo;
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="font-medium text-emerald-600">Why it works:</span>{" "}
                  Cites a specific bill, ties it to the official&rsquo;s stated
                  position, and asks for a concrete commitment.
                </p>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="text-sm italic text-gray-800">
                  &ldquo;At last Tuesday&rsquo;s school board meeting, the
                  superintendent proposed cutting two bus routes that serve
                  low-income neighborhoods. What is your position on this
                  proposal, and will you request a public impact study before the
                  board votes?&rdquo;
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="font-medium text-emerald-600">Why it works:</span>{" "}
                  References a specific meeting and proposal, identifies who is
                  affected, and requests a specific procedural action.
                </p>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="text-sm italic text-gray-800">
                  &ldquo;The League of Conservation Voters gave our state
                  legislature a D+ rating on clean water protections. As our
                  district&rsquo;s representative on the Environment Committee,
                  what specific bills will you introduce or support this session
                  to improve that record?&rdquo;
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="font-medium text-emerald-600">Why it works:</span>{" "}
                  Cites an issue-group rating with a specific metric, addresses
                  the official&rsquo;s committee role, and asks for a concrete
                  legislative plan.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/auth/signin"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign up free
          </Link>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400"
          >
            Browse questions
          </Link>
        </div>
      </div>
    </div>
  );
}
