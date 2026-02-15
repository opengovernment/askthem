import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import path from "path";
import fs from "fs";
import type { ReactNode } from "react";

// Use locally available system fonts
const FONT_REGULAR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf";
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

interface TableRow {
  tool: string;
  what: string;
  integration: string;
}

interface TableDef {
  filename: string;
  title: string;
  rows: TableRow[];
}

const tables: TableDef[] = [
  {
    filename: "1-question-moderation",
    title: "Question Moderation",
    rows: [
      {
        tool: "Claude API",
        what: "Classify questions as approve / flag / reject; suggest Congress.gov policy tags from POLICY_AREAS",
        integration:
          "Call in /api/questions/route.ts at submission time, store result as a new moderationScore field on Question",
      },
      {
        tool: "Perspective API (Google / Jigsaw)",
        what: "Toxicity, threat, and spam scoring — free, purpose-built for this",
        integration:
          "Lightweight HTTP call alongside Claude, good as a fast first-pass filter",
      },
      {
        tool: "pgvector + embeddings (Voyage, OpenAI)",
        what: "Detect duplicate / similar questions per official",
        integration:
          'Add a vector column to Question, query nearest neighbors on submission to surface "this may already be asked"',
      },
    ],
  },
  {
    filename: "2-delivery-automation",
    title: "Delivery Automation",
    rows: [
      {
        tool: "Claude API",
        what: "Draft delivery emails, batch related questions into digests",
        integration:
          "New /api/deliver endpoint or cron job that groups published questions by official",
      },
      {
        tool: "Mailgun (already integrated)",
        what: "Send the emails",
        integration: "Already wired via EmailEvent model",
      },
      {
        tool: "Congress.gov API",
        what: "Look up official contact info, committee assignments for better targeting",
        integration:
          "Enrich Official records on import alongside Cicero data",
      },
    ],
  },
  {
    filename: "3-answer-monitoring",
    title: "Answer Monitoring & Posting",
    rows: [
      {
        tool: "Apify or Browserbase",
        what: "Scrape official websites, press release pages, social feeds on a schedule",
        integration:
          "Scheduled worker that fetches new content per official",
      },
      {
        tool: "Claude API",
        what: "Semantic match: does this press release answer any pending delivered questions?",
        integration:
          "Compare scraped content against delivered questions, score relevance",
      },
      {
        tool: "X / Twitter API",
        what: "Monitor officials' tweets for responses",
        integration:
          "Poll or stream officials' feeds (twitter handles already stored on Official)",
      },
    ],
  },
  {
    filename: "4-alerting-signers",
    title: "Alerting Signers",
    rows: [
      {
        tool: "Claude API",
        what: "Personalize notification emails — summarize the answer in context of the question",
        integration:
          "Call when answer is posted, before sending via Mailgun",
      },
      {
        tool: "Resend or Mailgun",
        what: "Transactional email with rich templates",
        integration:
          "Already have Mailgun; Resend has a nice React email SDK that fits the Next.js stack",
      },
    ],
  },
  {
    filename: "5-sentiment-analysis",
    title: "Sentiment Analysis",
    rows: [
      {
        tool: "Claude API",
        what: "Classify question sentiment and urgency per topic",
        integration:
          "Batch job over questions, store results in a new QuestionSentiment table",
      },
      {
        tool: "Embeddings + UMAP / HDBSCAN",
        what: "Cluster questions into emergent themes beyond the fixed Congress.gov tags",
        integration:
          "Python worker or a Next.js API route using @xenova/transformers for in-process embeddings",
      },
      {
        tool: "Observable / D3 or Tremor",
        what: "Visualize trends as public dashboards",
        integration:
          "New /dashboard/[state] route showing charts of constituent priorities over time",
      },
    ],
  },
];

// Satori uses a React-like element format (plain objects)
function h(
  type: string,
  props: Record<string, unknown> | null,
  ...children: unknown[]
): ReactNode {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children,
    },
  } as unknown as ReactNode;
}

function buildElement(table: TableDef): ReactNode {
  const headerCellStyle = {
    padding: "10px 16px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#64748b",
  };

  const cellStyle = {
    padding: "14px 16px",
    fontSize: 13,
    lineHeight: 1.5,
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
  };

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        padding: 24,
        fontFamily: "Inter",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
      },
      // Header
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            padding: "18px 24px",
          },
        },
        h(
          "div",
          {
            style: {
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              display: "flex",
            },
          },
          table.title
        ),
        h(
          "div",
          {
            style: {
              fontSize: 12,
              color: "rgba(255,255,255,0.8)",
              marginTop: 4,
              display: "flex",
            },
          },
          "AI Integration for AskThem"
        )
      ),
      // Column headers
      h(
        "div",
        {
          style: {
            display: "flex",
            background: "#f1f5f9",
            borderBottom: "1px solid #e2e8f0",
          },
        },
        h("div", { style: { ...headerCellStyle, width: "22%", display: "flex" } }, "Tool"),
        h("div", { style: { ...headerCellStyle, width: "40%", display: "flex" } }, "What It Does"),
        h("div", { style: { ...headerCellStyle, width: "38%", display: "flex" } }, "Integration Point")
      ),
      // Rows
      ...table.rows.map((row, i) =>
        h(
          "div",
          {
            style: {
              display: "flex",
              borderBottom:
                i < table.rows.length - 1 ? "1px solid #f1f5f9" : "none",
            },
          },
          h(
            "div",
            {
              style: {
                ...cellStyle,
                width: "22%",
                fontWeight: 700,
                color: "#1e293b",
                display: "flex",
              },
            },
            row.tool
          ),
          h(
            "div",
            { style: { ...cellStyle, width: "40%", display: "flex" } },
            row.what
          ),
          h(
            "div",
            { style: { ...cellStyle, width: "38%", display: "flex" } },
            row.integration
          )
        )
      ),
      // Footer
      h(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 16px",
            fontSize: 10,
            color: "#94a3b8",
            borderTop: "1px solid #f1f5f9",
          },
        },
        "AskThem · AI Integration Plan"
      )
    )
  );
}

async function main() {
  const outDir = path.resolve("public/ai-tables");
  fs.mkdirSync(outDir, { recursive: true });

  // Load local system fonts
  console.log("Loading fonts...");
  const regularFont = fs.readFileSync(FONT_REGULAR);
  const boldFont = fs.readFileSync(FONT_BOLD);

  const fonts = [
    { name: "Inter", data: regularFont.buffer as ArrayBuffer, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: boldFont.buffer as ArrayBuffer, weight: 700 as const, style: "normal" as const },
  ];

  for (const table of tables) {
    const element = buildElement(table);
    const svg = await satori(element, { width: 860, fonts });
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1720 }, // 2x for retina
    });
    const pngData = resvg.render().asPng();
    const pngPath = path.join(outDir, `${table.filename}.png`);
    fs.writeFileSync(pngPath, pngData);
    console.log(`Created: ${pngPath} (${Math.round(pngData.length / 1024)}KB)`);
  }

  console.log(`\nAll 5 table images saved to ${outDir}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
