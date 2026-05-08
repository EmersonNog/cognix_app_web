"use client";

import Link from "next/link";
import { useSignIn } from "@/src/modules/auth/controller/use-sign-in";
import { AUTH_ROUTES } from "@/src/modules/auth/model/auth-routes";
import { AuthInput } from "@/src/modules/auth/view/components/auth-input";
import { GoogleButton } from "@/src/modules/auth/view/components/google-button";
import { PasswordInput } from "@/src/modules/auth/view/components/password-input";

export function LoginScreen() {
  const ctrl = useSignIn();

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-[20px] bg-surface p-8 shadow-[0_8px_40px_rgba(92,99,230,0.10)]">
        {ctrl.mode === "reset" ? (
          <ResetView ctrl={ctrl} />
        ) : (
          <LoginView ctrl={ctrl} />
        )}
      </div>
    </div>
  );
}

function LoginView({ ctrl }: { ctrl: ReturnType<typeof useSignIn> }) {
  return (
    <>
      <Header subtitle="Bem-vindo de volta" />

      <form onSubmit={ctrl.handleLogin} className="grid gap-3">
        <AuthInput
          type="email"
          placeholder="E-mail"
          value={ctrl.email}
          onChange={(e) => ctrl.setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <PasswordInput
          placeholder="Senha"
          value={ctrl.password}
          onChange={(e) => ctrl.setPassword(e.target.value)}
          autoComplete="current-password"
          visible={ctrl.showPassword}
          onToggle={ctrl.togglePasswordVisibility}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={ctrl.enterResetMode}
            className="text-xs font-semibold text-muted hover:text-primary"
          >
            Esqueceu a senha?
          </button>
        </div>

        <ErrorMessage message={ctrl.error} />

        <SubmitButton loading={ctrl.loading} label="Entrar" loadingLabel="Entrando…" />
      </form>

      <Divider />

      <GoogleButton onClick={ctrl.handleGoogle} disabled={ctrl.loading} />

      <p className="mt-5 text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link href={AUTH_ROUTES.cadastro} className="font-bold text-primary">
          Criar conta
        </Link>
      </p>
    </>
  );
}

function ResetView({ ctrl }: { ctrl: ReturnType<typeof useSignIn> }) {
  return (
    <>
      <Header subtitle="Redefinir senha" />

      <form onSubmit={ctrl.handleReset} className="grid gap-3">
        <p className="text-sm text-muted">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <AuthInput
          type="email"
          placeholder="E-mail"
          value={ctrl.email}
          onChange={(e) => ctrl.setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <ErrorMessage message={ctrl.error} />

        {ctrl.success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
            {ctrl.success}
          </p>
        )}

        <SubmitButton
          loading={ctrl.loading}
          disabled={!!ctrl.success}
          label="Enviar link"
          loadingLabel="Enviando…"
        />
      </form>

      <button
        onClick={ctrl.backToLogin}
        className="mt-5 flex w-full items-center justify-center gap-1 text-sm font-semibold text-muted"
      >
        <ChevronLeft /> Voltar ao login
      </button>
    </>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div className="mb-7 text-center">
      <span className="text-[2rem] font-black tracking-tight text-primary">Cognix</span>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
      <span className="text-[0.68rem] font-bold uppercase tracking-widest text-muted">
        ou continue com
      </span>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{message}</p>
  );
}

function SubmitButton({
  loading,
  disabled,
  label,
  loadingLabel,
}: {
  loading: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="mt-1 w-full rounded-[14px] bg-gradient-to-br from-primary to-primary-dim py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(92,99,230,0.22)] transition hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(92,99,230,0.28)] disabled:opacity-60"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
