"use client";

import dynamic from "next/dynamic";

const CadastroScreen = dynamic(
  () =>
    import("@/src/modules/auth/view/screens/cadastro-screen").then((m) => ({
      default: m.CadastroScreen,
    })),
  { ssr: false }
);

export function CadastroPageClient() {
  return <CadastroScreen />;
}
