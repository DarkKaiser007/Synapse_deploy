export interface User {
  id: string;
  name: string;
  email: string;
  institution?: string;
  grade?: string;
  language: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  examDate?: Date;
  confidenceLevel: number;
}

export interface Note {
  id: string;
  userId: string;
  subjectId?: string;
  rawText: string;
  extractedText?: string;
  sourceType: 'TYPED' | 'IMAGE' | 'AUDIO' | 'PDF';
  fileUrl?: string;
  createdAt: Date;
}

export interface Quiz {
  id: string;
  noteId: string;
  userId: string;
  subjectId?: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  answers: number[];
  completedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  durationMinutes: number;
  type: 'POMODORO' | 'MANUAL';
  date: Date;
}

export interface StudyPlan {
  id: string;
  userId: string;
  planData: StudyPlanData;
  generatedAt: Date;
  updatedAt: Date;
}

export interface StudyPlanData {
  weeks: StudyWeek[];
}

export interface StudyWeek {
  weekNumber: number;
  days: StudyDay[];
}

export interface StudyDay {
  day: string;
  blocks: StudyBlock[];
}

export interface StudyBlock {
  subject: string;
  duration: number;
  type: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface HeatmapData {
  date: string;
  minutes: number;
}