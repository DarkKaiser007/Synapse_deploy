import express from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Mock notes store
const notes: any[] = [];

router.post('/text', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rawText, subjectId } = req.body;
    const userId = req.user.id;

    const note = {
      id: (notes.length + 1).toString(),
      userId,
      subjectId,
      rawText,
      extractedText: null,
      sourceType: 'TYPED',
      fileUrl: null,
      createdAt: new Date(),
    };
    notes.push(note);

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const userNotes = notes.filter(n => n.userId === userId);
    res.json(userNotes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    notes.splice(index, 1);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;