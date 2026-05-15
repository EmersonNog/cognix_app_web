"use client";

import Link from "next/link";
import { useState } from "react";
import { useDashboard } from "@/src/modules/dashboard/controller/use-dashboard";
import { Spinner } from "@/src/shared/view/components/spinner";
import { LockedContent } from "@/src/shared/view/components/locked-content";
import type { HomeRecommendationItem, ProfileScoreData } from "@/src/types/api";

export function DashboardScreen() {
  const { profile, recommendations, loading, locked, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-primary">
        <Spinner size={36} />
      </div>
    );
  }

  if (locked) return <LockedContent />;

  if (error) {
    return (
      <div className="rounded-[16px] bg-red-50 px-6 py-8 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {profile && <HeroCard profile={profile} />}

      {profile && <StatsRow profile={profile} />}

      {profile && (profile.recentActivityWindow?.length ?? 0) > 0 && (
        <ActivitySection profile={profile} />
      )}

      <RecommendationsSection
        title={recommendations?.title ?? "Recomendado para Hoje"}
        subtitle={recommendations?.subtitle ?? ""}
        items={recommendations?.items ?? []}
      />

      {profile && (profile.recentCompletedSessionsPreview?.length ?? 0) > 0 && (
        <RecentSessionsSection profile={profile} />
      )}
    </div>
  );
}

