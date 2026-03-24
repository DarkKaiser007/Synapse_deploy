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

export function usePerformanceData() {
  return useCachedSWRData<PerformanceData>({
    cacheKey: PERFORMANCE_CACHE_KEY,
    cacheTimeKey: PERFORMANCE_CACHE_TIME_KEY,
    fetcher: fetchPerformance,
  });
}

export function useBrainFatigueData() {
  return useCachedSWRData<BrainFatigueData>({
    cacheKey: FATIGUE_CACHE_KEY,
    cacheTimeKey: FATIGUE_CACHE_TIME_KEY,
    fetcher: fetchBrainFatigue,
  });
}

export function useForgettingCurveData() {
  return useCachedSWRData<ForgettingCurveData>({
    cacheKey: FORGETTING_CURVE_CACHE_KEY,
    cacheTimeKey: FORGETTING_CURVE_CACHE_TIME_KEY,
    fetcher: fetchForgettingCurve,
  });
}
