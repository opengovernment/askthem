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

const OUT_PATH = path.resolve("public/AskThem-Comparable-Platforms-Report.pdf");

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

function statBox(doc: PDFKit.PDFDocument, stats: { label: string; value: string }[]) {
  const boxH = 40;
  const colW = CONTENT_WIDTH / stats.length;
  checkSpace(doc, boxH + 10);
  const boxY = doc.y;
  doc.save().roundedRect(MARGIN, boxY, CONTENT_WIDTH, boxH, 3).fill(ACCENT_BG).restore();
  doc.save().roundedRect(MARGIN, boxY, CONTENT_WIDTH, boxH, 3).lineWidth(0.5).strokeColor("#e2e8f0").stroke().restore();
  for (let i = 0; i < stats.length; i++) {
    const x = MARGIN + colW * i;
    doc.font("Bold").fontSize(13).fillColor(INDIGO).text(stats[i].value, x, boxY + 6, { width: colW, align: "center" });
    doc.font("Regular").fontSize(7).fillColor(LIGHT_GRAY).text(stats[i].label, x, boxY + 24, { width: colW, align: "center" });
  }
  doc.y = boxY + boxH + 8;
}

// ─── Build ────────────────────────────────────────────────────────────

function build() {
  const doc = new PDFDocument({
    size: "letter",
    margins: { top: 50, bottom: 50, left: MARGIN, right: MARGIN },
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: "Comparable Public Dialogue Platforms \u2014 AskThem Research Report",
      Author: "AskThem / PPF",
      Subject: "Successes and lessons from civic Q&A and public dialogue platforms worldwide",
    },
  });

  doc.registerFont("Regular", FONT_REGULAR);
  doc.registerFont("Bold", FONT_BOLD);
  doc.registerFont("Italic", FONT_ITALIC);

  const stream = fs.createWriteStream(OUT_PATH);
  doc.pipe(stream);

  // ═══ COVER PAGE ═══════════════════════════════════════════════════

  doc.save().rect(0, 0, PAGE_WIDTH, 300).fill(INDIGO).restore();

  doc.font("Bold").fontSize(30).fillColor("white").text("Comparable Public Dialogue\nPlatforms", MARGIN, 80, { width: CONTENT_WIDTH, lineGap: 2 });
  doc.font("Regular").fontSize(14).fillColor("rgba(255,255,255,0.85)").text("Successes and lessons from civic Q&A\nand participatory platforms worldwide", MARGIN, 170, { width: CONTENT_WIDTH, lineGap: 3 });
  doc.font("Regular").fontSize(10).fillColor("rgba(255,255,255,0.65)").text("Research Report \u2014 February 2026", MARGIN, 240);

  doc.y = 340;
  doc.font("Bold").fontSize(13).fillColor(DARK).text("AskThem by Participatory Politics Foundation", MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.y += 8;
  p(doc, "This report surveys civic technology platforms around the world that share AskThem's mission: enabling structured public dialogue between citizens and their elected officials. Each platform is examined for its approach, measurable outcomes, and lessons relevant to AskThem's development.");

  doc.y += 12;
  doc.font("Bold").fontSize(11).fillColor(DARK).text("Contents", MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.y += 6;
  const toc = [
    "1.  Executive Summary",
    "2.  vTaiwan & Polis \u2014 Taiwan",
    "3.  TheyWorkForYou \u2014 United Kingdom",
    "4.  Alaveteli / Ask Your Government \u2014 40+ Countries",
    "5.  Decidim \u2014 Spain & Global",
    "6.  Consul \u2014 Spain & 35+ Countries",
    "7.  Better Reykjav\u00edk \u2014 Iceland",
    "8.  U-Report \u2014 UNICEF / 90+ Countries",
    "9.  Emerging Platforms & AI-Powered Civic Tools",
    "10. Key Takeaways for AskThem",
  ];
  for (const item of toc) {
    doc.font("Regular").fontSize(9.5).fillColor(GRAY).text(item, MARGIN + 10, doc.y, { width: CONTENT_WIDTH });
    doc.y += 2;
  }

  // ═══ 1. EXECUTIVE SUMMARY ═════════════════════════════════════════

  doc.addPage();
  h1(doc, "1. Executive Summary");

  p(doc, "The civic technology landscape has matured significantly since AskThem's original 2013 launch. Platforms across more than 40 countries now facilitate structured dialogue between citizens and government. The most successful share common traits: open-source codebases, clear outcome tracking, integration with official government processes, and mechanisms that prevent the loudest voices from dominating.");

  p(doc, "This report examines eight platforms and platform families that are most relevant to AskThem's mission. Together they demonstrate that citizen-to-official Q&A platforms can achieve meaningful democratic impact when three conditions are met:");

  li(doc, "Official buy-in: Platforms that secure commitments from officials to respond see dramatically higher sustained engagement.");
  li(doc, "Outcome transparency: Showing users what happened as a result of their participation (an official responded, a policy changed, a bill was introduced) is the single strongest driver of return usage.");
  li(doc, "Low barriers to entry: SMS-based, multilingual, and mobile-first designs reach populations that web-only platforms miss.");

  p(doc, "The following sections present each platform's approach, quantified outcomes where available, and specific lessons applicable to AskThem's current architecture and roadmap.");

  statBox(doc, [
    { label: "Platforms Surveyed", value: "8" },
    { label: "Countries Reached", value: "130+" },
    { label: "Citizens Engaged", value: "30M+" },
    { label: "Government Adoptions", value: "300+" },
  ]);

  // ═══ 2. vTAIWAN & POLIS ═══════════════════════════════════════════

  h1(doc, "2. vTaiwan & Polis \u2014 Taiwan");

  h2(doc, "Overview");
  p(doc, "vTaiwan is a hybrid online-offline deliberation process launched in 2015 by Taiwan's g0v civic hacker community in collaboration with the government. It uses Pol.is \u2014 an AI-powered opinion-mapping tool \u2014 to facilitate large-scale consensus-building on policy issues. Unlike traditional Q&A, Polis clusters participants by opinion similarity and surfaces areas of unexpected consensus.");

  h2(doc, "Key Outcomes");
  li(doc, "26 policy issues deliberated between 2015 and 2018, with 80% resulting in decisive government action.");
  li(doc, "The UberX regulation case (2015\u20132016) is the most cited success: Polis mapped 1,800+ participants into opinion clusters, identifying consensus positions on ride-sharing regulation that were adopted into national law.");
  li(doc, "Used internationally: Austria (climate policy, 2022), Uruguay (national referendum, 2020\u20132021), New Zealand (government policy, 2016\u20132019), Philippines (municipal policy, 2020\u2013present), Germany (political party platform, 2018), and Bowling Green, Kentucky (7,890 residents, 1M+ votes on community priorities).");
  li(doc, "In December 2024, vTaiwan hosted an AI governance deliberation event. Results were presented to Taiwan's National Human Rights Commission in March 2025.");

  h2(doc, "Architecture & Approach");
  li(doc, "Polis prohibits reply threads \u2014 participants can only submit statements and vote agree/disagree/pass on others. This eliminates trolling and rewards nuanced positions.");
  li(doc, "Real-time visualization shows opinion clusters, making consensus and division visible to all participants.");
  li(doc, "Results feed into face-to-face stakeholder meetings where specific policy language is drafted.");
  li(doc, "Fully open-source (github.com/compdemocracy/polis).");

  h2(doc, "Lessons for AskThem");
  li(doc, "Consensus mapping: AskThem could use Polis-style clustering on question signers to surface unexpected common ground across partisan lines.");
  li(doc, "The 80% action rate is directly tied to government partnership \u2014 vTaiwan succeeded because officials committed to act on results before deliberation began.");
  li(doc, "vTaiwan's shift to fully volunteer-run (post-2020) shows sustainability challenges when government support wanes.");

  // ═══ 3. THEYWORKFORYOU ═════════════════════════════════════════════

  doc.addPage();
  h1(doc, "3. TheyWorkForYou \u2014 United Kingdom");

  h2(doc, "Overview");
  p(doc, "TheyWorkForYou (TWFY) is a parliamentary monitoring website operated by mySociety, a UK-based civic technology nonprofit. Launched in 2004, it transforms raw Hansard transcripts into searchable, readable pages for every MP, Lord, and member of the devolved assemblies. It enables citizens to track what their representatives say and do in Parliament, receive email alerts on topics of interest, and write directly to their MP via the companion service WriteToThem.");

  h2(doc, "Key Outcomes");
  li(doc, "Over 20 years of continuous operation (2004\u2013present), making it one of the longest-running civic tech platforms.");
  li(doc, "mySociety research found over 90% of TWFY users believe the platform enables them to hold representatives to account.");
  li(doc, "A similar percentage believe MPs would behave differently if this information were not publicly available.");
  li(doc, "WriteToThem (companion tool) has facilitated millions of constituent-to-MP messages since 2005.");
  li(doc, "Model has been replicated: OpenAustralia (Australia), Novabase (Portugal), and similar parliamentary monitoring sites in 10+ countries.");

  h2(doc, "Architecture & Approach");
  li(doc, "Automated scraping and parsing of official Hansard transcripts, published daily.");
  li(doc, "Per-MP pages show voting records, speech frequency, topics spoken about, and registered interests.");
  li(doc, "Email alerts: citizens subscribe to topics (e.g., \"housing\", \"NHS\") and receive notifications when their MP speaks on those issues.");
  li(doc, "Open-source codebase; data available via API.");

  h2(doc, "Lessons for AskThem");
  li(doc, "Transparency drives accountability: Simply making official behavior visible changes that behavior. AskThem's public question-and-response pages serve a similar function.");
  li(doc, "Longevity matters: TWFY's 20-year track record demonstrates that consistent availability builds institutional trust. Citizens and journalists rely on it as infrastructure.");
  li(doc, "MP pushback: Some MPs have criticized TWFY for misrepresenting their work (e.g., equating speech frequency with effectiveness). AskThem should anticipate similar objections and design metrics carefully.");

  // ═══ 4. ALAVETELI ══════════════════════════════════════════════════

  h1(doc, "4. Alaveteli / Ask Your Government \u2014 40+ Countries");

  h2(doc, "Overview");
  p(doc, "Alaveteli is mySociety's open-source Freedom of Information (FOI) request platform. It enables citizens to submit public information requests to government bodies and publishes both the request and the response publicly. Deployed in over 40 countries under localized names (WhatDoTheyKnow in the UK, Ask Your Government in Uganda, Derecho a Preguntar in Mexico, and many others), it is the most widely deployed civic Q&A platform in the world.");

  h2(doc, "Key Outcomes");
  li(doc, "WhatDoTheyKnow (UK): Over 800,000 FOI requests made and published since 2008, with a response rate above 80%.");
  li(doc, "Ask Your Government Uganda: Used to assess government responsiveness; results directly inform FOI advocacy efforts.");
  li(doc, "40+ country deployments spanning Africa, Latin America, Europe, and Asia-Pacific.");
  li(doc, "Public publication of all requests and responses creates a searchable knowledge base, reducing duplicate requests.");

  h2(doc, "Architecture & Approach");
  li(doc, "Citizens select a government body, write their request, and Alaveteli delivers it via email. The response is published alongside the original request.");
  li(doc, "Responsiveness tracking: The platform publicly scores each government body on response rate and timeliness.");
  li(doc, "Crowdsourced classification: Users can mark whether a response actually answers the question, providing quality data.");
  li(doc, "Ruby on Rails, open-source, with extensive localization support.");

  h2(doc, "Lessons for AskThem");
  li(doc, "Public accountability through transparency: Publishing both questions and responses (or non-responses) is a powerful accountability mechanism. AskThem already does this for Q&A; Alaveteli demonstrates the model works for FOI too.");
  li(doc, "Responsiveness scoring is directly applicable to AskThem's official profiles \u2014 showing which officials engage and which don't.");
  li(doc, "International deployment proves the model translates across very different political contexts.");

  // ═══ 5. DECIDIM ════════════════════════════════════════════════════

  doc.addPage();
  h1(doc, "5. Decidim \u2014 Spain & Global");

  h2(doc, "Overview");
  p(doc, "Decidim (\"we decide\" in Catalan) is a free, open-source participatory democracy platform created by the Barcelona City Council in 2016. It supports proposals, debates, participatory budgeting, collaborative text drafting, and citizen assemblies. It is used by over 150 organizations across Europe, Latin America, and Africa, and has become the de facto standard for government-run participatory platforms.");

  h2(doc, "Key Outcomes");
  li(doc, "Barcelona: Over 70% of Decidim-generated proposals were incorporated into the 2016\u20132019 Municipal Action Plan. More than 40,000 participants submitted 11,873 proposals.");
  li(doc, "Decide M\u00e9rida (Mexico): 3,000+ citizen interactions for the Municipal Development Plan 2018\u20132021, including proposals, comments, and votes.");
  li(doc, "Helsinki, Finland: Participatory budgeting via OmaStadi (built on Decidim) distributes \u20ac8.8 million annually based on citizen proposals and votes.");
  li(doc, "150+ organizations in 20+ countries now use Decidim for some form of participatory process.");

  h2(doc, "Architecture & Approach");
  li(doc, "Modular: Organizations can enable/disable components (proposals, budgeting, debates, surveys, assemblies) per process.");
  li(doc, "Verification system: Supports census-based verification to ensure participants are actual residents of the jurisdiction.");
  li(doc, "Traceability: Every proposal, comment, and vote is logged and publicly auditable.");
  li(doc, "Ruby on Rails, open-source (github.com/decidim/decidim), with a large contributor community.");

  h2(doc, "Lessons for AskThem");
  li(doc, "Modular design enables different use cases: AskThem could adopt a similar approach, offering Q&A as one component alongside events, petitions, and participatory budgeting.");
  li(doc, "Census-based verification parallels AskThem's address verification via Cicero \u2014 confirming that participants are actual constituents is critical for legitimacy.");
  li(doc, "Decidim's success in embedding participatory tools into official government processes is the gold standard for institutional adoption.");

  // ═══ 6. CONSUL ═════════════════════════════════════════════════════

  h1(doc, "6. Consul \u2014 Spain & 35+ Countries");

  h2(doc, "Overview");
  p(doc, "Consul is a free, open-source platform for citizen participation, originally developed by the Madrid City Council in 2015. It supports debates, proposals, participatory budgeting, polls, and collaborative legislation drafting. Adopted by over 130 institutions in 35+ countries, Consul is the most widely deployed participatory budgeting platform globally.");

  h2(doc, "Key Outcomes");
  li(doc, "Madrid: Decide Madrid engaged 400,000+ registered users for participatory budgeting, with \u20ac100 million allocated based on citizen votes (2016\u20132019).");
  li(doc, "Buenos Aires, Porto Alegre, Paris, and Rome have all run Consul-based participatory budgeting processes.");
  li(doc, "130+ institutional deployments across local, regional, and national governments.");
  li(doc, "The platform has processed millions of citizen proposals and votes worldwide.");

  h2(doc, "Architecture & Approach");
  li(doc, "Identity verification: Supports multiple verification methods (census, SMS, in-person) to balance accessibility with anti-fraud protection.");
  li(doc, "Geolocation: Proposals and budgets can be scoped to specific neighborhoods or districts.");
  li(doc, "Open-source Ruby on Rails (github.com/consul/consul).");

  h2(doc, "Lessons for AskThem");
  li(doc, "Scale proof: Consul demonstrates that participatory platforms can scale to hundreds of thousands of users while maintaining trust through verification.");
  li(doc, "Budget integration: When participation is tied to real resource allocation (money), engagement rates are dramatically higher. AskThem could explore tying question delivery to official response commitments for similar effect.");
  li(doc, "Multi-method verification (census + SMS + in-person) provides a model for how AskThem could expand beyond address-only verification.");

  // ═══ 7. BETTER REYKJAVIK ═══════════════════════════════════════════

  h1(doc, "7. Better Reykjav\u00edk \u2014 Iceland");

  h2(doc, "Overview");
  p(doc, "Better Reykjav\u00edk (Betri Reykjav\u00edk) is a citizen participation platform launched in 2010 by the Citizens Foundation, an Icelandic civic technology nonprofit. It enables residents to submit, debate, and prioritize ideas for city improvement. The platform is directly integrated into Reykjav\u00edk's municipal decision-making process: top-voted ideas are formally considered by the city council.");

  h2(doc, "Key Outcomes");
  li(doc, "Over 70,000 registered users (in a city of ~130,000) \u2014 more than half the population.");
  li(doc, "Thousands of citizen-generated ideas submitted and debated since 2010.");
  li(doc, "Hundreds of top-voted ideas formally considered and many implemented by the city council.");
  li(doc, "The companion platform Your Priorities has been adopted in over 20 countries for similar participatory processes.");

  h2(doc, "Architecture & Approach");
  li(doc, "Structured pro/con debate: Each idea has separate columns for supporting and opposing arguments, promoting balanced deliberation.");
  li(doc, "Prioritization: Citizens vote ideas up or down; the highest-ranked are forwarded to the relevant city council committee.");
  li(doc, "Direct municipal integration: City council committees are required to formally respond to forwarded ideas, closing the feedback loop.");
  li(doc, "Open-source (Citizens Foundation).");

  h2(doc, "Lessons for AskThem");
  li(doc, "Population-scale adoption: Reaching 50%+ of a city's population proves that civic tech can achieve mass participation, not just niche engagement.");
  li(doc, "Mandatory government response: The requirement that city council committees formally consider top ideas is the key driver of sustained participation. AskThem's delivery threshold mechanism (questions delivered after N constituent signatures) is a similar approach.");
  li(doc, "Structured debate (pro/con columns) prevents discussion from devolving into unstructured comment threads.");

  // ═══ 8. U-REPORT ═══════════════════════════════════════════════════

  h1(doc, "8. U-Report \u2014 UNICEF / 90+ Countries");

  h2(doc, "Overview");
  p(doc, "U-Report is a UNICEF-supported mobile messaging platform that enables young people to voice their opinions on issues that matter to them. Operating in over 90 countries via SMS, WhatsApp, and social media, it reaches populations that web-based platforms cannot. Weekly polls gather youth opinions on public issues, with results shared with members of parliament and published in media outlets.");

  h2(doc, "Key Outcomes");
  li(doc, "Over 30 million registered U-Reporters globally as of 2025.");
  li(doc, "In Uganda, UNICEF provides MPs with weekly reviews of poll results, acting as a bridge between youth voices and government.");
  li(doc, "Used in crisis response: During COVID-19, U-Report surveys in multiple African countries informed government communication strategies and resource allocation.");
  li(doc, "Operational in 90+ countries across Africa, Latin America, Asia, and Europe.");

  h2(doc, "Architecture & Approach");
  li(doc, "SMS-first: Users register for free by sending a text message. No app download, no internet connection required.");
  li(doc, "Weekly polls on public issues, with results aggregated and disaggregated by region, age, and gender.");
  li(doc, "Chatbot-driven: Automated conversations guide users through poll questions and provide information.");
  li(doc, "Results are published openly and shared directly with government stakeholders.");

  h2(doc, "Lessons for AskThem");
  li(doc, "Accessibility over features: U-Report's SMS-first approach reaches 30M+ users precisely because it demands nothing from them \u2014 no app, no account, no address verification. AskThem should consider SMS/WhatsApp channels for signature collection.");
  li(doc, "Youth engagement: U-Report demonstrates that young people will participate in civic processes when the barrier is low enough. AskThem's current web-only approach may miss this demographic.");
  li(doc, "Government bridge: U-Report doesn't ask officials to participate on the platform \u2014 it aggregates citizen voices and delivers them through existing channels. This is a useful fallback model when official sign-up is slow.");

  // ═══ 9. EMERGING PLATFORMS ══════════════════════════════════════════

  h1(doc, "9. Emerging Platforms & AI-Powered Civic Tools");

  p(doc, "A new wave of AI-powered civic tools is emerging in 2024\u20132026, signaling where the field is heading.");

  h2(doc, "OpenCouncil.gr \u2014 Greece");
  p(doc, "Uses AI to automatically transcribe local council meetings, generate summaries, create social media content, and send personalized neighborhood updates via messaging apps. Makes local governance accessible to citizens who cannot attend meetings in person. Directly relevant to AskThem's planned meeting summarization feature (see AI Integration Briefing, Section 8).");

  h2(doc, "Tainan City Council WatchBot \u2014 Taiwan");
  p(doc, "An AI system trained on city council proceedings that allows citizens to ask natural-language questions about what their council has discussed and decided. Demonstrates how RAG (Retrieval-Augmented Generation) can make legislative records searchable and conversational.");

  h2(doc, "Panoramic \u2014 France");
  p(doc, "Uses RAG to help citizens navigate government information. Guides users with suggested questions and topics, then retrieves and synthesizes answers from official databases. Demonstrates how AI can lower the knowledge barrier to civic participation \u2014 citizens don't need to know the right question to ask.");

  h2(doc, "Bowling Green \u2014 Polis + Sensemaker (USA)");
  p(doc, "In Bowling Green, Kentucky, the city combined Polis for citizen deliberation with Google Jigsaw's Sensemaker for AI-powered theme extraction. Over one month, 7,890 residents weighed in 1,034,868 times on community priorities. The AI identified common themes across the large dataset and produced an interactive summary report for city planners.");

  h2(doc, "UNDP Civic Tech Innovation Challenge \u2014 Asia-Pacific");
  p(doc, "In May 2025, UNDP launched a Regional Civic Tech Innovation Challenge targeting youth-led civic tech solutions across Asia and the Pacific. The open call received 251 applications from 30 countries, demonstrating strong demand for civic tech innovation in the Global South. Winners receive funding, mentorship, and connections to government partners.");

  h2(doc, "OECD Report: Tackling Civic Participation Challenges (2025)");
  p(doc, "The OECD published a major report in April 2025 on emerging technologies for civic participation, including AI-powered tools for deliberation, translation, accessibility, and moderation. The report emphasizes that AI should augment rather than replace human deliberation, and warns against platforms where algorithmic outputs are treated as substitutes for genuine citizen voice.");

  // ═══ 10. KEY TAKEAWAYS ═════════════════════════════════════════════

  h1(doc, "10. Key Takeaways for AskThem");

  p(doc, "Across all eight platforms and the emerging AI-powered tools, several patterns emerge that should inform AskThem's development:");

  h2(doc, "1. Official commitment is the #1 predictor of success");
  p(doc, "vTaiwan's 80% action rate, Better Reykjav\u00edk's mandatory council response, and U-Report's MP briefings all succeed because government officials are committed to engaging with the output. AskThem's model of requiring officials to respond to top questions is sound \u2014 the challenge is scaling the number of officials who make that commitment. The delivery threshold mechanism (questions delivered after N constituent signatures) creates a credible reason for officials to pay attention.");

  h2(doc, "2. Close the feedback loop");
  p(doc, "The platforms with the highest sustained engagement all show users what happened as a result of their participation. Decidim traces proposals through to implementation. TheyWorkForYou alerts users when their MP speaks on their topic. AskThem's answer-posting workflow already does this for the Q&A loop; the planned answer monitoring feature (matching official public statements to questions) would extend it further.");

  h2(doc, "3. Verification builds legitimacy");
  p(doc, "Consul, Decidim, and Better Reykjav\u00edk all verify that participants are actual residents of the jurisdiction. AskThem's Cicero-based address verification already achieves this at a level most civic tech platforms do not. The constituent vs. supporter distinction on signatures is a significant differentiator \u2014 officials take constituent voices more seriously than general public support.");

  h2(doc, "4. Lower the barrier, widen the reach");
  p(doc, "U-Report's 30M users via SMS vs. typical web platform engagement of thousands illustrates the accessibility gap. AskThem should explore SMS and WhatsApp channels for signature collection (not full Q&A, but at minimum \"sign this question\"). The planned multilingual support and plain-language summaries (AI Integration Briefing, Section 7) address the language and literacy barriers that most platforms still ignore.");

  h2(doc, "5. Open source enables global impact");
  p(doc, "Alaveteli (40+ countries), Decidim (150+ orgs), and Consul (130+ institutions) all achieved massive reach because their open-source codebases allowed local adaptation. AskThem's open-source foundation positions it for similar deployment beyond the U.S. \u2014 the Cicero-specific address lookup would need to be swapped for local equivalents, but the core Q&A and moderation workflow is universally applicable.");

  h2(doc, "6. AI is augmenting, not replacing, civic participation");
  p(doc, "OpenCouncil.gr, Panoramic, Bowling Green's Polis+Sensemaker, and the OECD's 2025 report all point in the same direction: AI is most effective when it reduces friction (transcription, translation, theme extraction, moderation) rather than making decisions. AskThem's AI integration roadmap (moderation, tagging, delivery drafting, answer matching) aligns well with this principle.");

  doc.y += 6;
  p(doc, "The civic tech field is moving toward AI-augmented, multi-channel, multilingual platforms that treat participation as infrastructure rather than an experiment. AskThem is well-positioned in this landscape: its structured Q&A model, address-verified constituent identification, and open-source foundation provide a solid base. The key priorities are scaling official engagement, adding accessibility channels (SMS, multilingual), and deploying AI to reduce the operational burden on moderators so the platform can grow beyond what manual moderation allows.");

  // ─── Page footers ────────────────────────────────────────────────

  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const footerY = PAGE_HEIGHT - 40;
    doc.save();
    doc.font("Regular").fontSize(7.5).fillColor(LIGHT_GRAY);
    doc.page.margins.bottom = 0;
    doc.text("AskThem \u00b7 Comparable Platforms Report", MARGIN, footerY, { width: CONTENT_WIDTH / 2, align: "left", lineBreak: false });
    doc.text(`${i + 1}`, MARGIN, footerY, { width: CONTENT_WIDTH, align: "right", lineBreak: false });
    doc.page.margins.bottom = 50;
    doc.restore();
  }

  doc.end();

  stream.on("finish", () => {
    console.log(`PDF saved: ${OUT_PATH}`);
    console.log(`Size: ${Math.round(fs.statSync(OUT_PATH).size / 1024)}KB`);
  });
}

build();
