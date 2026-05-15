"use client";

import { useEffect, useState, useCallback } from "react";
import type { EntitlementStatus } from "@/src/types/api";
import { fetchEntitlements, startTrial } from "@/src/modules/entitlements/model/entitlements-api";

export function useEntitlements() {
  const [status, setStatus] = useState<EntitlementStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchEntitlements()
      .then((s) => { if (!cancelled) setStatus(s); })
      .catch((err: unknown) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const activate = useCallback(async () => {
    setActivating(true);
    setError("");
    try {
      const updated = await startTrial();
      setStatus(updated);
      // Full page refresh so locked content loads correctly
      if (updated.hasFullAccess) {
        window.location.reload();
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? "Não foi possível ativar agora.");
    } finally {
      setActivating(false);
    }
  }, []);

  return { status, loading, activating, error, activate };
}
