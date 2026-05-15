"use client";

import { useState } from "react";
import { useStudyPlan } from "@/src/modules/study-plan/controller/use-study-plan";
import { Spinner } from "@/src/shared/view/components/spinner";
import { LockedContent } from "@/src/shared/view/components/locked-content";
import type { StudyPlanData } from "@/src/types/api";

const FOCUS_MODES = [
  { value: "constancia", label: "Constância", desc: "Estudo regular e consistente" },
  { value: "intensidade", label: "Intensidade", desc: "Sessões intensas e focadas" },
  { value: "revisao", label: "Revisão", desc: "Reforçar conteúdo já visto" },
];

const PERIODS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "flexivel", label: "Flexível" },
];

export function StudyPlanScreen() {
  const { data, loading, saving, locked, error, save } = useStudyPlan();
  const [editing, setEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-primary">
        <Spinner size={36} />
      </div>
    );
  }

  if (locked) return <LockedContent />;

  if (error && !data) {
    return (
      <div className="rounded-[16px] bg-red-50 px-6 py-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Plano de Estudos</h1>
          <p className="mt-1 text-sm text-muted">Acompanhe e configure sua rotina semanal.</p>
        </div>
        {data && (
          <button
            onClick={() => setEditing((v) => !v)}
            className="shrink-0 rounded-[12px] border border-border px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface-low hover:text-foreground"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
        )}
      </div>

      {data && !data.configured && !editing && (
        <div className="rounded-[20px] bg-primary/5 border border-primary/20 p-6 text-center">
          <p className="text-base font-bold text-foreground">Configure seu plano</p>
          <p className="mt-1 text-sm text-muted">
            Defina sua meta de estudos semanal para acompanhar o progresso.
          </p>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 rounded-[12px] bg-primary px-6 py-2.5 text-sm font-bold text-white"
          >
            Configurar agora
          </button>
        </div>
      )}

      {data && data.configured && !editing && (
        <>
          <WeeklyProgress data={data} />
          <GoalCards data={data} />
        </>
      )}

      {editing && (
        <EditForm
          data={data}
          saving={saving}
          onSave={async (payload) => {
            await save(payload);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function WeeklyProgress({ data }: { data: StudyPlanData }) {
  const progressItems = [
    {
      label: "Dias ativos",
      current: data.activeDaysThisWeek,
      goal: data.activeDaysGoal,
      percent: data.activeDaysPercent,
      unit: "dias",
      color: "from-primary to-primary-dim",
    },
    {
      label: "Minutos estudados",
      current: data.completedMinutesThisWeek,
      goal: data.weeklyMinutesTarget,
      percent: data.minutesPercent,
      unit: "min",
      color: "from-secondary to-secondary",
    },
    {
      label: "Questões respondidas",
      current: data.answeredQuestionsThisWeek,
      goal: data.weeklyQuestionsGoal,
      percent: data.questionsPercent,
      unit: "questões",
      color: "from-accent to-accent",
    },
  ];

  return (
    <div className="rounded-[20px] bg-surface p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-bold text-foreground">Esta semana</p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
          data.weeklyCompletionPercent >= 100
            ? "bg-green-100 text-green-700"
            : data.weeklyCompletionPercent >= 50
            ? "bg-amber-100 text-amber-700"
            : "bg-surface-high text-muted"
        }`}>
          {Math.min(data.weeklyCompletionPercent, 100)}% concluído
        </span>
      </div>

      <div className="grid gap-4">
        {progressItems.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{item.label}</span>
              <span className="text-muted">
                {item.current} / {item.goal} {item.unit}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-high">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                style={{ width: `${Math.min(item.percent, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalCards({ data }: { data: StudyPlanData }) {
  const focusMode = FOCUS_MODES.find((f) => f.value === data.focusMode);
  const period = PERIODS.find((p) => p.value === data.preferredPeriod);

  const cards = [
    { label: "Dias por semana", value: `${data.studyDaysPerWeek} dias` },
    { label: "Por dia", value: `${data.minutesPerDay} min` },
    { label: "Meta de questões", value: `${data.weeklyQuestionsGoal}/semana` },
    { label: "Período preferido", value: period?.label ?? data.preferredPeriod },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[16px] bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <p className="text-xs text-muted">{c.label}</p>
            <p className="mt-1 text-lg font-black text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {focusMode && (
        <div className="rounded-[16px] bg-primary/5 border border-primary/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Foco</p>
          <p className="mt-1 text-sm font-bold text-foreground">{focusMode.label}</p>
          <p className="text-xs text-muted">{focusMode.desc}</p>
        </div>
      )}
    </div>
  );
}

function EditForm({
  data,
  saving,
  onSave,
  onCancel,
}: {
  data: StudyPlanData | null;
  saving: boolean;
  onSave: (payload: Partial<StudyPlanData>) => void;
  onCancel: () => void;
}) {
  const [days, setDays] = useState(data?.studyDaysPerWeek ?? 5);
  const [minutes, setMinutes] = useState(data?.minutesPerDay ?? 60);
  const [questions, setQuestions] = useState(data?.weeklyQuestionsGoal ?? 80);
  const [focusMode, setFocusMode] = useState(data?.focusMode ?? "constancia");
  const [period, setPeriod] = useState(data?.preferredPeriod ?? "flexivel");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      studyDaysPerWeek: days,
      minutesPerDay: minutes,
      weeklyQuestionsGoal: questions,
      focusMode,
      preferredPeriod: period,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-[20px] bg-surface p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
      <p className="font-bold text-foreground">Configurar plano</p>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">Dias de estudo por semana</span>
        <div className="flex items-center gap-3">
          {[3, 4, 5, 6, 7].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`h-9 w-9 rounded-[10px] text-sm font-bold transition ${days === d ? "bg-primary text-white" : "bg-surface-high text-muted hover:bg-surface-low"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">
          Minutos por dia: <span className="text-foreground font-bold">{minutes} min</span>
        </span>
        <input
          type="range"
          min={15}
          max={180}
          step={15}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted">
          <span>15 min</span><span>180 min</span>
        </div>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">
          Meta de questões por semana: <span className="text-foreground font-bold">{questions}</span>
        </span>
        <input
          type="range"
          min={20}
          max={200}
          step={10}
          value={questions}
          onChange={(e) => setQuestions(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted">
          <span>20</span><span>200</span>
        </div>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">Modo de foco</span>
        <div className="grid gap-2">
          {FOCUS_MODES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFocusMode(f.value)}
              className={`flex items-center justify-between rounded-[12px] border px-4 py-3 text-left transition ${
                focusMode === f.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-surface-low"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-foreground">{f.label}</p>
                <p className="text-xs text-muted">{f.desc}</p>
              </div>
              {focusMode === f.value && (
                <svg className="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-muted">Período preferido</span>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`rounded-[10px] px-4 py-2 text-sm font-bold transition ${
                period === p.value ? "bg-primary text-white" : "bg-surface-high text-muted hover:bg-surface-low"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[12px] border border-border py-3 text-sm font-bold text-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-[12px] bg-gradient-to-br from-primary to-primary-dim py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar plano"}
        </button>
      </div>
    </form>
  );
}
