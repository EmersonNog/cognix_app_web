"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { syncUser } from "@/src/modules/auth/model/auth-api";
import { authErrorMessage } from "@/src/modules/auth/model/auth-errors";
import { googleProvider } from "@/src/modules/auth/model/auth-providers";
import { AUTH_ROUTES } from "@/src/modules/auth/model/auth-routes";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function useSignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await syncUser(await cred.user.getIdToken(true));
      router.push(AUTH_ROUTES.dashboard);
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
      if (!cred.user.displayName) {
        const fallback = cred.user.email?.split("@")[0] ?? "Usuário";
        await updateProfile(cred.user, { displayName: fallback });
      }
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

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    showPassword,
    togglePasswordVisibility: () => setShowPassword((v) => !v),
    showConfirm,
    toggleConfirmVisibility: () => setShowConfirm((v) => !v),
    error,
    loading,
    handleSubmit,
    handleGoogle,
  } as const;
}
