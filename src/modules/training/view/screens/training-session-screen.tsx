"use client";

import Link from "next/link";
import { useState } from "react";
import { useTrainingSession } from "@/src/modules/training/controller/use-training-session";
import { Spinner } from "@/src/shared/view/components/spinner";
import type { AttemptResult, QuestionItem } from "@/src/types/api";

/* ─── Image URL detection (same logic as Flutter app) ─── */

function isImageUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return /\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(url.pathname);
  } catch {
    return false;
  }
}

type Block = { type: "text"; value: string } | { type: "image"; url: string };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const textBuf: string[] = [];

  const flush = () => {
    const text = textBuf.join("\n").trim();
    textBuf.length = 0;
    if (text) blocks.push({ type: "text", value: text });
  };

  for (const line of content.split(/\r?\n/)) {
    if (isImageUrl(line.trim())) {
      flush();
      blocks.push({ type: "image", url: line.trim() });
    } else {
      textBuf.push(line);
    }
  }
  flush();
  return blocks;
}

function ContentBlocks({ content, className }: { content: string; className?: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.type === "image" ? (
          <QuestionImage key={i} src={b.url} />
        ) : (
          <p key={i} className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{b.value}</p>
        )
      )}
    </div>
  );
}

function QuestionImage({ src }: { src: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <div className="my-3">
        <img
          src={src}
          alt="Imagem da questão"
          className="max-h-64 w-auto cursor-zoom-in rounded-[10px] border border-border object-contain"
          onClick={() => setExpanded(true)}
        />
        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Clique para ampliar
        </p>
      </div>
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpanded(false)}
        >
          <img
            src={src}
            alt="Imagem ampliada"
            className="max-h-full max-w-full rounded-[12px] object-contain"
          />
        </div>
      )}
    </>
  );
}

interface Props {
  disciplina: string;
  subcategoria: string;
}

