import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const FONT_REGULAR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf";
const FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf";
const FONT_ITALIC = "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf";

const INDIGO = "#4f46e5";
const DARK = "#1e293b";
const GRAY = "#475569";
const LIGHT_GRAY = "#94a3b8";
const ACCENT_BG = "#f1f5f9";

const MARGIN = 60;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const BOTTOM_LIMIT = PAGE_HEIGHT - 70;

const TABLE_DIR = path.resolve("public/ai-tables");
const OUT_PATH = path.resolve("public/AskThem-AI-Integration-Briefing.pdf");

// ─── Helpers ──────────────────────────────────────────────────────────

function checkSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > BOTTOM_LIMIT) {
    doc.addPage();
  }
}

function h1(doc: PDFKit.PDFDocument, text: string) {
  checkSpace(doc, 40);
  doc.y += 10;
  doc.font("Bold").fontSize(16).fillColor(DARK).text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  const lineY = doc.y + 1;
  doc.save().moveTo(MARGIN, lineY).lineTo(MARGIN + 55, lineY).lineWidth(2).strokeColor(INDIGO).stroke().restore();
  doc.y = lineY + 6;
}

function h2(doc: PDFKit.PDFDocument, text: string) {
  checkSpace(doc, 25);
  doc.y += 5;
  doc.font("Bold").fontSize(11).fillColor(INDIGO).text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.y += 3;
}

function h3(doc: PDFKit.PDFDocument, text: string) {
  checkSpace(doc, 20);
  doc.y += 4;
  doc.font("Bold").fontSize(9.5).fillColor(DARK).text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.y += 2;
}

function p(doc: PDFKit.PDFDocument, text: string) {
  checkSpace(doc, 15);
  doc.font("Regular").fontSize(9).fillColor(GRAY).text(text, MARGIN, doc.y, { width: CONTENT_WIDTH, lineGap: 1.8 });
  doc.y += 4;
}

function li(doc: PDFKit.PDFDocument, text: string) {
  checkSpace(doc, 14);
  doc.font("Regular").fontSize(9).fillColor(GRAY).text("\u2022  " + text, MARGIN + 8, doc.y, { width: CONTENT_WIDTH - 16, lineGap: 1.8 });
  doc.y += 2;
}

function bLi(doc: PDFKit.PDFDocument, bold: string, rest: string) {
  checkSpace(doc, 16);
  const fullText = bold + rest;
  doc.font("Regular").fontSize(9).fillColor(GRAY).text("\u2022  " + fullText, MARGIN + 8, doc.y, { width: CONTENT_WIDTH - 16, lineGap: 1.8 });
  doc.y += 2;
}

function code(doc: PDFKit.PDFDocument, text: string) {
  const boxX = MARGIN + 4;
  const textWidth = CONTENT_WIDTH - 24;
  const height = doc.font("Regular").fontSize(7.5).heightOfString(text, { width: textWidth }) + 10;
  checkSpace(doc, height + 6);
  const boxY = doc.y;
  doc.save().roundedRect(boxX, boxY, CONTENT_WIDTH - 8, height, 2).fill(ACCENT_BG).restore();
  doc.save().roundedRect(boxX, boxY, CONTENT_WIDTH - 8, height, 2).lineWidth(0.5).strokeColor("#e2e8f0").stroke().restore();
  doc.font("Regular").fontSize(7.5).fillColor("#334155").text(text, boxX + 8, boxY + 5, { width: textWidth, lineGap: 1 });
  doc.y = boxY + height + 4;
}

function img(doc: PDFKit.PDFDocument, filename: string) {
  const imgPath = path.join(TABLE_DIR, filename);
  if (!fs.existsSync(imgPath)) return;
  const imgW = CONTENT_WIDTH * 0.92;
  const imgH = imgW * 0.51;
  checkSpace(doc, imgH + 8);
  const startY = doc.y;
  doc.image(imgPath, MARGIN + (CONTENT_WIDTH - imgW) / 2, startY, { width: imgW });
  doc.y = startY + imgH + 5;
}

