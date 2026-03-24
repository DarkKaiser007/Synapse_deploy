import type { PerformanceData } from "./quizzes";

export const PERFORMANCE_CACHE_KEY = "synapse_performance_cache";
export const PERFORMANCE_CACHE_TIME_KEY = "synapse_performance_cache_time";
export const FATIGUE_CACHE_KEY = "synapse_fatigue_cache";
export const FATIGUE_CACHE_TIME_KEY = "synapse_fatigue_cache_time";
export const FORGETTING_CURVE_CACHE_KEY = "synapse_forgetting_curve_cache";
export const FORGETTING_CURVE_CACHE_TIME_KEY = "synapse_forgetting_curve_cache_time";

export const PERFORMANCE_CACHE_FRESH_MS = 5 * 60 * 1000;
export const PERFORMANCE_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const PERFORMANCE_RELATED_CACHE_KEYS = [
  [PERFORMANCE_CACHE_KEY, PERFORMANCE_CACHE_TIME_KEY],
  [FATIGUE_CACHE_KEY, FATIGUE_CACHE_TIME_KEY],
  [FORGETTING_CURVE_CACHE_KEY, FORGETTING_CURVE_CACHE_TIME_KEY],
] as const;

export function readCacheEntry<T>(cacheKey: string, timeKey: string): { data: T; cachedAt: number } | null {
  try {
    const rawData = localStorage.getItem(cacheKey);
    const rawTime = localStorage.getItem(timeKey);

    if (!rawData || !rawTime) return null;

    const cachedAt = Number(rawTime);
    if (Number.isNaN(cachedAt)) return null;

    const data = JSON.parse(rawData) as T;
    return { data, cachedAt };
  } catch {
    return null;
  }
}

export function writeCacheEntry<T>(cacheKey: string, timeKey: string, data: T) {
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(timeKey, Date.now().toString());
}

export function clearCacheEntry(cacheKey: string, timeKey: string) {
  localStorage.removeItem(cacheKey);
  localStorage.removeItem(timeKey);
}

export function readPerformanceCache(): { data: PerformanceData; cachedAt: number } | null {
  return readCacheEntry<PerformanceData>(PERFORMANCE_CACHE_KEY, PERFORMANCE_CACHE_TIME_KEY);
}

export function writePerformanceCache(data: PerformanceData) {
  writeCacheEntry(PERFORMANCE_CACHE_KEY, PERFORMANCE_CACHE_TIME_KEY, data);
}

export function clearPerformanceCache() {
  clearCacheEntry(PERFORMANCE_CACHE_KEY, PERFORMANCE_CACHE_TIME_KEY);
}

export function clearAllPerformanceCache() {
  for (const [cacheKey, timeKey] of PERFORMANCE_RELATED_CACHE_KEYS) {
    clearCacheEntry(cacheKey, timeKey);
  }
}

export function isCacheTooOld(cachedAt: number) {
  return Date.now() - cachedAt > PERFORMANCE_CACHE_MAX_AGE_MS;
}

export function isCacheFresh(cachedAt: number) {
  return Date.now() - cachedAt < PERFORMANCE_CACHE_FRESH_MS;
}
