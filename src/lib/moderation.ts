import Anthropic from "@anthropic-ai/sdk";

const OFFICIAL_CONDUCT_POLICY = `You are a content moderation assistant for a civic Q&A platform where constituents ask questions to their elected officials.

Questions MUST relate to "Official Conduct" — meaning they should be about:
- Public duties and responsibilities of the elected official
- Voting record or legislative actions
- Policy positions (current or proposed)
- Use of public resources or taxpayer funds
- Government transparency and accountability
- Constituent services and responsiveness
- Campaign promises vs. actions in office

Questions that are NOT about Official Conduct include:
- Personal/private life of the official unrelated to their public role
- Gossip, rumors, or conspiracy theories
- Personal attacks, insults, or ad hominem arguments
- Questions about the official's family members (unless related to public duties)
- Requests for personal favors or non-governmental services
- Commercial promotion or spam
- Questions directed at the wrong level of government (if clearly irrelevant)

Evaluate the following question and respond with a JSON object containing:
- "result": "pass" if the question relates to Official Conduct, "fail" if it does not
- "reason": A brief explanation of why the question passed or failed (1-2 sentences)
- "suggestion": If the question failed, provide a helpful suggestion for how the user could rephrase their question to align with Official Conduct guidelines. If the question passed, set this to null.

Respond ONLY with the JSON object, no other text.`;

export interface ModerationResult {
  result: "pass" | "fail" | "error";
  reason: string;
  suggestion: string | null;
}

/**
 * Check whether a question adheres to the Official Conduct policy using the Claude API.
 * Returns a structured result indicating pass/fail with reasoning and suggestions.
 */
export async function checkOfficialConduct(
  questionText: string,
): Promise<ModerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set — skipping AI moderation");
    return {
      result: "error",
      reason: "AI moderation is not configured. The question will proceed to manual review.",
      suggestion: null,
    };
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `${OFFICIAL_CONDUCT_POLICY}\n\nQuestion to evaluate:\n"${questionText}"`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response from Claude
    const parsed = JSON.parse(responseText) as {
      result: string;
      reason: string;
      suggestion: string | null;
    };

    if (parsed.result !== "pass" && parsed.result !== "fail") {
      throw new Error(`Unexpected result value: ${parsed.result}`);
    }

    return {
      result: parsed.result,
      reason: parsed.reason,
      suggestion: parsed.suggestion ?? null,
    };
  } catch (error) {
    console.error("AI moderation error:", error);
    return {
      result: "error",
      reason: "AI moderation encountered an error. The question will proceed to manual review.",
      suggestion: null,
    };
  }
}
