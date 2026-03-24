import { apiRequest } from "./api";
import { clearAllPerformanceCache } from "./performanceCache";

export interface QuizListItem {
  id: string;
  createdAt: string;
  subjectName: string;
  noteTitle: string;
  questionCount: number;
  bestScore: number | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizDetail {
  id: string;
  createdAt: string;
  note?: {
    title: string;
  };
  subject?: {
    name: string;
  };
  questions: QuizQuestion[];
}

export interface PerformanceData {
  totalQuizzes: number;
  averageScore: number;
  bestSubject: string;
  weakestSubject: string;
  scoreOverTime: { date: string; score: number }[];
  scoreBySubject: { subject: string; averageScore: number; totalQuizzes: number }[];
  topicBreakdown: { topic: string; correct: number; incorrect: number }[];
  aiAnalysis: string;
  quizBreakdown: QuizBreakdownItem[];
  scoreDistribution: { range: string; count: number }[];
}

export interface BrainFatigueData {
  byHour: { hour: number; averageScore: number; attempts: number }[];
  byDay: { day: string; averageScore: number; attempts: number }[];
  peakHour: number;
  worstHour: number;
  peakDay: string;
  worstDay: string;
  fatigueDropPercent: number;
  aiInsight?: string;
  aiInsights?: string;
  totalAttempts?: number;
}

export interface ForgettingCurveData {
  subjects: {
    subject: string;
    latestScore: number;
    daysSinceLastAttempt: number;
    forgettingRate: number;
    predictedScoreTomorrow: number;
    predictedScoreIn7Days: number;
    status: "fresh" | "fading" | "critical" | "forgotten";
    allAttempts: { date: string; score: number }[];
  }[];
  mostAtRisk: string | null;
  aiInsight: string;
}

export interface QuizBreakdownItem {
  quizId: string;
  subject: string;
  noteTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  wrongTopics: string[];
  aiInsight: string;
}

export async function fetchQuizzes() {
  return apiRequest("/quizzes") as Promise<QuizListItem[]>;
}

export async function fetchQuizById(quizId: string) {
  return apiRequest(`/quizzes/${quizId}`) as Promise<QuizDetail>;
}

export async function saveQuizAttempt(
  quizId: string,
  payload: { answers: number[]; score: number },
) {
  const result = (await apiRequest(`/quizzes/${quizId}/attempt`, "POST", payload)) as {
    score: number;
  };

  // Ensure analytics refresh after a newly completed quiz attempt.
  clearAllPerformanceCache();

  return result;
}

export async function fetchBrainFatigue() {
  return apiRequest("/quizzes/brain-fatigue") as Promise<BrainFatigueData>;
}

export async function fetchPerformance() {
  return apiRequest("/quizzes/performance") as Promise<PerformanceData>;
}

export async function fetchForgettingCurve() {
  return apiRequest("/quizzes/forgetting-curve") as Promise<ForgettingCurveData>;
}
