import express from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import {
  simplifyText,
  summarizeText,
  generateQuiz,
} from "../services/aiService";

const router = express.Router();

router.post("/simplify", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    const result = await simplifyText(content);

    res.json({ result });
  } catch (error) {
    console.error("SIMPLIFY ERROR:", error);
    res.status(500).json({ error: "Failed to simplify content" });
  }
});

router.post("/summarize", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    const result = await summarizeText(content);

    res.json({ result });
  } catch (error) {
    console.error("SUMMARIZE ERROR:", error);
    res.status(500).json({ error: "Failed to summarize content" });
  }
});

router.post("/generate-quiz", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    const result = await generateQuiz(content);

    res.json({ result });
  } catch (error) {
    console.error("QUIZ ERROR:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

export default router;
