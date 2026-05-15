"use client";

import dynamic from "next/dynamic";

const TrainingSessionScreen = dynamic(
  () =>
    import(
      "@/src/modules/training/view/screens/training-session-screen"
    ).then((m) => ({ default: m.TrainingSessionScreen })),
  { ssr: false }
);

interface Props {
  disciplina: string;
  subcategoria: string;
}

export function SessaoPageClient({ disciplina, subcategoria }: Props) {
  return <TrainingSessionScreen disciplina={disciplina} subcategoria={subcategoria} />;
}
