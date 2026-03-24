import { useState } from "react";
import {
  fetchBrainFatigue,
  fetchForgettingCurve,
  fetchPerformance,
  type BrainFatigueData,
  type ForgettingCurveData,
  type PerformanceData,
} from "../services/quizzes";
import {
  FATIGUE_CACHE_KEY,
  FATIGUE_CACHE_TIME_KEY,
  FORGETTING_CURVE_CACHE_KEY,
  FORGETTING_CURVE_CACHE_TIME_KEY,
  PERFORMANCE_CACHE_KEY,
  PERFORMANCE_CACHE_TIME_KEY,
} from "../services/performanceCache";
import { useCachedSWRData } from "./useCachedSWRData";

// Hardcoded mock data for Brain Fatigue Detector
const MOCK_BRAIN_FATIGUE_DATA: BrainFatigueData = {
  totalAttempts: 42,
  peakHour: 9,
  worstHour: 14,
  peakDay: "Monday",
  worstDay: "Friday",
  fatigueDropPercent: 28,
  aiInsights: "Your performance data shows a clear circadian rhythm pattern. You're most alert between 9-11 AM, with peak cognitive performance reaching 92%. However, post-lunch fatigue hits around 2-3 PM where your scores drop to 64%. The 28% performance drop suggests significant afternoon slump. **Recommendation:** Schedule your hardest subjects for morning study sessions, especially challenging topics like advanced calculus. Use afternoons for lighter review or physical breaks. Your performance also peaks on Mondays and early week days, so tackle complex material then. Interestingly, your performance stabilizes again after 6 PM, making evenings suitable for secondary review.",
  byHour: [
    { hour: 6, averageScore: 68, attempts: 2 },
    { hour: 7, averageScore: 72, attempts: 3 },
    { hour: 8, averageScore: 85, attempts: 5 },
    { hour: 9, averageScore: 92, attempts: 8 },
    { hour: 10, averageScore: 88, attempts: 6 },
    { hour: 11, averageScore: 85, attempts: 4 },
    { hour: 12, averageScore: 78, attempts: 3 },
    { hour: 13, averageScore: 71, attempts: 2 },
    { hour: 14, averageScore: 64, attempts: 4 },
    { hour: 15, averageScore: 67, attempts: 3 },
    { hour: 16, averageScore: 75, attempts: 5 },
    { hour: 17, averageScore: 79, attempts: 4 },
    { hour: 18, averageScore: 82, attempts: 6 },
    { hour: 19, averageScore: 80, attempts: 3 },
    { hour: 20, averageScore: 77, attempts: 2 },
    { hour: 21, averageScore: 73, attempts: 2 },
    { hour: 22, averageScore: 70, attempts: 1 },
  ],
  byDay: [
    { day: "Sunday", averageScore: 76, attempts: 4 },
    { day: "Monday", averageScore: 89, attempts: 9 },
    { day: "Tuesday", averageScore: 87, attempts: 8 },
    { day: "Wednesday", averageScore: 83, attempts: 7 },
    { day: "Thursday", averageScore: 79, attempts: 5 },
    { day: "Friday", averageScore: 73, attempts: 5 },
    { day: "Saturday", averageScore: 74, attempts: 4 },
  ],
};

// Hardcoded mock data for Forgetting Curve Tracker
const MOCK_FORGETTING_CURVE_DATA: ForgettingCurveData = {
  subjects: [
    {
      subject: "General",
      latestScore: 92,
      daysSinceLastAttempt: 2,
      forgettingRate: 0.15,
      predictedScoreTomorrow: 85,
      predictedScoreIn7Days: 72,
      status: "fresh",
      allAttempts: [
        { date: "2026-03-10", score: 78 },
        { date: "2026-03-15", score: 85 },
        { date: "2026-03-20", score: 88 },
        { date: "2026-03-22", score: 92 },
      ],
    },
    {
      subject: "DSA",
      latestScore: 78,
      daysSinceLastAttempt: 5,
      forgettingRate: 0.22,
      predictedScoreTomorrow: 70,
      predictedScoreIn7Days: 58,
      status: "fading",
      allAttempts: [
        { date: "2026-03-05", score: 82 },
        { date: "2026-03-12", score: 80 },
        { date: "2026-03-17", score: 79 },
        { date: "2026-03-19", score: 78 },
      ],
    },
    {
      subject: "History",
      latestScore: 65,
      daysSinceLastAttempt: 9,
      forgettingRate: 0.28,
      predictedScoreTomorrow: 62,
      predictedScoreIn7Days: 48,
      status: "critical",
      allAttempts: [
        { date: "2026-03-08", score: 85 },
        { date: "2026-03-13", score: 78 },
        { date: "2026-03-18", score: 71 },
        { date: "2026-03-15", score: 65 },
      ],
    },
    {
      subject: "Hindi",
      latestScore: 52,
      daysSinceLastAttempt: 15,
      forgettingRate: 0.35,
      predictedScoreTomorrow: 48,
      predictedScoreIn7Days: 35,
      status: "forgotten",
      allAttempts: [
        { date: "2026-03-01", score: 88 },
        { date: "2026-03-08", score: 76 },
        { date: "2026-03-12", score: 64 },
        { date: "2026-03-09", score: 52 },
      ],
    },
  ],
  mostAtRisk: "Hindi",
  aiInsight: "Your forgetting curve analysis reveals different retention patterns across subjects. General shows excellent retention with a 15% forgetting rate—keep this momentum with spaced review every 7 days. **Critical Priority:** History is at risk with a 28% forgetting rate and 9 days since last attempt. Without immediate review, your History score will drop to 48% in 7 days. **Urgent Action:** Hindi requires immediate re-engagement (15 days since review, expected score: 35%). The rapid decline suggests the material wasn't deeply encoded. **Recommendation:** Implement spaced repetition: Review History today, then in 3 days, then 7 days. For Hindi, consider a different learning approach—active recall, flashcards, or teaching the material to someone else.",
};


export function usePerformanceData() {
  return useCachedSWRData<PerformanceData>({
    cacheKey: PERFORMANCE_CACHE_KEY,
    cacheTimeKey: PERFORMANCE_CACHE_TIME_KEY,
    fetcher: fetchPerformance,
  });
}

export function useBrainFatigueData() {
  // Return mocked data for presentation
  const [data] = useState<BrainFatigueData>(MOCK_BRAIN_FATIGUE_DATA);
  return { 
    data, 
    isLoading: false, 
    isRevalidating: false, 
    error: null 
  };
}

export function useForgettingCurveData() {
  // Return mocked data for presentation
  const [data] = useState<ForgettingCurveData>(MOCK_FORGETTING_CURVE_DATA);
  return { 
    data, 
    isLoading: false, 
    isRevalidating: false, 
    error: null 
  };
}
