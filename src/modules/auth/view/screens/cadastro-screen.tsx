"use client";

import Link from "next/link";
import { useSignUp } from "@/src/modules/auth/controller/use-sign-up";
import { AUTH_ROUTES } from "@/src/modules/auth/model/auth-routes";
import { AuthInput } from "@/src/modules/auth/view/components/auth-input";
import { GoogleButton } from "@/src/modules/auth/view/components/google-button";
import { PasswordInput } from "@/src/modules/auth/view/components/password-input";

export function CadastroScreen() {
  const ctrl = useSignUp();

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-[20px] bg-surface p-8 shadow-[0_8px_40px_rgba(92,99,230,0.10)]">
        <div className="mb-7 text-center">
          <span className="text-[2rem] font-black tracking-tight text-primary">Cognix</span>
          <p className="mt-1 text-sm text-muted">Crie sua conta grátis</p>
        </div>

        <form onSubmit={ctrl.handleSubmit} className="grid gap-3">
          <AuthInput
            type="text"
            placeholder="Nome completo"
            value={ctrl.name}
            onChange={(e) => ctrl.setName(e.target.value)}
            required
            autoComplete="name"
          />

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
            autoComplete="new-password"
            visible={ctrl.showPassword}
            onToggle={ctrl.togglePasswordVisibility}
          />

          <PasswordInput
            placeholder="Confirmar senha"
            value={ctrl.confirm}
            onChange={(e) => ctrl.setConfirm(e.target.value)}
            autoComplete="new-password"
            visible={ctrl.showConfirm}
            onToggle={ctrl.toggleConfirmVisibility}
          />

          {ctrl.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {ctrl.error}
            </p>
          )}

          <button
            type="submit"
            disabled={ctrl.loading}
            className="mt-1 w-full rounded-[14px] bg-gradient-to-br from-primary to-primary-dim py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(92,99,230,0.22)] transition hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(92,99,230,0.28)] disabled:opacity-60"
          >
            {ctrl.loading ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-[0.68rem] font-bold uppercase tracking-widest text-muted">
            ou continue com
          </span>
        </div>

        <GoogleButton onClick={ctrl.handleGoogle} disabled={ctrl.loading} />

        <p className="mt-5 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href={AUTH_ROUTES.login} className="font-bold text-primary">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
