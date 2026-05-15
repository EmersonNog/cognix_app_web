"use client";

import dynamic from "next/dynamic";

const PerformanceScreen = dynamic(
  () =>
    import("@/src/modules/performance/view/screens/performance-screen").then(
      (m) => ({ default: m.PerformanceScreen })
    ),
  { ssr: false }
);

export function DesempenhoPageClient() {
  return <PerformanceScreen />;
}
