import { api } from "@/src/lib/api-client";
import type { ProfileScoreData } from "@/src/types/api";

export function fetchProfileData() {
  return api.get<ProfileScoreData>("/users/profile");
}

export function selectAvatar(seed: string) {
  return api.post<void>("/users/avatar/select", { seed });
}

export function deleteAccount() {
  return api.delete<void>("/users/account");
}
