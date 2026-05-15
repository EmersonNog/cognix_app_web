"use client";

import { usePerformance } from "@/src/modules/performance/controller/use-performance";
import { Spinner } from "@/src/shared/view/components/spinner";
import { LockedContent } from "@/src/shared/view/components/locked-content";
import type { ProfileScoreData } from "@/src/types/api";

export function PerformanceScreen() {
  const { data, loading, locked, error } = usePerformance();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-primary">
        <Spinner size={36} />
      </div>
    );
  }

  if (locked) return <LockedContent />;

  if (error || !data) {
    return (
      <div className="rounded-[16px] bg-red-50 px-6 py-4 text-sm text-red-600">
        {error || "Erro ao carregar dados."}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Desempenho</h1>
        <p className="mt-1 text-sm text-muted">Análise completa do seu progresso.</p>
      </div>

      <ScoreCard data={data} />
      <OverallStats data={data} />
      {data.aiInsight && <InsightCard insight={data.aiInsight} />}
      {(data.questionsByDiscipline?.length ?? 0) > 0 && <DisciplineBreakdown data={data} />}
      {(data.recentCompletedSessionsPreview?.length ?? 0) > 0 && <RecentSessions data={data} />}
    </div>
  );
}

function ScoreCard({ data }: { data: ProfileScoreData }) {
  const progress = (data.pointsToNextLevel ?? 0) > 0
    ? Math.max(0, Math.min(100, 100 - Math.round((data.pointsToNextLevel / ((data.score ?? 0) + data.pointsToNextLevel)) * 100)))
    : 100;

  return (
    <div className="rounded-[20px] bg-gradient-to-br from-primary to-primary-dim p-6 text-white shadow-[0_8px_32px_rgba(92,99,230,0.25)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Pontuação</p>
          <p className="mt-1 text-5xl font-black">{data.score}</p>
          <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
            {data.level}
          </span>
        </div>

        <div className="flex flex-col items-end gap-2">
          {data.currentStreakDays > 0 && (
            <div className="flex items-center gap-1.5 rounded-[10px] bg-white/15 px-3 py-1.5 text-sm font-bold">
              🔥 {data.currentStreakDays} dias
            </div>
          )}
          {data.recentIndexReady && (
            <div className="flex items-center gap-1.5 rounded-[10px] bg-white/15 px-3 py-1.5 text-sm font-bold">
              📈 Índice: {data.recentIndex}
            </div>
          )}
        </div>
      </div>

      {data.nextLevel && (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="opacity-75">Progresso para {data.nextLevel}</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs opacity-60">
            {data.pointsToNextLevel} pts restantes
          </p>
        </div>
      )}
    </div>
  );
}

function OverallStats({ data }: { data: ProfileScoreData }) {
  const coveragePercent = (data.questionBankTotal ?? 0) > 0
    ? Math.round(((data.uniqueQuestionsAnswered ?? 0) / data.questionBankTotal) * 100)
    : 0;

  const studyHours = Math.round((data.totalStudySeconds ?? 0) / 3600);

  const stats = [
    { label: "Questões respondidas", value: (data.questionsAnswered ?? 0).toLocaleString("pt-BR") },
    { label: "Acertos", value: `${Math.round(data.accuracyPercent ?? 0)}%` },
    { label: "Cobertura do banco", value: `${coveragePercent}%` },
    { label: "Sessões concluídas", value: (data.completedSessions ?? 0).toLocaleString("pt-BR") },
    { label: "Horas de estudo", value: `${studyHours}h` },
    { label: "Dias ativos (30d)", value: (data.activeDaysLast30 ?? 0).toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-[16px] bg-surface p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        >
          <p className="text-xs text-muted">{s.label}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function InsightCard({ insight }: { insight: NonNullable<ProfileScoreData["aiInsight"]> }) {
  const riskColors: Record<string, string> = {
    low: "bg-green-50 border-green-200",
    medium: "bg-amber-50 border-amber-200",
    high: "bg-red-50 border-red-200",
  };
  const cls = riskColors[insight.riskLevel] ?? "bg-surface-low border-border";

  return (
    <div className={`rounded-[20px] border p-5 ${cls}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">🤖</span>
        <div>
          <p className="text-sm font-bold text-foreground">{insight.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{insight.summary}</p>
          {insight.nextAction && (
            <p className="mt-2 text-xs font-semibold text-primary">
              Próximo passo: {insight.nextAction}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DisciplineBreakdown({ data }: { data: ProfileScoreData }) {
  const maxCount = Math.max(...(data.questionsByDiscipline ?? []).map((d) => d.count), 1);

  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <p className="mb-4 text-base font-bold text-foreground">Por disciplina</p>
      <div className="grid gap-3">
        {(data.questionsByDiscipline ?? [])
          .sort((a, b) => b.count - a.count)
          .map((d) => {
            const pct = Math.round((d.count / maxCount) * 100);
            return (
              <div key={d.discipline}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{d.discipline}</span>
                  <span className="text-muted">{d.count.toLocaleString("pt-BR")} questões</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-high">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dim transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {(data.strongestSubcategory || data.weakestSubcategory) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {data.strongestSubcategory && (
            <InsightPill
              label="Ponto forte"
              name={data.strongestSubcategory.subcategory}
              accuracy={data.strongestSubcategory.accuracyPercent}
              color="green"
            />
          )}
          {data.weakestSubcategory && (
            <InsightPill
              label="Ponto de atenção"
              name={data.weakestSubcategory.subcategory}
              accuracy={data.weakestSubcategory.accuracyPercent}
              color="red"
            />
          )}
        </div>
      )}
    </div>
  );
}

function InsightPill({
  label,
  name,
  accuracy,
  color,
}: {
  label: string;
  name: string;
  accuracy: number;
  color: "green" | "red";
}) {
  const cls = color === "green"
    ? "bg-green-50 border-green-200"
    : "bg-red-50 border-red-200";
  const textCls = color === "green" ? "text-green-700" : "text-red-700";

  return (
    <div className={`rounded-[12px] border p-3 ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-sm font-bold ${textCls}`}>{name}</p>
      <p className="text-xs text-muted">{Math.round(accuracy)}% de acertos</p>
    </div>
  );
}

function RecentSessions({ data }: { data: ProfileScoreData }) {
  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <p className="mb-4 text-base font-bold text-foreground">Últimas sessões</p>
      <div className="grid gap-2">
        {(data.recentCompletedSessionsPreview ?? []).map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[12px] bg-surface-low px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{s.subcategory}</p>
              <p className="text-xs text-muted">{s.discipline}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-black text-foreground">
                {Math.round(s.accuracyPercent)}%
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                s.accuracyPercent >= 70
                  ? "bg-green-100 text-green-700"
                  : s.accuracyPercent >= 40
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {s.correctAnswers}/{s.totalQuestions}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
