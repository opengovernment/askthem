/**
 * Action Network API client for CRM sync.
 *
 * AskThem pushes user data to Action Network on:
 *   - Account registration (Person Signup Helper)
 *   - Question signing/upvoting (Record Signature Helper)
 *
 * Action Network handles: CRM segmentation, campaign/broadcast emails,
 * automated ladder sequences, and unsubscribe compliance.
 *
 * Docs: https://actionnetwork.org/docs/v2/
 */

const AN_API_BASE = "https://actionnetwork.org/api/v2";

function getApiKey(): string | undefined {
  return process.env.ACTION_NETWORK_API_KEY;
}

function isEnabled(): boolean {
  return !!getApiKey();
}

interface ANPersonPayload {
  person: {
    given_name: string;
    family_name: string;
    email_addresses: { address: string }[];
    postal_addresses?: { postal_code?: string; locality?: string; region?: string }[];
  };
  add_tags?: string[];
  remove_tags?: string[];
}

interface ANSignaturePayload {
  person: {
    email_addresses: { address: string }[];
  };
  add_tags?: string[];
  triggers?: {
    autoresponse?: { enabled: boolean };
  };
}

async function anFetch(path: string, body: unknown): Promise<{ ok: boolean; data?: unknown }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[ActionNetwork] API key not configured, skipping sync");
    return { ok: false };
  }

  try {
    const res = await fetch(`${AN_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OSDI-API-Token": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`[ActionNetwork] ${path} failed: ${res.status} ${res.statusText}`);
      return { ok: false };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    console.error("[ActionNetwork] request failed:", err);
    return { ok: false };
  }
}

/**
 * Sync a new user to Action Network via the Person Signup Helper.
 * AN deduplicates by email — safe to call on every login.
 *
 * Returns the AN person UUID if successful, or null.
 */
export async function syncPersonToAN(user: {
  email: string;
  name: string;
  state?: string | null;
  city?: string | null;
  zip?: string | null;
  districtTag?: string;
}): Promise<string | null> {
  if (!isEnabled()) return null;

  const [givenName, ...rest] = user.name.split(" ");
  const familyName = rest.join(" ") || "";

  const payload: ANPersonPayload = {
    person: {
      given_name: givenName,
      family_name: familyName,
      email_addresses: [{ address: user.email }],
    },
    add_tags: ["askthem-user"],
  };

  // Add address info if available
  if (user.zip || user.city || user.state) {
    payload.person.postal_addresses = [
      {
        postal_code: user.zip ?? undefined,
        locality: user.city ?? undefined,
        region: user.state ?? undefined,
      },
    ];
  }

  // Tag by district for segmentation (e.g. "district:NY-14")
  if (user.districtTag) {
    payload.add_tags!.push(`district:${user.districtTag}`);
  }

  const result = await anFetch("/people/", payload);

  if (result.ok && result.data) {
    // Extract AN person UUID from the identifiers array
    const identifiers = (result.data as { identifiers?: string[] }).identifiers;
    const anId = identifiers?.find((id: string) => id.startsWith("action_network:"));
    return anId?.replace("action_network:", "") ?? null;
  }

  return null;
}

/**
 * Record a question signature (upvote) in Action Network.
 *
 * This requires a petition resource in AN mapped to the question.
 * If ASKTHEM_AN_PETITION_ID is not set, we fall back to tagging the
 * person with the question ID for ladder triggering.
 */
export async function recordSignatureInAN(
  userEmail: string,
  questionId: string,
  tags: string[],
): Promise<void> {
  if (!isEnabled()) return;

  const petitionId = process.env.ASKTHEM_AN_PETITION_ID;

  if (petitionId) {
    // Use the Record Signature Helper for a specific AN petition
    const payload: ANSignaturePayload = {
      person: {
        email_addresses: [{ address: userEmail }],
      },
      add_tags: [`signed:${questionId}`, ...tags.map((t) => `topic:${t}`)],
      triggers: {
        autoresponse: { enabled: true },
      },
    };
    await anFetch(`/petitions/${petitionId}/signatures/`, payload);
  } else {
    // Fallback: tag the person so ladders can trigger on it
    await anFetch("/people/", {
      person: {
        email_addresses: [{ address: userEmail }],
      },
      add_tags: [`signed:${questionId}`, ...tags.map((t) => `topic:${t}`)],
    });
  }
}

/**
 * Tag signers when a question status changes (delivered, answered).
 * Triggers AN ladders configured for these tags.
 */
export async function tagSignersInAN(
  signerEmails: string[],
  tag: string,
): Promise<void> {
  if (!isEnabled()) return;

  // AN rate limit is 4 req/s — process sequentially with small delay
  for (const email of signerEmails) {
    await anFetch("/people/", {
      person: {
        email_addresses: [{ address: email }],
      },
      add_tags: [tag],
    });

    // Respect AN rate limit (4 req/s)
    if (signerEmails.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
}
