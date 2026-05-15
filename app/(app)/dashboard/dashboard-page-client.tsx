"use client";

import dynamic from "next/dynamic";

const DashboardScreen = dynamic(
  () =>
    import("@/src/modules/dashboard/view/screens/dashboard-screen").then(
      (m) => ({ default: m.DashboardScreen })
    ),
  { ssr: false }
);

export function DashboardPageClient() {
  return <DashboardScreen />;
}
