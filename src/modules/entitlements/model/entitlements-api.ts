import { api } from "@/src/lib/api-client";
import type { EntitlementStatus } from "@/src/types/api";

export function fetchEntitlements() {
  return api.get<EntitlementStatus>("/entitlements/current");
}

export function startTrial() {
  return api.post<EntitlementStatus>("/entitlements/trial/start");
}