function HeroCard({ profile }: { profile: ProfileScoreData }) {
  const coveragePercent = (profile.questionBankTotal ?? 0) > 0
    ? Math.round(((profile.uniqueQuestionsAnswered ?? 0) / profile.questionBankTotal) * 100)
    : 0;

  return (
    <div className="rounded-[20px] bg-gradient-to-br from-primary to-primary-dim p-6 text-white shadow-[0_8px_32px_rgba(92,99,230,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Pontuação
          </p>
          <p className="mt-1 text-4xl font-black">{profile.score}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
              {profile.level}
            </span>
            {profile.nextLevel && (
              <span className="text-xs opacity-75">
                {profile.pointsToNextLevel} pontos para o próximo nível.
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Cobertura
          </p>
          <p className="mt-1 text-2xl font-black">{coveragePercent}%</p>
          <p className="text-xs opacity-75">do banco de questões</p>
        </div>
      </div>

      {profile.currentStreakDays > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-white/15 px-3 py-2">
          <span className="text-base">🔥</span>
          <span className="text-sm font-bold">
            {profile.currentStreakDays} dias seguidos
          </span>
        </div>
      )}
    </div>
  );
}

function StatsRow({ profile }: { profile: ProfileScoreData }) {
  const stats = [
    {
      label: "Questões",
      value: (profile.questionsAnswered ?? 0).toLocaleString("pt-BR"),
      sub: "respondidas",
    },
    {
      label: "Precisão",
      value: `${Math.round(profile.accuracyPercent ?? 0)}%`,
      sub: "de acertos",
    },
    {
      label: "Sessões",
      value: (profile.completedSessions ?? 0).toLocaleString("pt-BR"),
      sub: "concluídas",
    },
    {
      label: "Dias ativos",
      value: (profile.activeDaysLast30 ?? 0).toString(),
      sub: "últimos 30 dias",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-[16px] bg-surface p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {s.label}
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">{s.value}</p>
          <p className="text-[11px] text-muted">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

function ActivitySection({ profile }: { profile: ProfileScoreData }) {
  const days = (profile.recentActivityWindow ?? []).slice(-21);
  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <p className="mb-3 text-sm font-bold text-foreground">Atividade recente</p>
      <div className="flex flex-wrap gap-1.5">
        {days.map((d, i) => (
          <div
            key={i}
            title={d.date}
            className={`h-5 w-5 rounded-[5px] transition-colors ${
              d.isToday
                ? "ring-2 ring-primary ring-offset-1"
                : ""
            } ${
              d.active
                ? "bg-primary"
                : "bg-surface-high"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Discipline icon (matches _iconForRecommendation in Flutter) ─── */

function DisciplineIcon({ discipline, color }: { discipline: string; color: string }) {
  const d = discipline.toLowerCase();
  if (d.includes("matem")) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  );
  if (d.includes("natureza")) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
    </svg>
  );
  if (d.includes("humanas")) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
  if (d.includes("linguagens")) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

/* ─── Badge tone → color (matches _badgeColorForTone in Flutter) ─── */

function toneClasses(tone: string) {
  return tone === "critical"
    ? { bg: "bg-red-50", iconBg: "#fef2f2", color: "#dc2626", badge: "bg-red-100 text-red-600" }
    : { bg: "bg-green-50", iconBg: "#f0fdf4", color: "#16a34a", badge: "bg-green-100 text-green-700" };
}

function RecommendationsSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: HomeRecommendationItem[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const preview = items.slice(0, 2);
  const hasItems = items.length > 0;

  return (
    <div>
      {/* Header — "Ver Tudo" always rendered, disabled when empty (same as mobile) */}
      <div className="mb-1 flex items-center justify-between">
        <p className="text-base font-bold text-foreground">{title}</p>
        <button
          onClick={hasItems ? () => setModalOpen(true) : undefined}
          className={`text-xs font-semibold transition ${hasItems ? "text-primary hover:opacity-70" : "text-muted cursor-default"}`}
        >
          Ver Tudo
        </button>
      </div>
      <p className="mb-3 text-[12.5px] text-muted">{subtitle}</p>

      {/* Empty state */}
      {!hasItems ? (
        <div className="flex items-start gap-3 rounded-[18px] bg-surface p-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-primary/14">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold leading-[1.3] text-foreground">
              As recomendações vão aparecer conforme seu ritmo evoluir.
            </p>
            <p className="mt-1.5 text-[12px] leading-[1.45] text-muted">
              Defina prioridades no plano ou avance em algumas disciplinas.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {preview.map((item, i) => (
            <RecommendationCard key={i} item={item} />
          ))}
        </div>
      )}

      {/* "Ver Tudo" bottom sheet (same as mobile showModalBottomSheet) */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-[24px] bg-background px-5 pb-6 pt-5 shadow-2xl sm:rounded-[24px] sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[18px] font-black text-foreground">Todas as recomendações</p>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-high text-muted transition hover:text-foreground"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="mb-4 text-[12.4px] text-muted">Escolha a frente que faz mais sentido para hoje.</p>
            <div className="grid gap-3 max-h-[70vh] overflow-y-auto">
              {items.map((item, i) => (
                <RecommendationCard key={i} item={item} onNavigate={() => setModalOpen(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  item,
  onNavigate,
}: {
  item: HomeRecommendationItem;
  onNavigate?: () => void;
}) {
  const tone  = toneClasses(item.badgeTone);
  const href  = `/treino/sessao?disciplina=${encodeURIComponent(item.discipline)}&subcategoria=${encodeURIComponent(item.subcategory)}`;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-[18px] bg-surface p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.1)]"
      style={{ border: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Discipline icon — background color = tone color at 15% opacity, icon = tone color */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: tone.iconBg }}
      >
        <DisciplineIcon discipline={item.discipline} color={tone.color} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="flex-1 text-[14.5px] font-bold leading-snug text-foreground">{item.title}</p>
          {item.badgeLabel && (
            <span className={`shrink-0 rounded-full px-2 py-1 text-[9.5px] font-bold tracking-[0.8px] ${tone.badge}`}>
              {item.badgeLabel.toUpperCase()}
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-1.5 text-[12.2px] leading-[1.35] text-muted line-clamp-2">{item.description}</p>
        )}
        {item.countLabel && (
          <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 9a3 3 0 1 1 6 0c0 2-3 3-3 5"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
            {item.countLabel}
          </div>
        )}
      </div>

      {/* Chevron — primary color (same as mobile Icon primary) */}
      <svg className="shrink-0 text-primary" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </Link>
  );
}

function RecentSessionsSection({ profile }: { profile: ProfileScoreData }) {
  return (
    <div>
      <p className="mb-3 text-base font-bold text-foreground">Sessões recentes</p>
      <div className="grid gap-2">
        {(profile.recentCompletedSessionsPreview ?? []).slice(0, 5).map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[14px] bg-surface px-4 py-3 shadow-[0_1px_6px_rgba(0,0,0,0.05)]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {s.subcategory}
              </p>
              <p className="text-xs text-muted">{s.discipline}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-foreground">
                {Math.round(s.accuracyPercent)}%
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  s.accuracyPercent >= 70
                    ? "bg-green-100 text-green-700"
                    : s.accuracyPercent >= 40
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {s.correctAnswers}/{s.totalQuestions}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
