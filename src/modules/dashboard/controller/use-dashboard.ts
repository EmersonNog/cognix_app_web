"use client";

import { useEffect, useState } from "react";
import type { HomeRecommendationsData, ProfileScoreData } from "@/src/types/api";
import { fetchProfile, fetchRecommendations } from "@/src/modules/dashboard/model/dashboard-api";
import { ApiError } from "@/src/lib/api-client";

export function useDashboard() {
  const [profile, setProfile] = useState<ProfileScoreData | null>(null);
  const [recommendations, setRecommendations] = useState<HomeRecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([fetchProfile(), fetchRecommendations()])
      .then(([p, r]) => {
        if (cancelled) return;
        setProfile(p);
        setRecommendations(r);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isSubscriptionRequired) {
          setLocked(true);
        } else {
          setError((err as Error).message ?? "Erro ao carregar dados.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { profile, recommendations, loading, locked, error };
}
