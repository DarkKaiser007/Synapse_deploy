import { apiRequest } from "./api";

export async function simplifyNote(noteId: string, content: string) {
  return apiRequest("/ai/simplify", "POST", { noteId, content });
}

export async function summarizeNote(noteId: string, content: string) {
  return apiRequest("/ai/summarize", "POST", { noteId, content });
}

export async function generateQuiz(noteId: string, content: string) {
  return apiRequest("/ai/generate-quiz", "POST", { noteId, content });
}
