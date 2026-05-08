"use client";

import dynamic from "next/dynamic";

const LoginScreen = dynamic(
  () =>
    import("@/src/modules/auth/view/screens/login-screen").then((m) => ({
      default: m.LoginScreen,
    })),
  { ssr: false }
);

export function LoginPageClient() {
  return <LoginScreen />;
}
