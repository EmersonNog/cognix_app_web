import { api } from "@/src/lib/api-client";
import type { ProfileScoreData } from "@/src/types/api";

export function fetchPerformanceData() {
  return api.get<ProfileScoreData>("/users/profile");
}
