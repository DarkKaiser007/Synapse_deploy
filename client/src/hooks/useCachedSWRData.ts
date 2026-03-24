import { useEffect, useState } from "react";
import {
  isCacheTooOld,
  readCacheEntry,
  writeCacheEntry,
} from "../services/performanceCache";

interface UseCachedSWRDataOptions<T> {
  cacheKey: string;
  cacheTimeKey: string;
  fetcher: () => Promise<T>;
}

function areEqual<T>(a: T | null, b: T) {
  if (!a) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function useCachedSWRData<T>({ cacheKey, cacheTimeKey, fetcher }: UseCachedSWRDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const cached = readCacheEntry<T>(cacheKey, cacheTimeKey);
      const hasUsableCache = Boolean(cached) && !isCacheTooOld(cached!.cachedAt);

      if (hasUsableCache) {
        setData(cached!.data);
        setIsLoading(false);
        setIsRevalidating(true);
        setError(null);
      } else {
        setData(null);
        setIsLoading(true);
        setIsRevalidating(false);
        setError(null);
      }

      try {
        const fresh = await fetcher();
        if (cancelled) return;

        setData((prev) => (areEqual(prev, fresh) ? prev : fresh));
        writeCacheEntry(cacheKey, cacheTimeKey, fresh);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Error fetching ${cacheKey}:`, error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRevalidating(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, cacheTimeKey, fetcher]);

  return { data, isLoading, isRevalidating, error };
}