export function TrainingSessionScreen({ disciplina, subcategoria }: Props) {
  const session = useTrainingSession(disciplina, subcategoria);

  if (session.phase === "loading" || session.phase === "restoring") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-primary">
        <Spinner size={40} />
        {session.phase === "restoring" && (
          <p className="text-xs text-muted">Restaurando sessão…</p>
        )}
      </div>
    );
  }

  if (session.phase === "error") {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-red-600">{session.errorMsg}</p>
        <Link href="/treino" className="mt-4 inline-block text-sm font-bold text-primary">← Voltar ao treino</Link>
      </div>
    );
  }

  if (session.phase === "results") {
    return (
      <ResultsScreen
        disciplina={disciplina}
        subcategoria={subcategoria}
        totalCorrect={session.totalCorrect}
        totalAnswered={session.totalAnswered}
        questions={session.questions}
        results={session.results as Record<number, AttemptResult>}
        onRetry={session.retry}
      />
    );
  }

  const total   = session.questions?.length ?? 0;
  const q       = session.currentQuestion!;
  const inFeedback  = session.phase === "feedback";
  const isSubmitting = session.phase === "submitting";
  const result  = session.currentResult;
  const pending = session.pendingLetter;
  const confirmed = session.confirmedLetter;

  // Which letter is "active" on-screen
  const activeLetter = inFeedback ? confirmed : pending;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-sm text-muted">
        <Link href="/treino" className="hover:text-foreground">← Treino</Link>
        <span>/</span>
        <span className="truncate font-semibold text-foreground">{subcategoria}</span>
      </div>

      {/* Progress */}
      <ProgressBar answered={session.totalAnswered} total={total} current={session.currentIndex} />

      {/* Question card */}
      <div className="mt-6 rounded-[20px] bg-surface p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{disciplina}</span>
          {q.year && <span className="text-xs text-muted">Ano {q.year}</span>}
        </div>

        <ContentBlocks content={q.statement} />

        {q.alternativesIntroduction && (
          <ContentBlocks content={q.alternativesIntroduction} className="mt-3 text-xs italic text-muted" />
        )}
      </div>

      {/* Alternatives */}
      <div className="mt-3 grid gap-2.5">
        {(q.alternatives ?? []).map((alt) => (
          <AnswerOption
            key={alt.letter}
            letter={alt.letter}
            text={alt.text}
            fileUrl={alt.fileUrl}
            selected={activeLetter === alt.letter}
            inFeedback={inFeedback}
            result={result}
            onClick={() => session.selectOption(alt.letter)}
          />
        ))}
      </div>

      {/* Tip — always visible */}
      {q.tip && (
        <div className="mt-3 rounded-[14px] border border-primary/20 bg-primary/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Dica</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground">{q.tip}</p>
        </div>
      )}

      {/* Primary action button */}
      <div className="mt-4 grid gap-2">
        {!inFeedback ? (
          <button
            onClick={session.confirm}
            disabled={!pending || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-primary py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <><Spinner size={16} /> Verificando…</> : "Responder"}
          </button>
        ) : (
          <button
            onClick={session.next}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-primary py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            {session.currentIndex >= total - 1 ? "Ver resultado" : "Próxima questão →"}
          </button>
        )}

        {session.currentIndex > 0 && !inFeedback && (
          <button
            onClick={session.prev}
            className="w-full rounded-[14px] border border-border bg-surface py-3 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            ← Questão anterior
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Progress bar ─── */

function ProgressBar({ answered, total, current }: { answered: number; total: number; current: number }) {
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
        <span>
          Questão <span className="font-bold text-foreground">{current + 1}</span> de{" "}
          <span className="font-bold text-foreground">{total}</span>
        </span>
        <span className="font-bold text-foreground">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-high">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dim transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Answer option ─── */

function AnswerOption({
  letter,
  text,
  fileUrl,
  selected,
  inFeedback,
  result,
  onClick,
}: {
  letter: string;
  text: string;
  fileUrl?: string;
  selected: boolean;
  inFeedback: boolean;
  result: AttemptResult | null;
  onClick: () => void;
}) {
  const isCorrectReveal = inFeedback && result && letter === result.correct_letter;
  const isWrong         = inFeedback && result && selected && result.is_correct === false;

  type Variant = "default" | "selected" | "correct" | "wrong" | "reveal";
  let variant: Variant = "default";
  if (isCorrectReveal)  variant = "correct";
  else if (isWrong)     variant = "wrong";
  else if (selected)    variant = "selected";

  const card: Record<Variant, string> = {
    default:  "border-border bg-surface hover:border-primary/50 hover:bg-primary/5 cursor-pointer dark:border-white/10 dark:bg-surface-high dark:hover:border-primary/40",
    selected: "border-primary bg-primary/8 cursor-pointer",
    correct:  "border-green-500 bg-green-50 cursor-default dark:bg-green-500/15 dark:border-green-400",
    wrong:    "border-red-400 bg-red-50 cursor-default dark:bg-red-500/15 dark:border-red-400",
    reveal:   "border-green-500 bg-green-50 cursor-default dark:bg-green-500/15 dark:border-green-400",
  };

  const badge: Record<Variant, string> = {
    default:  "bg-surface-high text-muted dark:bg-white/10",
    selected: "bg-primary text-white",
    correct:  "bg-green-500 text-white",
    wrong:    "bg-red-400 text-white",
    reveal:   "bg-green-500 text-white",
  };

  const textCls: Record<Variant, string> = {
    default:  "text-foreground",
    selected: "text-foreground font-medium",
    correct:  "text-green-800 font-semibold dark:text-green-300",
    wrong:    "text-red-800 dark:text-red-300",
    reveal:   "text-green-800 font-semibold dark:text-green-300",
  };

  return (
    <button
      onClick={inFeedback ? undefined : onClick}
      disabled={inFeedback}
      className={`flex w-full items-start gap-3 rounded-[14px] border p-4 text-left transition-all duration-150 ${card[variant]} disabled:cursor-default`}
    >
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${badge[variant]}`}>
        {letter}
      </span>
      <span className={`flex-1 text-sm leading-relaxed ${textCls[variant]}`}>
        {text}
        {fileUrl && <img src={fileUrl} alt="" className="mt-2 max-h-40 rounded-[8px] border border-border object-contain" />}
      </span>
      {variant === "correct" && (
        <svg className="mt-0.5 shrink-0 text-green-500 dark:text-green-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {variant === "wrong" && (
        <svg className="mt-0.5 shrink-0 text-red-400 dark:text-red-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  );
}

/* ─── Results screen ─── */

function ResultsScreen({
  disciplina,
  subcategoria,
  totalCorrect,
  totalAnswered,
  questions,
  results,
  onRetry,
}: {
  disciplina: string;
  subcategoria: string;
  totalCorrect: number;
  totalAnswered: number;
  questions: QuestionItem[];
  results: Record<number, AttemptResult>;
  onRetry: () => void;
}) {
  const pct  = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const href = `/treino/sessao?disciplina=${encodeURIComponent(disciplina)}&subcategoria=${encodeURIComponent(subcategoria)}`;

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-[24px] bg-gradient-to-br from-primary to-primary-dim p-8 text-center text-white shadow-[0_8px_32px_rgba(92,99,230,0.25)]">
        <p className="text-6xl font-black">{pct}%</p>
        <p className="mt-1 text-sm opacity-80">de aproveitamento</p>
        <p className="mt-1 font-bold">{totalCorrect} de {totalAnswered} corretas</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/treino" className="rounded-[12px] bg-white/20 px-5 py-2.5 text-sm font-bold hover:bg-white/30">Outras áreas</Link>
          <Link href={href} onClick={onRetry} className="rounded-[12px] px-5 py-2.5 text-sm font-bold hover:opacity-90" style={{ backgroundColor: "#ffffff", color: "#5c63e6" }}>Refazer</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        {questions.map((q, i) => {
          const r = results[q.id];
          const correct = r?.is_correct === true;
          const wrong   = r?.is_correct === false;
          return (
            <div key={q.id} className={`flex items-start gap-3 rounded-[14px] p-4 ${
              correct ? "bg-green-50 dark:bg-green-900/25"
              : wrong  ? "bg-red-50 dark:bg-red-500/20"
              : "bg-surface"
            }`}>
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${correct ? "bg-green-500 text-white" : wrong ? "bg-red-400 text-white" : "bg-surface-high text-muted"}`}>
                {i + 1}
              </span>
              <p className="flex-1 text-xs leading-relaxed text-foreground line-clamp-2">{q.statement}</p>
              {r && (
                <span className={`ml-auto shrink-0 text-xs font-bold ${correct ? "text-green-600 dark:text-green-400" : wrong ? "text-red-500 dark:text-red-400" : "text-muted"}`}>
                  {r.selected_letter}
                  {!correct && r.correct_letter && <span className="text-green-600 dark:text-green-400"> → {r.correct_letter}</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link href="/dashboard" className="text-sm font-semibold text-muted hover:text-primary">← Início</Link>
      </div>
    </div>
  );
}
