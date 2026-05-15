"use client";

import { useEffect, useState, useCallback } from "react";
import type { StudyPlanData } from "@/src/types/api";
import { fetchStudyPlan, saveStudyPlan } from "@/src/modules/study-plan/model/study-plan-api";
import { ApiError } from "@/src/lib/api-client";

export function useStudyPlan() {
  const [data, setData] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchStudyPlan()
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

  const save = useCallback(async (payload: Partial<StudyPlanData>) => {
    setSaving(true);
    try {
      const updated = await saveStudyPlan(payload);
      setData(updated);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }, []);

  return { data, loading, saving, locked, error, save };
}