// ─── Build ────────────────────────────────────────────────────────────

function build() {
  const doc = new PDFDocument({
    size: "letter",
    margins: { top: 50, bottom: 50, left: MARGIN, right: MARGIN },
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: "AI Integration Briefing \u2014 AskThem",
      Author: "AskThem / PPF",
      Subject: "How AI systems can enhance civic engagement on the AskThem platform",
    },
  });

  doc.registerFont("Regular", FONT_REGULAR);
  doc.registerFont("Bold", FONT_BOLD);
  doc.registerFont("Italic", FONT_ITALIC);

  const stream = fs.createWriteStream(OUT_PATH);
  doc.pipe(stream);

  // ═══ COVER PAGE ═══════════════════════════════════════════════════

  doc.save().rect(0, 0, PAGE_WIDTH, 300).fill(INDIGO).restore();

  doc.font("Bold").fontSize(34).fillColor("white").text("AI Integration Briefing", MARGIN, 90, { width: CONTENT_WIDTH });
  doc.font("Regular").fontSize(15).fillColor("rgba(255,255,255,0.85)").text("How AI systems can enhance civic engagement\non the AskThem platform", MARGIN, 150, { width: CONTENT_WIDTH, lineGap: 3 });
  doc.font("Regular").fontSize(10).fillColor("rgba(255,255,255,0.65)").text("Prepared February 2026", MARGIN, 240);

  doc.y = 340;
  doc.font("Bold").fontSize(13).fillColor(DARK).text("AskThem by Participatory Politics Foundation", MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.y += 8;
  p(doc, "A platform for constituents to ask questions of their elected officials at every level of government \u2014 federal, state, and local \u2014 and for those questions to be publicly visible, signable, and deliverable.");

  doc.y += 12;
  doc.font("Bold").fontSize(11).fillColor(DARK).text("Contents", MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.y += 6;
  const toc = [
    "1.  Executive Summary",
    "2.  Question Moderation",
    "3.  Automated Question Delivery",
    "4.  Answer Monitoring & Posting",
    "5.  Alerting Question Signers",
    "6.  Constituent Sentiment Analysis",
    "7.  Accessibility & Translation",
    "8.  Additional AI Opportunities",
    "9.  Recommended Starting Point",
    "10. Appendix: Architecture Notes",
  ];
  for (const item of toc) {
    doc.font("Regular").fontSize(9.5).fillColor(GRAY).text(item, MARGIN + 10, doc.y, { width: CONTENT_WIDTH });
    doc.y += 2;
  }

  // ═══ 1. EXECUTIVE SUMMARY ═════════════════════════════════════════

  doc.addPage();
  h1(doc, "1. Executive Summary");

  p(doc, "AskThem connects constituents with their elected officials through a structured question-and-answer workflow. Users submit questions, the community signs (upvotes) them, moderators review and deliver them to officials, and answers are posted back to the platform. Every step in this pipeline can be enhanced with AI \u2014 not to replace human judgment, but to reduce friction, scale operations, and lower the barriers to civic participation.");

  p(doc, "This briefing covers five operational integrations that map directly to AskThem's existing workflow, a deep dive into accessibility and translation as a cross-cutting priority, and a survey of broader opportunities for AI in civic engagement platforms.");

  p(doc, "The recommended starting point is a single Claude API call at question submission time that handles moderation classification, policy-tag suggestion, duplicate detection, and sentiment scoring in one request. This one integration point delivers immediate value across multiple areas with minimal schema changes.");

  // ═══ 2. QUESTION MODERATION ═══════════════════════════════════════

  h1(doc, "2. Question Moderation");

  p(doc, "Currently, every submitted question enters a pending_review state and waits for a human moderator to approve or reject it via the /moderate dashboard. As question volume grows, this becomes the primary bottleneck in the pipeline.");

  h2(doc, "Recommended Tools");
  img(doc, "1-question-moderation.png");

  h2(doc, "How It Works");

  p(doc, "When a question is submitted via POST /api/questions, the system makes two parallel API calls before persisting the question:");

  bLi(doc, "Perspective API \u2014 ", "A free Google/Jigsaw service that returns toxicity, threat, insult, and spam probability scores (0\u20131). Questions scoring above configurable thresholds (e.g., toxicity > 0.85) are auto-rejected with a user-facing message. This is a fast, cheap first-pass filter.");

  bLi(doc, "Claude API \u2014 ", "A single structured-output call that returns a moderation decision (approve/flag/reject), suggested policy-area tags from the existing POLICY_AREAS constant (sourced from Congress.gov), a list of similar existing question IDs, and a sentiment classification. The prompt instructs the model to evaluate whether the submission is a genuine policy question directed at the official.");

  p(doc, "The response is stored as a JSON moderationResult field on the Question model. Questions that pass both checks are auto-published. Flagged questions go to the moderator dashboard with the AI's reasoning displayed, so moderators review edge cases rather than every submission.");

  h2(doc, "Duplicate Detection with Embeddings");

  p(doc, "For semantic duplicate detection, each question's text is embedded (via OpenAI, Voyage, or Cohere embedding APIs) into a vector stored in a pgvector column on the Question table. At submission time, a nearest-neighbor query finds questions for the same official with cosine similarity above a threshold (e.g., 0.88). Matches are surfaced to the user: \"A similar question has already been asked \u2014 would you like to sign it instead?\" This consolidates constituent support rather than fragmenting it across duplicates.");

  code(doc, `-- Example pgvector query for similar questions
SELECT id, text, 1 - (embedding <=> $1) AS similarity
FROM "Question"
WHERE "officialId" = $2
  AND status IN ('published', 'delivered')
  AND 1 - (embedding <=> $1) > 0.88
ORDER BY similarity DESC LIMIT 5;`);

  // ═══ 3. DELIVERY AUTOMATION ═══════════════════════════════════════

  h1(doc, "3. Automated Question Delivery");

  p(doc, "Delivery is currently manual: a moderator selects a question, chooses a channel (email, Twitter, mail), and marks it as delivered. The deliveredBy field stores the moderator's ID. AI can automate most of this workflow.");

  h2(doc, "Recommended Tools");
  img(doc, "2-delivery-automation.png");

  h2(doc, "Digest-Based Delivery");

  p(doc, "Rather than delivering questions one at a time, a scheduled job (Vercel Cron or similar) runs weekly to:");

  li(doc, "Query all published, undelivered questions grouped by official.");
  li(doc, "Use Claude to draft a digest email that presents the questions in order of constituent support (upvoteCount), with context about how many constituents signed each one and whether signers are verified constituents of the official's district (using the isConstituent flag on Upvote).");
  li(doc, "Route the digest through Mailgun (already integrated via the EmailEvent model) and update each question's deliveredAt, deliveredVia, and deliveredBy fields.");

  p(doc, "The Claude prompt can be tuned to produce professional, non-partisan language appropriate for official correspondence. A moderator approval step can optionally gate delivery for high-profile officials.");

  h2(doc, "Channel Selection");

  p(doc, "The Congress.gov API can enrich Official records with committee assignments, preferred contact methods, and office addresses. Combined with historical response rates per channel (trackable via the existing EmailEvent and Answer models), the system can recommend the delivery channel most likely to elicit a response for each official.");

  // ═══ 4. ANSWER MONITORING ═════════════════════════════════════════

  h1(doc, "4. Answer Monitoring & Posting");

  p(doc, "Officials rarely respond directly through civic platforms. They respond through press releases, social media, committee statements, floor speeches, and official websites. AI can bridge this gap by monitoring these channels and matching public statements to pending questions.");

  h2(doc, "Recommended Tools");
  img(doc, "3-answer-monitoring.png");

  h2(doc, "Matching Pipeline");

  p(doc, "A scheduled worker fetches new content from each official's known channels (the Official model already stores twitter handles and website URLs). Apify or Browserbase handle the scraping. Each piece of new content is compared against that official's delivered-but-unanswered questions using Claude with a structured prompt. High-confidence matches (relevance > 0.85) generate draft Answer records with the sourceUrl pointing to the original statement. A moderator reviews and publishes.");

  code(doc, `// Claude returns structured match results:
{
  "matches": [
    {
      "questionId": "q123",
      "relevance": 0.92,
      "excerptFromStatement": "...",
      "summary": "The official addressed this by..."
    }
  ]
}`);

  // ═══ 5. ALERTING SIGNERS ══════════════════════════════════════════

  h1(doc, "5. Alerting Question Signers");

  p(doc, "When an answer is posted, every user who signed (upvoted) the question should be notified. The current EmailEvent system tracks these notifications, but the emails are generic. AI can personalize them.");

  h2(doc, "Recommended Tools");
  img(doc, "4-alerting-signers.png");

  h2(doc, "Personalized Notifications");

  p(doc, "When an Answer is created, the system queries all Upvotes for that question. For each signer, Claude generates a 2\u20133 sentence personalized summary that:");

  li(doc, "References the original question text.");
  li(doc, "Summarizes the official's response in accessible language.");
  li(doc, "Notes whether the signer is a verified constituent (using the isConstituent flag), and if so, emphasizes their direct representational stake.");
  li(doc, "Suggests related questions they might want to sign or ask.");

  p(doc, "These summaries are batched through Claude (multiple signers per API call) and sent via the existing Mailgun integration. Resend is an alternative worth evaluating for its React Email SDK, which integrates cleanly with Next.js for richer HTML templates.");

  // ═══ 6. SENTIMENT ANALYSIS ════════════════════════════════════════

  h1(doc, "6. Constituent Sentiment Analysis");

  p(doc, "Across all questions and upvotes, AskThem accumulates a rich signal about what constituents care about and how they feel. AI can transform this from raw data into actionable civic intelligence.");

  h2(doc, "Recommended Tools");
  img(doc, "5-sentiment-analysis.png");

  h2(doc, "Implementation Approach");

  p(doc, "A batch job processes questions in chunks, calling Claude to classify each question's sentiment (concerned, frustrated, hopeful, neutral, urgent) and urgency level. Results are stored in a new QuestionSentiment table linked to the question.");

  p(doc, "For thematic clustering beyond the fixed Congress.gov policy tags, question texts are embedded and clustered using UMAP for dimensionality reduction and HDBSCAN for density-based clustering. This reveals emergent themes: \"water quality concerns in rural PA\" might cluster questions that span multiple policy tags. The @xenova/transformers package enables in-process embedding generation within Node.js.");

  p(doc, "Visualization is served through a new /dashboard/[state] route using Tremor (a React charting library built on D3) or Observable Plot. Public-facing dashboards show top issues by district, sentiment trends over time, comparison across officials, and emerging concern spikes.");

  // ═══ 7. ACCESSIBILITY & TRANSLATION ═══════════════════════════════

  doc.addPage();
  h1(doc, "7. Accessibility & Translation");

  p(doc, "Civic engagement platforms disproportionately serve English-speaking, digitally literate, college-educated users. AI-powered accessibility and translation features can fundamentally broaden who participates in democratic dialogue. This is not a nice-to-have \u2014 it is a core equity concern for any platform that claims to represent constituent voices.");

  h2(doc, "7.1 Multilingual Question Submission & Display");

  p(doc, "According to the U.S. Census Bureau, over 67 million Americans speak a language other than English at home. Spanish, Chinese, Tagalog, Vietnamese, and Arabic are the most common. AskThem should support question submission and browsing in these languages at minimum.");

  h3(doc, "Architecture");

  bLi(doc, "Submission-time translation: ", "When a user submits a question in a non-English language (detected via a lightweight classifier or explicit language selector), Claude translates it to English for storage and moderation. Both the original and translated versions are stored on the Question model (new fields: originalText, originalLanguage).");

  bLi(doc, "Display-time translation: ", "When a user browses questions or reads answers, content is translated on-demand into their preferred language. Translations are cached in a new QuestionTranslation table (keyed by questionId + language) to avoid repeated API calls.");

  bLi(doc, "Official answer translation: ", "When an answer is posted, it is automatically translated into the languages of all users who signed the question, so notification emails arrive in each signer's preferred language.");

  code(doc, `// Proposed schema additions
model QuestionTranslation {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(...)
  language   String   // ISO 639-1: "es", "zh", "tl", "vi", "ar"
  text       String   // translated question text
  createdAt  DateTime @default(now())
  @@unique([questionId, language])
}`);

  h3(doc, "Quality Considerations");
  p(doc, "Machine translation of civic content requires higher accuracy than casual text. Mistranslation of a policy question can change its meaning entirely. Mitigations include:");

  li(doc, "Using Claude (which demonstrates strong multilingual capability) rather than generic machine translation APIs.");
  li(doc, "Including civic-specific terminology glossaries in the translation prompt (e.g., ensuring \"filibuster\" or \"gerrymandering\" translate to contextually correct equivalents).");
  li(doc, "Displaying a visible indicator that content has been machine-translated, with the option to view the original.");
  li(doc, "Allowing bilingual community members to flag or suggest corrections to translations.");

  h2(doc, "7.2 Plain-Language Summaries");

  p(doc, "Policy questions and official answers often contain jargon, legal references, and legislative shorthand that exclude non-expert readers. AI can generate plain-language summaries at multiple reading levels.");

  p(doc, "When an answer is posted, Claude generates a plain-language summary (targeting a 6th-grade reading level) stored alongside the original. The UI offers a toggle: \"Show simplified version.\" The same approach works for questions that reference specific bills \u2014 an inline tooltip explains the referenced policy in accessible terms.");

  code(doc, `// Example prompt for plain-language summary
"Rewrite the following official's answer so that a high school
student could understand it. Keep the same meaning but replace
jargon with everyday language. If the answer references a specific
bill or law, briefly explain what that bill does."`);

  h2(doc, "7.3 Screen Reader & Assistive Technology Optimization");

  p(doc, "AskThem's Next.js frontend should follow WCAG 2.1 AA standards. AI can further enhance the experience for screen reader users:");

  li(doc, "Auto-generating descriptive alt text for official photos and any infographics or charts on the dashboard pages.");
  li(doc, "Providing audio summaries of question threads: \"This question about housing affordability was asked by Maria and signed by 342 people. Senator Warren's response was posted on February 1st.\"");
  li(doc, "Structuring AI-generated content (digests, summaries, notifications) with proper semantic HTML headings and ARIA landmarks.");

  h2(doc, "7.4 Voice-Based Interaction");

  p(doc, "For users with limited literacy or those who prefer voice interaction, AI enables:");

  li(doc, "Voice-to-text question submission via the Web Speech API (browser-native) with Claude post-processing to clean up transcription artifacts and structure the question appropriately.");
  li(doc, "Text-to-speech playback of questions and answers using browser TTS APIs or a service like ElevenLabs for higher-quality narration.");
  li(doc, "A future conversational interface where users describe their concern verbally and AI helps formulate it into a clear, actionable question directed at the right official.");

  h2(doc, "7.5 Cognitive Accessibility");

  p(doc, "Beyond visual and language accessibility, AI can assist users with cognitive disabilities:");

  li(doc, "Breaking long official responses into digestible sections with clear headings.");
  li(doc, "Providing visual progress indicators for multi-step processes (e.g., the question submission flow).");
  li(doc, "Offering contextual help: \"Not sure what to ask? Here are the top issues other constituents in your district are asking about.\"");

  // ═══ 8. ADDITIONAL AI OPPORTUNITIES ═══════════════════════════════

  doc.addPage();
  h1(doc, "8. Additional AI Opportunities");

  p(doc, "Beyond the core operational integrations and accessibility features, several broader applications of AI can deepen AskThem's impact as a civic engagement platform.");

  h2(doc, "Question Quality Coaching");
  p(doc, "AI can guide users as they draft questions \u2014 flagging vague asks, suggesting specificity, and linking to relevant pending legislation so questions are grounded in real policy. This raises the quality of dialogue and makes officials more likely to respond. The coaching runs client-side as the user types, with a lightweight Claude call on submission to provide final suggestions.");

  h2(doc, "Legislative Intelligence");
  p(doc, "AI can monitor Congress.gov, state legislature feeds, and committee calendars to surface proactive notifications: \"Your official just voted on a bill related to your question\" or \"A relevant bill was introduced today.\" This transforms AskThem from a one-shot Q&A tool into an ongoing civic awareness platform. Implementation uses scheduled workers that fetch RSS/API feeds from legislative data sources and run Claude matching against active questions.");

  h2(doc, "Meeting & Hearing Summarization");
  p(doc, "City council meetings, congressional hearings, and town halls generate hours of video content. AI can transcribe (via Whisper or AssemblyAI), summarize, and extract commitments made by officials \u2014 then match those commitments against questions on the platform. A notification like \"In last Tuesday's town hall, Rep. X addressed a question similar to yours\" closes the feedback loop.");

  h2(doc, "Accountability Tracking");
  p(doc, "AI can build longitudinal accountability profiles: did an official's voting record match what they told constituents on AskThem? By tracking answers against legislative actions (sourced from Congress.gov vote records and bill co-sponsorship data), the platform can generate evidence-based report cards grounded in the official's own words. This is a powerful transparency mechanism that requires careful non-partisan framing.");

  h2(doc, "Deliberative Dialogue & Bridge-Building");
  p(doc, "Inspired by tools like Polis (used by Taiwan's vTaiwan initiative), AI can cluster constituent opinions to find unexpected areas of consensus, surface common ground between opposing groups, and facilitate structured deliberation. Rather than only supporting one-directional Q&A, AskThem could host structured dialogues where AI helps identify shared priorities across partisan lines.");

  h2(doc, "Astroturfing & Fraud Detection");
  p(doc, "Beyond basic content moderation, AI can detect coordinated inauthentic behavior: bulk account creation patterns, templated questions designed to simulate grassroots support, or bot-driven upvote campaigns. Graph-based anomaly detection on the user/question/upvote network, combined with behavioral signals, can flag suspicious activity for moderator review.");

  h2(doc, "Civic Onboarding & Education");
  p(doc, "For users who don't know who represents them or how government works, AI provides contextual education: \"This is your state senator \u2014 they vote on education, transportation, and tax issues\" or \"Here's how a bill becomes law in your state.\" This lowers the knowledge barrier to participation, especially for first-time voters and recent citizens.");

  h2(doc, "Budget & Spending Analysis");
  p(doc, "When constituents ask about funding priorities, AI can pull from USAspending.gov, state budget portals, and municipal financial disclosures to provide context: \"Here's how much your district received for infrastructure last year\" alongside the official's voting record on related appropriations.");

  // ═══ 9. RECOMMENDED STARTING POINT ═══════════════════════════════

  h1(doc, "9. Recommended Starting Point");

  p(doc, "The highest-leverage first integration is a single Claude API call in the question submission flow (POST /api/questions). One structured-output request can return moderation, tagging, duplicate detection, and sentiment analysis simultaneously:");

  code(doc, `{
  "moderation": "approve",
  "moderationReason": "Genuine policy question about healthcare costs",
  "suggestedTags": ["Health", "Economics and Public Finance"],
  "similarQuestionIds": ["q2", "q5"],
  "sentiment": "concerned",
  "urgency": "high"
}`);

  p(doc, "This single integration point touches four of the five operational areas described in this briefing. The implementation requires:");

  li(doc, "Adding a moderationResult JSON field to the Question model in schema.prisma.");
  li(doc, "A single async Claude API call in /api/questions/route.ts after validation but before database persistence.");
  li(doc, "Updating the /moderate dashboard to display AI recommendations alongside human review controls.");
  li(doc, "Conditional auto-publishing when the AI confidence is high and Perspective API toxicity scores are low.");

  p(doc, "Estimated effort: 2\u20133 days of engineering work for the initial integration, plus ongoing prompt tuning based on moderator feedback. The Anthropic API cost at typical civic platform volumes (hundreds to low thousands of questions per month) is negligible.");

  p(doc, "From this foundation, subsequent integrations (delivery automation, answer monitoring, accessibility features) can be added incrementally, each building on the AI infrastructure established by the first integration.");

  // ═══ 10. APPENDIX ════════════════════════════════════════════════

  h1(doc, "10. Appendix: Architecture Notes");

  h2(doc, "Current Stack");
  li(doc, "Framework: Next.js 16 (App Router, Server Components)");
  li(doc, "Database: PostgreSQL via Prisma ORM (v7) with PrismaPg adapter");
  li(doc, "Auth: Auth.js (NextAuth) with Google OAuth");
  li(doc, "Official data: Cicero API (Melissa) for address-based official lookup");
  li(doc, "Email: Mailgun (tracked via EmailEvent model)");
  li(doc, "Hosting: Vercel (inferred from Next.js + middleware configuration)");
  li(doc, "Policy taxonomy: Congress.gov policy areas (28 categories)");

  h2(doc, "Key Models Affected by AI Integration");
  li(doc, "Question \u2014 new fields: moderationResult (JSON), embedding (vector), originalText, originalLanguage");
  li(doc, "Answer \u2014 new fields: plainLanguageSummary");
  li(doc, "Official \u2014 enrichment from Congress.gov API for committee data and contact preferences");
  li(doc, "New models: QuestionTranslation, QuestionSentiment");

  h2(doc, "API Cost Estimates (Claude API)");
  p(doc, "At AskThem's current scale, AI costs are minimal. A single moderation + tagging call for a typical question (prompt ~800 tokens, response ~200 tokens) costs approximately $0.003 with Claude Sonnet. At 1,000 questions/month, that is roughly $3/month for the core moderation integration. Translation, summarization, and digest generation add incrementally but remain well under $50/month at civic-platform scale.");

  // ─── Page footers ────────────────────────────────────────────────

  // Add page footers using low-level page.write to avoid auto-pagination
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    // Position below bottom margin using raw y coordinate - no auto-page-break
    const footerY = PAGE_HEIGHT - 40;
    doc.save();
    doc.font("Regular").fontSize(7.5).fillColor(LIGHT_GRAY);
    doc.page.margins.bottom = 0; // temporarily disable bottom margin
    doc.text("AskThem \u00b7 AI Integration Briefing", MARGIN, footerY, { width: CONTENT_WIDTH / 2, align: "left", lineBreak: false });
    doc.text(`${i + 1}`, MARGIN, footerY, { width: CONTENT_WIDTH, align: "right", lineBreak: false });
    doc.page.margins.bottom = 50; // restore
    doc.restore();
  }

  doc.end();

  stream.on("finish", () => {
    console.log(`PDF saved: ${OUT_PATH}`);
    console.log(`Size: ${Math.round(fs.statSync(OUT_PATH).size / 1024)}KB`);
  });
}

build();
