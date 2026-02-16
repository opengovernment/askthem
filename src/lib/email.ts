/**
 * Transactional email client (Mailgun).
 *
 * Handles immediate, programmatic notifications:
 *   - Question submitted confirmation (to author)
 *   - Question signed confirmation (to signer)
 *   - Question delivered to official (to all signers)
 *   - Official answered (to all signers)
 *
 * Campaign/broadcast emails are handled by Action Network, not here.
 *
 * Docs: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/tag/Messages/
 */

const MAILGUN_API_BASE = "https://api.mailgun.net/v3";

interface MailgunConfig {
  apiKey: string;
  domain: string;
  from: string;
}

function getConfig(): MailgunConfig | null {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM ?? `AskThem <noreply@${domain}>`;

  if (!apiKey || !domain) {
    return null;
  }

  return { apiKey, domain, from };
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<string | null> {
  const config = getConfig();
  if (!config) {
    console.warn("[Email] Mailgun not configured, skipping send");
    return null;
  }

  const form = new URLSearchParams();
  form.append("from", config.from);
  form.append("to", to);
  form.append("subject", subject);
  form.append("html", html);

  try {
    const res = await fetch(`${MAILGUN_API_BASE}/${config.domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`,
      },
      body: form,
    });

    if (!res.ok) {
      console.error(`[Email] Mailgun send failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = (await res.json()) as { id?: string };
    return data.id ?? null;
  } catch (err) {
    console.error("[Email] send failed:", err);
    return null;
  }
}

// ─── Email templates ──────────────────────────────────────────────────

export type EmailType =
  | "question_submitted"
  | "question_signed"
  | "question_delivered"
  | "question_answered"
  | "group_endorsement";

interface QuestionContext {
  questionId: string;
  questionText: string;
  officialName: string;
  officialTitle: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://askthem.io";

function questionUrl(questionId: string): string {
  return `${BASE_URL}/questions/${questionId}`;
}

/**
 * Notify the author that their question was submitted and is under review.
 */
export async function sendQuestionSubmitted(
  to: string,
  ctx: QuestionContext,
): Promise<string | null> {
  const subject = `Your question to ${ctx.officialName} was submitted`;
  const html = `
    <h2>Your question is under review</h2>
    <p>Thanks for submitting your question to <strong>${ctx.officialName}</strong> (${ctx.officialTitle}):</p>
    <blockquote style="border-left:3px solid #4f46e5;padding-left:12px;color:#374151;">
      ${escapeHtml(ctx.questionText)}
    </blockquote>
    <p>Our moderation team will review it shortly. Once published, other constituents
    can sign it to show support.</p>
    <p><a href="${questionUrl(ctx.questionId)}">View your question</a></p>
  `;
  return sendEmail(to, subject, html);
}

/**
 * Confirm to a signer that they signed a question.
 */
export async function sendQuestionSigned(
  to: string,
  ctx: QuestionContext,
): Promise<string | null> {
  const subject = `You signed a question to ${ctx.officialName}`;
  const html = `
    <h2>Thanks for signing!</h2>
    <p>You signed this question to <strong>${ctx.officialName}</strong> (${ctx.officialTitle}):</p>
    <blockquote style="border-left:3px solid #4f46e5;padding-left:12px;color:#374151;">
      ${escapeHtml(ctx.questionText)}
    </blockquote>
    <p>We'll notify you when it's delivered and when the official responds.</p>
    <p><a href="${questionUrl(ctx.questionId)}">View the question</a></p>
  `;
  return sendEmail(to, subject, html);
}

/**
 * Notify all signers that the question was delivered to the official.
 */
export async function sendQuestionDelivered(
  to: string,
  ctx: QuestionContext & { signatureCount: number },
): Promise<string | null> {
  const subject = `Your question was delivered to ${ctx.officialName}`;
  const html = `
    <h2>Question delivered!</h2>
    <p>A question you signed — with <strong>${ctx.signatureCount} constituent signatures</strong> — has been
    delivered to <strong>${ctx.officialName}</strong> (${ctx.officialTitle}):</p>
    <blockquote style="border-left:3px solid #4f46e5;padding-left:12px;color:#374151;">
      ${escapeHtml(ctx.questionText)}
    </blockquote>
    <p>We'll notify you when the official responds.</p>
    <p><a href="${questionUrl(ctx.questionId)}">View the question</a></p>
  `;
  return sendEmail(to, subject, html);
}

/**
 * Notify all signers that the official answered.
 */
export async function sendQuestionAnswered(
  to: string,
  ctx: QuestionContext & { answerPreview: string },
): Promise<string | null> {
  const subject = `${ctx.officialName} answered your question!`;
  const html = `
    <h2>${escapeHtml(ctx.officialName)} responded</h2>
    <p>The question you signed has been answered:</p>
    <blockquote style="border-left:3px solid #4f46e5;padding-left:12px;color:#374151;">
      ${escapeHtml(ctx.questionText)}
    </blockquote>
    <p><strong>Response preview:</strong></p>
    <p style="color:#1f2937;">${escapeHtml(ctx.answerPreview)}</p>
    <p><a href="${questionUrl(ctx.questionId)}">Read the full response</a></p>
  `;
  return sendEmail(to, subject, html);
}

/**
 * Notify opted-in users that a group they follow endorsed a question.
 */
export async function sendGroupEndorsementNotification(
  to: string,
  ctx: QuestionContext & { groupName: string },
): Promise<string | null> {
  const subject = `${ctx.groupName} endorsed a question to ${ctx.officialName}`;
  const html = `
    <h2>${escapeHtml(ctx.groupName)} endorsed a question</h2>
    <p><strong>${escapeHtml(ctx.groupName)}</strong> thinks this question to
    <strong>${escapeHtml(ctx.officialName)}</strong> (${escapeHtml(ctx.officialTitle)}) is important:</p>
    <blockquote style="border-left:3px solid #4f46e5;padding-left:12px;color:#374151;">
      ${escapeHtml(ctx.questionText)}
    </blockquote>
    <p>Add your signature to help get it delivered:</p>
    <p><a href="${questionUrl(ctx.questionId)}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:600;">Sign this question</a></p>
    <p style="color:#6b7280;font-size:12px;margin-top:24px;">
      You received this because you opted in to communications from ${escapeHtml(ctx.groupName)}.
    </p>
  `;
  return sendEmail(to, subject, html);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
