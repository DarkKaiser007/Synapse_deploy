import { Request, Response } from "express";
import prisma from "../prisma";

export const generateStudyPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const exams = await prisma.exam.findMany({
      where: { userId },
      orderBy: { examDate: "asc" },
    });

    if (!exams.length) {
      return res.status(404).json({ message: "No exams found for this user" });
    }

    const today = new Date();

    const difficultyWeight: Record<string, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    const tasks: any[] = [];

    for (const exam of exams) {
      const examDate = new Date(exam.examDate);

      const daysUntilExam = Math.ceil(
        (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExam <= 0) continue;

      const weight = difficultyWeight[exam.difficulty.toLowerCase()] ?? 1;

      const sessions = weight * 3;

      const priority = weight / daysUntilExam;

      tasks.push({
        subject: exam.subject,
        sessions,
        priority,
        examDate,
      });
    }

    tasks.sort((a, b) => b.priority - a.priority);

    const lastExamDate = new Date(
      Math.max(...exams.map((e) => new Date(e.examDate).getTime())),
    );

    const calendar: any[] = [];

    const dateCursor = new Date(today);

    while (dateCursor <= lastExamDate) {
      calendar.push({
        date: new Date(dateCursor),
        sessions: [],
      });

      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    const MAX_SESSIONS_PER_DAY = 2;

    for (const task of tasks) {
      let sessionsLeft = task.sessions;

      for (const day of calendar) {
        if (sessionsLeft === 0) break;

        if (day.date >= task.examDate) continue;

        if (day.sessions.length >= MAX_SESSIONS_PER_DAY) continue;

        day.sessions.push(task.subject);

        sessionsLeft--;
      }
    }

    const studyPlan = calendar
      .filter((day) => day.sessions.length > 0)
      .map((day) => ({
        date: day.date.toISOString().split("T")[0],
        subjects: day.sessions,
      }));

    return res.status(200).json({
      message: "Study plan generated successfully",
      studyPlan,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error generating study plan",
    });
  }
};
