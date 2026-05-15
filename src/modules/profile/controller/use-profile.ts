"use client";

import { useEffect, useState, useCallback } from "react";
import type { ProfileScoreData } from "@/src/types/api";
import { fetchProfileData, selectAvatar } from "@/src/modules/profile/model/profile-api";
import { ApiError } from "@/src/lib/api-client";

export function useProfile() {
  const [data, setData] = useState<ProfileScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [equipping, setEquipping] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchProfileData()
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

  const equipAvatar = useCallback(async (seed: string) => {
    if (!data) return;
    setEquipping(seed);
    try {
      await selectAvatar(seed);
      setData((prev) => prev ? { ...prev, equippedAvatarSeed: seed } : prev);
    } finally {
      setEquipping("");
    }
  }, [data]);

  return { data, loading, locked, error, equipping, equipAvatar };
}
