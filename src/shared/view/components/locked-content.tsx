"use client";

import { useEntitlements } from "@/src/modules/entitlements/controller/use-entitlements";
import { Spinner } from "@/src/shared/view/components/spinner";

const FEATURES = [
  { icon: "📚", label: "Treino por categoria" },
  { icon: "📊", label: "Análise de desempenho" },
  { icon: "📅", label: "Plano de estudos semanal" },
  { icon: "🏆", label: "Multiplayer competitivo" },
  { icon: "🤖", label: "Resumos com IA" },
  { icon: "✍️", label: "Redação com feedback" },
];

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function LockedContent() {
  const { status, loading, activating, error, activate } = useEntitlements();

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-md">
        {/* Background glow */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 rounded-[32px] bg-primary/5 blur-2xl" />

          <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_20px_60px_rgba(92,99,230,0.12)]">
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-dim to-secondary" />

            <div className="p-6">
              {loading ? (
                <LoadingState />
              ) : (
                <CardContent
                  status={status}
                  activating={activating}
                  error={error}
                  onActivate={activate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-primary">
      <Spinner size={32} />
      <p className="text-sm text-muted">Verificando seu acesso…</p>
    </div>
  );
}

function CardContent({
  status,
  activating,
  error,
  onActivate,
}: {
  status: ReturnType<typeof useEntitlements>["status"];
  activating: boolean;
  error: string;
  onActivate: () => void;
}) {
  const isTrialAvailable = !status || status.trialAvailable;
  const isTrialExpired = status?.accessStatus === "trial_expired";
  const trialEndDate = formatDate(status?.trialEndsAt ?? null);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Icon */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-primary to-primary-dim shadow-[0_8px_24px_rgba(92,99,230,0.35)]">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        {isTrialAvailable && (
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-black text-white shadow">
            3
          </div>
        )}
      </div>

      {/* Title + badge */}
      <div>
        <div className="mb-2 flex items-center justify-center gap-2">
          <p className="text-xl font-black text-foreground">Experiência Cognix</p>
          {isTrialAvailable && (
            <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-bold text-secondary">
              Disponível
            </span>
          )}
          {isTrialExpired && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
              Encerrada
            </span>
          )}
          {!isTrialAvailable && !isTrialExpired && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
              Premium
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted">
          {isTrialAvailable
            ? "Ative sua experiência quando quiser e libere todos os recursos por 3 dias, sem cobrança."
            : isTrialExpired
            ? trialEndDate
              ? `Seu período gratuito terminou em ${trialEndDate}. Assine para continuar com acesso completo.`
              : "Seu período gratuito terminou. Assine para continuar com acesso completo."
            : "Desbloqueie todos os recursos do Cognix com acesso premium."}
        </p>
      </div>

      {/* Features */}
      <div className="w-full rounded-[16px] bg-surface-low p-4">
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-left">
              <span className="text-base">{f.icon}</span>
              <span className="text-xs font-semibold text-muted">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info row */}
      <div className="flex w-full items-center justify-between rounded-[12px] bg-surface-high px-4 py-2.5 text-xs">
        <span className="text-muted">
          {isTrialAvailable ? "Disponível por" : isTrialExpired ? "Acesso" : "Assinatura"}
        </span>
        <span className="font-bold text-foreground">
          {isTrialAvailable ? "3 dias grátis" : isTrialExpired ? "Encerrado" : "Plano mensal/anual"}
        </span>
        <span className="text-muted">
          {isTrialAvailable ? "Sem cobrança" : isTrialExpired ? "Trial usado" : "Cobrança recorrente"}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="w-full rounded-[10px] bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* CTA */}
      {isTrialAvailable ? (
        <button
          onClick={onActivate}
          disabled={activating}
          className="group flex w-full items-center justify-center gap-2.5 rounded-[16px] bg-gradient-to-br from-primary to-primary-dim py-4 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(92,99,230,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(92,99,230,0.36)] disabled:opacity-60"
        >
          {activating ? (
            <>
              <Spinner size={18} />
              Ativando…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Ativar experiência gratuita
            </>
          )}
        </button>
      ) : (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-br from-primary to-primary-dim py-4 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(92,99,230,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(92,99,230,0.36)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Assinar Cognix Premium
        </button>
      )}

      <p className="text-[11px] text-muted">
        {isTrialAvailable
          ? "Ative agora para começar seu período gratuito. Sem cartão de crédito necessário."
          : "Aproveite treino, desempenho, plano de estudos e muito mais."}
      </p>
    </div>
  );
}
