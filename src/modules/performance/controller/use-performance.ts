"use client";

import { useEffect, useState } from "react";
import type { ProfileScoreData } from "@/src/types/api";
import { fetchPerformanceData } from "@/src/modules/performance/model/performance-api";
import { ApiError } from "@/src/lib/api-client";

export function usePerformance() {
  const [data, setData] = useState<ProfileScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchPerformanceData()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isSubscriptionRequired) {
          setLocked(true);
        } else {
          setError((err as Error).message ?? "Erro.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, locked, error };
}
