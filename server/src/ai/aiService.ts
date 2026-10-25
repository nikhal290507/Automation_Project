import { env } from "../utils/env";

// ---------------------------------------------------------------------------
// AutoFlow AI service
//
// If ANTHROPIC_API_KEY is configured, requests are sent to the real Anthropic
// Messages API. Otherwise every method falls back to a deterministic,
// rule-based mock so the AI Assistant / AI automation builder still work end
// to end on a fresh checkout with zero API keys.
// ---------------------------------------------------------------------------

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

async function callClaude(system: string, userMessage: string): Promise<string | null> {
  if (!env.anthropicApiKey) return null;

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      console.error("[aiService] Anthropic API error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    return textBlock?.text ?? null;
  } catch (err) {
    console.error("[aiService] Anthropic API request failed", err);
    return null;
  }
}

// --- Email classification ---------------------------------------------------

export type EmailCategory = "Academic" | "Work" | "Client" | "Newsletter" | "Personal" | "Other";

export interface EmailClassification {
  category: EmailCategory;
  importance: "high" | "normal" | "low";
  reasoning: string;
}

const KEYWORD_CATEGORY_MAP: Array<{ pattern: RegExp; category: EmailCategory; importance: EmailClassification["importance"] }> = [
  { pattern: /professor|assignment|syllabus|exam|lecture/i, category: "Academic", importance: "high" },
  { pattern: /invoice|proposal|client|contract/i, category: "Client", importance: "high" },
  { pattern: /standup|sprint|deploy|meeting|manager/i, category: "Work", importance: "normal" },
  { pattern: /newsletter|digest|unsubscribe/i, category: "Newsletter", importance: "low" },
  { pattern: /family|dinner|weekend/i, category: "Personal", importance: "normal" },
];

export async function classifyEmail(input: { sender: string; subject: string; snippet?: string }): Promise<EmailClassification> {
  const aiText = await callClaude(
    "You are AutoFlow's email classifier. Given a sender, subject, and snippet, respond ONLY with compact JSON: " +
      '{"category": one of ["Academic","Work","Client","Newsletter","Personal","Other"], "importance": one of ["high","normal","low"], "reasoning": "one short sentence"}. No prose, no markdown fences.',
    `Sender: ${input.sender}\nSubject: ${input.subject}\nSnippet: ${input.snippet ?? ""}`
  );

  if (aiText) {
    try {
      const parsed = JSON.parse(aiText.replace(/```json|```/g, "").trim());
      return parsed as EmailClassification;
    } catch {
      // fall through to deterministic mock
    }
  }

  const combined = `${input.sender} ${input.subject} ${input.snippet ?? ""}`;
  const match = KEYWORD_CATEGORY_MAP.find((m) => m.pattern.test(combined));

  return {
    category: match?.category ?? "Other",
    importance: match?.importance ?? "normal",
    reasoning: match
      ? `Matched keyword pattern for ${match.category.toLowerCase()} emails.`
      : "No strong signal found; defaulted to Other/normal.",
  };
}

// --- Auto-reply generation ---------------------------------------------------

export async function generateReply(input: { subject: string; snippet: string; tone?: string }): Promise<string> {
  const aiText = await callClaude(
    "You draft short, professional auto-reply emails for AutoFlow. Reply with only the email body, 2-4 sentences, no subject line.",
    `Original subject: ${input.subject}\nOriginal message: ${input.snippet}\nTone: ${input.tone ?? "friendly and professional"}`
  );

  if (aiText) return aiText.trim();

  return `Thanks for your message about "${input.subject}". I'm currently away from my inbox but will follow up as soon as I'm back. If this is urgent, please flag it and I'll prioritize it first.`;
}

// --- Natural language -> automation JSON ------------------------------------

export interface GeneratedAutomation {
  name: string;
  trigger: { type: string; config?: Record<string, unknown> };
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ type: string; config?: Record<string, unknown> }>;
}

function mockGenerateAutomation(prompt: string): GeneratedAutomation {
  const lower = prompt.toLowerCase();

  const conditions: GeneratedAutomation["conditions"] = [];
  const senderMatch = lower.match(/from (my |the )?([a-z ]+?)(,| mark| send| and|$)/);
  if (senderMatch) {
    conditions.push({ field: "SENDER", operator: "CONTAINS", value: senderMatch[2].trim() });
  }

  const actions: GeneratedAutomation["actions"] = [];
  if (lower.includes("important")) actions.push({ type: "MARK_IMPORTANT" });
  if (lower.includes("telegram")) actions.push({ type: "TELEGRAM_NOTIFICATION" });
  if (lower.includes("notif")) actions.push({ type: "SEND_NOTIFICATION" });
  if (lower.includes("calendar") || lower.includes("meeting")) actions.push({ type: "CREATE_CALENDAR_EVENT" });
  if (lower.includes("reply")) actions.push({ type: "AUTO_REPLY" });
  if (lower.includes("focus")) actions.push({ type: "ENABLE_FOCUS_MODE" });
  if (lower.includes("categor")) actions.push({ type: "CATEGORIZE_EMAIL" });
  if (actions.length === 0) actions.push({ type: "SAVE_LOG" });

  const triggerType = lower.includes("calendar")
    ? "NEW_CALENDAR_EVENT"
    : senderMatch
      ? "EMAIL_FROM_SENDER"
      : "NEW_EMAIL";

  return {
    name: prompt.length > 60 ? `${prompt.slice(0, 57)}...` : prompt,
    trigger: { type: triggerType, config: senderMatch ? { sender: senderMatch[2].trim() } : {} },
    conditions,
    actions,
  };
}

export async function generateAutomationFromText(prompt: string): Promise<GeneratedAutomation> {
  const aiText = await callClaude(
    "You convert a plain-English automation request into JSON for AutoFlow. Respond ONLY with compact JSON matching this shape, no prose, no markdown fences: " +
      '{"name": string, "trigger": {"type": one of ["NEW_EMAIL","EMAIL_FROM_SENDER","NEW_CALENDAR_EVENT","SCHEDULED_TIME","KEYWORD_DETECTED"], "config": object}, ' +
      '"conditions": [{"field": one of ["SENDER","SUBJECT","KEYWORD","TIME","IMPORTANCE","CATEGORY"], "operator": one of ["EQUALS","CONTAINS","NOT_EQUALS","GREATER_THAN","LESS_THAN"], "value": string}], ' +
      '"actions": [{"type": one of ["CATEGORIZE_EMAIL","MARK_IMPORTANT","SEND_NOTIFICATION","TELEGRAM_NOTIFICATION","CREATE_CALENDAR_EVENT","AUTO_REPLY","ENABLE_FOCUS_MODE","SAVE_LOG"], "config": object}]}',
    prompt
  );

  if (aiText) {
    try {
      return JSON.parse(aiText.replace(/```json|```/g, "").trim()) as GeneratedAutomation;
    } catch {
      // fall through to deterministic mock
    }
  }

  return mockGenerateAutomation(prompt);
}
