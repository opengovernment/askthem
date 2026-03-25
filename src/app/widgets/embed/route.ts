import { NextRequest } from "next/server";
import { getQuestionById, getOfficialById, getQuestionsByOfficialId } from "@/lib/queries";

/**
 * GET /widgets/embed?url=/questions/abc123
 * Returns a self-contained HTML page suitable for iframe embedding.
 * Supports question pages (/questions/:id) and official pages (/officials/:id).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawUrl = searchParams.get("url") ?? "";

  // Parse the path from full URLs or relative paths
  let path: string;
  try {
    const parsed = new URL(rawUrl, "https://placeholder.local");
    path = parsed.pathname;
  } catch {
    return htmlResponse(errorCard("Invalid URL"));
  }

  const questionMatch = path.match(/^\/questions\/([^/]+)$/);
  const officialMatch = path.match(/^\/officials\/([^/]+)$/);

  if (questionMatch) {
    return renderQuestionWidget(questionMatch[1]);
  }
  if (officialMatch) {
    return renderOfficialWidget(officialMatch[1]);
  }

  return htmlResponse(
    errorCard("Unsupported URL. Paste a question or official page URL."),
  );
}

// ── Question widget ────────────────────────────────────────────────

async function renderQuestionWidget(id: string) {
  const question = await getQuestionById(id);
  if (!question) return htmlResponse(errorCard("Question not found"));

  const statusMap: Record<string, { label: string; bg: string; fg: string }> = {
    published: { label: "Published", bg: "#DBEAFE", fg: "#1E40AF" },
    delivered: { label: "Delivered", bg: "#EDE9FE", fg: "#6D28D9" },
    answered: { label: "Answered", bg: "#D1FAE5", fg: "#065F46" },
  };
  const status = statusMap[question.status] ?? statusMap.published;

  const date = new Date(question.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const maxLen = 120;
  const text =
    question.text.length > maxLen
      ? question.text.slice(0, maxLen) + "\u2026"
      : question.text;

  const asker = question.group?.isVerified
    ? question.group.name
    : question.author?.name ?? "Anonymous";

  const body = `
    <div style="display:flex;flex-direction:column;height:100%;padding:16px 20px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="background:${status.bg};color:${status.fg};font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;">${status.label}</span>
        <span style="color:#6B7280;font-size:11px;">to ${escHtml(question.official.name)}</span>
      </div>
      <div style="flex:1;min-height:0;">
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111827;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${escHtml(text)}</p>
        <p style="margin:0;font-size:12px;color:#6B7280;">Asked by ${escHtml(asker)} &middot; ${date}</p>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid #F3F4F6;">
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A95A6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          <span style="font-size:14px;font-weight:700;color:#4A95A6;">${question.upvoteCount}</span>
          <span style="font-size:11px;color:#9CA3AF;">signature${question.upvoteCount !== 1 ? "s" : ""}</span>
        </div>
        <a href="/questions/${escAttr(question.id)}" target="_blank" rel="noopener" style="font-size:12px;font-weight:500;color:#4A95A6;text-decoration:none;">View on AskThem &rarr;</a>
      </div>
    </div>`;

  return htmlResponse(body);
}

// ── Official widget ────────────────────────────────────────────────

async function renderOfficialWidget(id: string) {
  const official = await getOfficialById(id);
  if (!official) return htmlResponse(errorCard("Official not found"));

  const questions = await getQuestionsByOfficialId(official.id);
  const answeredCount = questions.filter((q) => q.status === "answered").length;
  const responseRate =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  const initials = official.name
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  const party = official.party === "D" ? "Democrat" : "Republican";
  const district = official.district ? `, ${official.district}` : "";

  const body = `
    <div style="display:flex;flex-direction:column;height:100%;padding:16px 20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <div style="width:44px;height:44px;border-radius:50%;background:#E0F3F7;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#4A95A6;flex-shrink:0;">${escHtml(initials)}</div>
        <div>
          <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${escHtml(official.name)}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#6B7280;">${escHtml(official.title)} &middot; ${escHtml(party)} &middot; ${escHtml(official.state)}${escHtml(district)}</p>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex:1;">
        <div style="flex:1;background:#F9FAFB;border-radius:8px;padding:10px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">${questions.length}</p>
          <p style="margin:2px 0 0;font-size:10px;color:#6B7280;">Questions</p>
        </div>
        <div style="flex:1;background:#F9FAFB;border-radius:8px;padding:10px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#065F46;">${answeredCount}</p>
          <p style="margin:2px 0 0;font-size:10px;color:#6B7280;">Answered</p>
        </div>
        <div style="flex:1;background:#F9FAFB;border-radius:8px;padding:10px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#4A95A6;">${responseRate}%</p>
          <p style="margin:2px 0 0;font-size:10px;color:#6B7280;">Response Rate</p>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:12px;padding-top:10px;border-top:1px solid #F3F4F6;">
        <a href="/officials/${escAttr(official.id)}" target="_blank" rel="noopener" style="font-size:12px;font-weight:500;color:#4A95A6;text-decoration:none;">View on AskThem &rarr;</a>
      </div>
    </div>`;

  return htmlResponse(body);
}

// ── Helpers ────────────────────────────────────────────────────────

function errorCard(message: string) {
  return `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:20px;">
      <p style="color:#6B7280;font-size:14px;text-align:center;">${escHtml(message)}</p>
    </div>`;
}

function htmlResponse(body: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#fff;}
a:hover{text-decoration:underline!important;}
</style>
</head>
<body>${body}</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

function escHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escAttr(str: string) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
