import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

function trimText(text: string, maxChars = 4000) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

function cleanOCR(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[|_=]{2,}/g, "")
    .trim();
}

async function callAI(prompt: string) {
  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content || "No response";
}

export async function simplifyText(text: string) {
  const cleaned = cleanOCR(trimText(text));

  const prompt = `
  The following text was extracted from an image and may contain formatting errors.
You are an expert tutor helping a student understand difficult study notes.

Rewrite the following notes in simpler language.

Instructions:
- Keep the key technical terms.
- Explain concepts clearly and briefly.
- Use bullet points.
- Break long ideas into short sentences.
- Do not remove important information.

Notes:
${cleaned}
`;

  return callAI(prompt);
}

export async function summarizeText(text: string) {
  const cleaned = cleanOCR(trimText(text));

  const prompt = `
  The following text was extracted from an image and may contain formatting errors.
You are summarizing study notes for exam revision.

Extract the most important concepts.

Rules:
- Maximum 6 bullet points
- Each bullet must be under 20 words
- Focus only on key ideas
- Avoid repeating similar points

Notes:
${cleaned}
`;

  return callAI(prompt);
}

export async function generateQuiz(text: string) {
  const cleaned = cleanOCR(trimText(text));

  const prompt = `
  The following text was extracted from an image and may contain formatting errors.
You are a university professor creating a quiz from study notes.

Create 5 multiple choice questions.

Rules:
- Questions must test understanding, not memorization
- Each question must have four options
- Only one correct answer
- Do not make all answers option A

Format exactly:

Question 1:
A)
B)
C)
D)
Answer:

Notes:
${cleaned}
`;

  return callAI(prompt);
}
