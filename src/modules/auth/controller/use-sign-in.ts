"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { syncUser } from "@/src/modules/auth/model/auth-api";
import { authErrorMessage } from "@/src/modules/auth/model/auth-errors";
import { googleProvider } from "@/src/modules/auth/model/auth-providers";
import { AUTH_ROUTES } from "@/src/modules/auth/model/auth-routes";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export type SignInMode = "login" | "reset";

export function useSignIn() {
  const router = useRouter();
  const [mode, setMode] = useState<SignInMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!EMAIL_REGEX.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await syncUser(await cred.user.getIdToken(true));
      router.push(AUTH_ROUTES.dashboard);
    } catch (err: unknown) {
      setError(authErrorMessage((err as { code?: string }).code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!EMAIL_REGEX.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Link de redefinição enviado. Verifique seu e-mail.");
    } catch (err: unknown) {
      setError(authErrorMessage((err as { code?: string }).code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncUser(await cred.user.getIdToken(true));
      router.push(AUTH_ROUTES.dashboard);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (!code.includes("popup-closed-by-user")) {
        setError(authErrorMessage(code));
      }
    } finally {
      setLoading(false);
    }
  }

  function enterResetMode() {
    setMode("reset");
    setError("");
    setSuccess("");
    setPassword("");
  }

  function backToLogin() {
    setMode("login");
    setError("");
    setSuccess("");
  }

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility: () => setShowPassword((v) => !v),
    error,
    success,
    loading,
    handleLogin,
    handleReset,
    handleGoogle,
    enterResetMode,
    backToLogin,
  } as const;
}
