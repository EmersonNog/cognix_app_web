"use client";

import dynamic from "next/dynamic";

const ProfileScreen = dynamic(
  () =>
    import("@/src/modules/profile/view/screens/profile-screen").then(
      (m) => ({ default: m.ProfileScreen })
    ),
  { ssr: false }
);

export function PerfilPageClient() {
  return <ProfileScreen />;
}
