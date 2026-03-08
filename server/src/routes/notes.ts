import express from "express";
import prisma from "../prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = express.Router();

// CREATE NOTE
router.post("/text", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, rawText, subjectId } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: "Content required" });
    }

    const note = await prisma.note.create({
      data: {
        userId: req.user!.id,
        title: title || rawText.substring(0, 50),
        rawText,
        subjectId: subjectId || null,
        sourceType: "TYPED",
      },
      include: {
        subject: true,
      },
    });

    res.json(note);
  } catch (error) {
    console.error("CREATE NOTE ERROR:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// GET USER NOTES
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(notes);
  } catch (error) {
    console.error("FETCH NOTES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// GET SINGLE NOTE
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("FETCH NOTE ERROR:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// DELETE NOTE
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.note.delete({
      where: {
        id: req.params.id as string,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
