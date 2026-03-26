import { azureOpenAIClient, azureOpenAIModel } from "./azureOpenAI";

export type ModerationCategory =
  | "safe"
  | "harmful"
  | "violent"
  | "adult"
  | "hate"
  | "self_harm"
  | "illegal"
  | "academic_dishonesty"
  | "other";

export interface ModerationResult {
  safe: boolean;
  reason: string | null;
  category: ModerationCategory;
}

const MODERATION_SYSTEM_PROMPT = `You are a content moderation system for an educational study app used by students. Analyze the following content and return ONLY a JSON object:
{
  safe: boolean,
  reason: string | null,
  category: 'safe' | 'harmful' | 'violent' | 'adult' | 'hate' | 'self_harm' | 'illegal' | 'academic_dishonesty' | 'other'
}
Flag content that contains: violence, hate speech, adult content, self-harm, illegal activities, or content that promotes academic dishonesty (e.g. 'write my entire assignment for me').
Educational content about sensitive historical events, medical topics, or mature literature is generally SAFE in an academic context.
Be strict but fair - this is a student learning platform.`;

const VALID_CATEGORIES: ModerationCategory[] = [
  "safe",
  "harmful",
  "violent",
  "adult",
  "hate",
  "self_harm",
  "illegal",
  "academic_dishonesty",
  "other",
];

const CONTENT_REJECTED_MESSAGE =
  "SYNAPSE was unable to process this note as it contains content that violates our community guidelines.";

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || text || "").trim();

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in moderation response");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeModerationResult(payload: unknown): ModerationResult {
  const asObject = (payload || {}) as {
    safe?: unknown;
    reason?: unknown;
    category?: unknown;
  };

  const category =
    typeof asObject.category === "string" &&
    VALID_CATEGORIES.includes(asObject.category as ModerationCategory)
      ? (asObject.category as ModerationCategory)
      : "other";

  return {
    safe: Boolean(asObject.safe),
    reason: typeof asObject.reason === "string" ? asObject.reason : null,
    category,
  };
}

export async function moderateContent(text: string): Promise<ModerationResult> {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      safe: true,
      reason: null,
      category: "safe",
    };
  }

  try {
    const completion = await azureOpenAIClient.chat.completions.create({
      model: azureOpenAIModel,
      messages: [
        {
          role: "system",
          content: MODERATION_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: trimmedText,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    return normalizeModerationResult(extractJsonObject(raw));
  } catch (error) {
    // If moderation fails (rate limit, timeout, bad JSON), default to safe
    // so the actual chat request can still proceed.
    console.error("CONTENT_MODERATION_ERROR (defaulting to safe):", error);
    return {
      safe: true,
      reason: null,
      category: "safe",
    };
  }
}

export function buildContentRejectedResponse(category: ModerationCategory) {
  return {
    error: "CONTENT_REJECTED",
    message: CONTENT_REJECTED_MESSAGE,
    category,
  };
}

export function logModerationRejection(params: {
  userId: string;
  category: ModerationCategory;
  content: string;
}) {
  const contentSnippet = params.content.replace(/\s+/g, " ").slice(0, 100);

  console.warn("CONTENT_MODERATION_REJECTION", {
    timestamp: new Date().toISOString(),
    userId: params.userId,
    category: params.category,
    contentSnippet,
  });
}
