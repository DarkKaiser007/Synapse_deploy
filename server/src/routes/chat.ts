import express from "express";
import prisma from "../prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { chatWithNotes } from "../services/aiService";
import type { ChatMessage as AIChatMessage } from "../services/aiService";
import {
  getPreferredLanguage,
  normalizePreferredLanguage,
} from "../services/preferredLanguage";
import { azureOpenAIClient, azureOpenAIModel } from "../services/azureOpenAI";
import {
  logModerationRejection,
  moderateContent,
} from "../services/contentModeration";

const router = express.Router();
const MODERATION_REFUSAL_MESSAGE = "I'm sorry, I can't help with that. I'm here to help you study and learn - let's keep our conversation educational! 📚";
const GLOBAL_ASSISTANT_SYSTEM_PROMPT = `You are SYNAPSE Assistant, a helpful AI built into the SYNAPSE study app.
You have two areas of expertise:

1. SYNAPSE APP KNOWLEDGE:
SYNAPSE is an AI-powered study buddy app with these features:
- Notes: Create typed notes, upload images/PDFs/PPTs for AI analysis, voice recording with transcription and translation
- Note Detail: Simplify, Summarize, Generate Quiz, Audio Lecture (AI tutor reads notes aloud), Ask SYNAPSE chatbot (note-specific)
- Dashboard: Study activity heatmap, performance overview, FAB quick actions
- Study Planner: Plan and organize study sessions
- Quizzes: AI-generated quizzes from notes, performance tracking
- Performance: AI Study Coach Analysis, Score Trend, Subject Performance, Brain Fatigue Detector, Forgetting Curve
- Profile: Preferred language setting (affects all AI outputs), account settings
- Pomodoro Timer: Floating timer with subject selector, persists across pages
- Global Assistant: That's you! Available on every page

2. GENERAL STUDY HELP:
You can answer general academic questions, explain concepts, suggest study techniques, help with time management, and provide learning strategies.

Always be encouraging, clear and concise. If asked about something outside these two areas, politely redirect to what you can help with.
Respond in the user's preferred language if known.`;

router.get("/:noteId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const noteId = String(req.params.noteId || "");

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user!.id,
      },
      select: { id: true },
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const preferredLanguage = await getPreferredLanguage(req.user!.id);

    const messages = await prisma.chatMessage.findMany({
      where: {
        noteId,
        userId: req.user!.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({ messages, preferredLanguage });
  } catch (error) {
    console.error("FETCH CHAT HISTORY ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

router.post("/global", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { message, conversationHistory } = req.body as {
      message?: string;
      conversationHistory?: Array<{
        role?: string;
        content?: string;
      }>;
    };

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const trimmedMessage = message.trim();
    const moderationResult = await moderateContent(trimmedMessage);
    if (!moderationResult.safe) {
      logModerationRejection({
        userId: req.user!.id,
        category: moderationResult.category,
        content: trimmedMessage,
      });

      return res.json({ reply: MODERATION_REFUSAL_MESSAGE });
    }

    const resolvedPreferredLanguage = await getPreferredLanguage(req.user!.id);

    const historyMessages = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter(
            (item): item is { role: "user" | "assistant"; content: string } =>
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string" &&
              Boolean(item.content.trim()),
          )
          .map((item) => ({
            role: item.role,
            content: item.content.trim(),
          }))
      : [];

    const language = normalizePreferredLanguage(resolvedPreferredLanguage);
    const completion = await azureOpenAIClient.chat.completions.create({
      model: azureOpenAIModel,
      messages: [
        {
          role: "system",
          content: `${GLOBAL_ASSISTANT_SYSTEM_PROMPT}\n\nThe user's preferred language is ${language}. Respond in ${language}.`,
        },
        ...historyMessages,
        {
          role: "user",
          content: trimmedMessage,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "I couldn't generate a response right now. Please try again.";

    return res.json({ reply });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("GLOBAL CHAT ERROR:", {
      userId: req.user?.id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({ error: `Failed to process global chat message: ${errorMessage}` });
  }
});

router.post("/:noteId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const noteId = String(req.params.noteId || "");
    const { message, preferredLanguage } = req.body as {
      message?: string;
      preferredLanguage?: string;
    };

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const trimmedMessage = message.trim();
    const moderationResult = await moderateContent(trimmedMessage);
    if (!moderationResult.safe) {
      logModerationRejection({
        userId: req.user!.id,
        category: moderationResult.category,
        content: trimmedMessage,
      });

      const nowIso = new Date().toISOString();
      return res.json({
        userMessage: {
          id: `blocked-user-${Date.now()}`,
          noteId,
          userId: req.user!.id,
          role: "user",
          content: trimmedMessage,
          createdAt: nowIso,
        },
        assistantMessage: {
          id: `blocked-assistant-${Date.now()}`,
          noteId,
          userId: req.user!.id,
          role: "assistant",
          content: MODERATION_REFUSAL_MESSAGE,
          createdAt: nowIso,
        },
      });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user!.id,
      },
      select: {
        id: true,
        rawText: true,
      },
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const userMessage = await prisma.chatMessage.create({
      data: {
        noteId,
        userId: req.user!.id,
        role: "user",
        content: trimmedMessage,
      },
    });

    const historyRows = await prisma.chatMessage.findMany({
      where: {
        noteId,
        userId: req.user!.id,
        id: {
          not: userMessage.id,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        role: true,
        content: true,
      },
    });

    const conversationHistory: AIChatMessage[] = historyRows
      .filter(
        (entry): entry is typeof entry & { role: "user" | "assistant" } =>
          entry.role === "user" || entry.role === "assistant",
      )
      .map((entry) => ({
        role: entry.role,
        content: entry.content,
      }));

    const resolvedPreferredLanguage = preferredLanguage?.trim()
      ? normalizePreferredLanguage(preferredLanguage)
      : await getPreferredLanguage(req.user!.id);

    const assistantResponse = await chatWithNotes(
      note.rawText,
      trimmedMessage,
      conversationHistory,
      resolvedPreferredLanguage,
    );

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        noteId,
        userId: req.user!.id,
        role: "assistant",
        content: assistantResponse,
      },
    });

    return res.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("CHAT MESSAGE ERROR:", {
      noteId: req.params.noteId,
      userId: req.user?.id,
      error: errorMessage,
      stack: errorStack,
    });
    return res.status(500).json({ error: `Failed to process chat message: ${errorMessage}` });
  }
});

router.delete("/:noteId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const noteId = String(req.params.noteId || "");

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: req.user!.id,
      },
      select: { id: true },
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await prisma.chatMessage.deleteMany({
      where: {
        noteId,
        userId: req.user!.id,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("CLEAR CHAT ERROR:", error);
    return res.status(500).json({ error: "Failed to clear chat history" });
  }
});

export default router;
