import { getPopularQuestions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const questions = await getPopularQuestions(20);

  const items = questions
    .map((q) => {
      const pubDate = new Date(q.createdAt).toUTCString();
      const tags = q.categoryTags.map((ct) => `<category>${escapeXml(ct.tag)}</category>`).join("\n        ");
      const status = q.status === "answered" ? "[ANSWERED] " : "";

      return `    <item>
      <title>${escapeXml(status + q.text)}</title>
      <link>/questions/${q.id}</link>
      <guid isPermaLink="false">${q.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(`Question for ${q.official.name} (${q.official.title}). ${q.upvoteCount} upvotes.`)}</description>
      <author>${escapeXml(q.author.name ?? "Anonymous")}</author>
      ${tags}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AskThem - Latest Questions</title>
    <description>Questions from constituents to their elected officials</description>
    <link>/</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
