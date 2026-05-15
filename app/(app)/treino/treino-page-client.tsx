"use client";

import dynamic from "next/dynamic";

const TrainingAreasScreen = dynamic(
  () =>
    import(
      "@/src/modules/training/view/screens/training-areas-screen"
    ).then((m) => ({ default: m.TrainingAreasScreen })),
  { ssr: false }
);

export function TreinoPageClient() {
  return <TrainingAreasScreen />;
}
