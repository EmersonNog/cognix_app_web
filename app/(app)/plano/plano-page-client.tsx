"use client";

import dynamic from "next/dynamic";

const StudyPlanScreen = dynamic(
  () =>
    import("@/src/modules/study-plan/view/screens/study-plan-screen").then(
      (m) => ({ default: m.StudyPlanScreen })
    ),
  { ssr: false }
);

export function PlanoPageClient() {
  return <StudyPlanScreen />;
}
