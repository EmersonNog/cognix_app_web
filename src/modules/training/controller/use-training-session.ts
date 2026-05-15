"use client";

import { useEffect, useReducer, useCallback, useRef, useState } from "react";
import type { AttemptResult, QuestionItem } from "@/src/types/api";
import { fetchQuestions, submitAttempt } from "@/src/modules/training/model/training-api";
import { ApiError } from "@/src/lib/api-client";
import {
  buildSnapshot,
  clearLocal,
  deleteRemoteSession,
  fetchRemoteSession,
  pickMostRecent,
  readLocal,
  saveRemoteSession,
  writeLocal,
} from "@/src/modules/training/model/session-persistence";

export type Phase = "loading" | "restoring" | "active" | "submitting" | "feedback" | "results" | "error";

interface State {
  phase: Phase;
  questions: QuestionItem[];
  currentIndex: number;
  pending: Record<number, string>;           // questionId → letter (not yet confirmed)
  selections: Record<number, string>;        // questionId → confirmed letter
  isCorrect: Record<number, boolean | null>; // questionId → result
  correctLetter: Record<number, string>;     // questionId → correct letter from API
  feedbackQuestionId: number | null;
  errorMsg: string;
}

type Action =
  | { type: "RESTORING" }
  | { type: "LOADED"; questions: QuestionItem[]; restore?: Partial<State>; completed?: boolean }
  | { type: "ERROR"; msg: string }
  | { type: "SELECT"; questionId: number; letter: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_DONE"; questionId: number; letter: string; result: AttemptResult }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESTORING":
      return { ...state, phase: "restoring" };

    case "LOADED": {
      const restore = action.restore ?? {};
      // Completed session — go straight to results screen
      if (action.completed) {
        return {
          ...state,
          phase: "results",
          questions: action.questions,
          currentIndex: action.questions.length,
          pending: {},
          selections:    restore.selections    ?? {},
          isCorrect:     restore.isCorrect     ?? {},
          correctLetter: restore.correctLetter ?? {},
          feedbackQuestionId: null,
        };
      }
      const restoredIndex = typeof restore.currentIndex === "number" ? restore.currentIndex : 0;
      const restoredQ = action.questions[restoredIndex];
      const hasFeedback = restoredQ && restore.feedbackQuestionId === restoredQ.id;
      return {
        ...state,
        phase: hasFeedback ? "feedback" : "active",
        questions: action.questions,
        currentIndex: restoredIndex,
        pending: {},
        selections:    restore.selections    ?? {},
        isCorrect:     restore.isCorrect     ?? {},
        correctLetter: restore.correctLetter ?? {},
        feedbackQuestionId: restore.feedbackQuestionId ?? null,
      };
    }

    case "ERROR":
      return { ...state, phase: "error", errorMsg: action.msg };

    case "SELECT":
      if (state.phase !== "active") return state;
      return { ...state, pending: { ...state.pending, [action.questionId]: action.letter } };

    case "SUBMIT_START":
      return { ...state, phase: "submitting" };

    case "SUBMIT_DONE": {
      const selections    = { ...state.selections,    [action.questionId]: action.letter };
      const isCorrect     = { ...state.isCorrect,     [action.questionId]: action.result.is_correct };
      const correctLetter = { ...state.correctLetter, [action.questionId]: action.result.correct_letter ?? "" };
      return {
        ...state,
        phase: "feedback",
        selections,
        isCorrect,
        correctLetter,
        feedbackQuestionId: action.questionId,
      };
    }

    case "NEXT": {
      const next = state.currentIndex + 1;
      if (next >= state.questions.length) return { ...state, phase: "results", currentIndex: next };
      return { ...state, phase: "active", currentIndex: next, feedbackQuestionId: null };
    }

    case "PREV": {
      if (state.currentIndex <= 0) return state;
      const prev = state.currentIndex - 1;
      const prevQ = state.questions[prev];
      const inFeedback = prevQ ? !!state.selections[prevQ.id] : false;
      return {
        ...state,
        phase: inFeedback ? "feedback" : "active",
        currentIndex: prev,
        feedbackQuestionId: inFeedback ? prevQ.id : null,
      };
    }

    case "RESET":
      return { ...INITIAL };

    default:
      return state;
  }
}

const INITIAL: State = {
  phase: "loading",
  questions: [],
  currentIndex: 0,
  pending: {},
  selections: {},
  isCorrect: {},
  correctLetter: {},
  feedbackQuestionId: null,
  errorMsg: "",
};

export function useTrainingSession(disciplina: string, subcategoria: string) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [retryCount, setRetryCount] = useState(0);
  // debounce timer for remote save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Load + restore ─── */
  useEffect(() => {
    if (!disciplina || !subcategoria) return;
    let cancelled = false;

    async function init() {
      dispatch({ type: "RESTORING" });

      // 1. Fetch questions and remote session state in parallel
      const [questionsResult, remoteState] = await Promise.allSettled([
        Promise.all([
          fetchQuestions(disciplina, subcategoria, 200, 0),
          fetchQuestions(disciplina, subcategoria, 200, 200),
        ]),
        fetchRemoteSession(disciplina, subcategoria),
      ]);

      if (cancelled) return;

      if (questionsResult.status === "rejected") {
        const err = questionsResult.reason as Error;
        if (err instanceof ApiError && err.isSubscriptionRequired) {
          dispatch({ type: "ERROR", msg: "Conteúdo bloqueado." });
        } else {
          dispatch({ type: "ERROR", msg: err.message ?? "Erro ao carregar questões." });
        }
        return;
      }

      const [page1, page2] = questionsResult.value;
      const allQuestions = [...page1.items, ...page2.items];

      if (allQuestions.length === 0) {
        dispatch({ type: "ERROR", msg: "Nenhuma questão encontrada para essa categoria." });
        return;
      }

      // 2. Pick best saved state (localStorage vs remote)
      const local  = readLocal(disciplina, subcategoria);
      const remote = remoteState.status === "fulfilled" ? remoteState.value : null;
      const saved  = pickMostRecent(local, remote);

      // 3. Restore if valid (same discipline+subcategory, questions overlap)
      let restore: Partial<State> | undefined;
      let completed = false;
      if (saved && saved.discipline === disciplina && saved.subcategory === subcategoria) {
        const savedIds   = new Set(saved.questions.map((q) => q.id));
        const currentIds = new Set(allQuestions.map((q) => q.id));
        const overlap = [...savedIds].filter((id) => currentIds.has(id)).length;
        if (overlap > 0 || saved.completed) {
          const sel: Record<number, string> = {};
          const cor: Record<number, boolean | null> = {};
          const clt: Record<number, string> = {};
          for (const [k, v] of Object.entries(saved.selections ?? {})) sel[Number(k)] = v as string;
          for (const [k, v] of Object.entries(saved.isCorrect ?? {})) cor[Number(k)] = v as boolean | null;
          for (const [k, v] of Object.entries(saved.correctLetter ?? {})) clt[Number(k)] = v as string;
          completed = Boolean(saved.completed);
          restore = {
            currentIndex:       saved.completed ? allQuestions.length : Math.min(saved.currentIndex, allQuestions.length - 1),
            selections:         sel,
            isCorrect:          cor,
            correctLetter:      clt,
            feedbackQuestionId: saved.feedbackQuestionId ?? null,
          };
        }
      }

      dispatch({ type: "LOADED", questions: allQuestions, restore, completed });
    }

    init().catch(() => {
      if (!cancelled) dispatch({ type: "ERROR", msg: "Erro inesperado." });
    });

    return () => { cancelled = true; };
  }, [disciplina, subcategoria, retryCount]);

  /* ─── Persist after state changes ─── */
  const persistState = useCallback((s: State) => {
    if (s.phase === "loading" || s.phase === "restoring" || s.phase === "error") return;
    if (s.questions.length === 0) return;

    const snapshot = buildSnapshot({
      discipline: disciplina,
      subcategory: subcategoria,
      completed: s.phase === "results",
      currentIndex: s.currentIndex,
      questions: s.questions,
      selections:    Object.fromEntries(Object.entries(s.selections).map(([k, v]) => [k, v])),
      isCorrect:     Object.fromEntries(Object.entries(s.isCorrect).map(([k, v]) => [k, v])),
      correctLetter: Object.fromEntries(Object.entries(s.correctLetter).map(([k, v]) => [k, v])),
      showingAnswerFeedback: s.phase === "feedback",
      feedbackQuestionId: s.feedbackQuestionId,
    });

    writeLocal(snapshot);

    // Debounce remote save by 2s
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveRemoteSession(snapshot);
    }, 2000);
  }, [disciplina, subcategoria]);

  /* ─── Actions ─── */

  const selectOption = useCallback((letter: string) => {
    const q = state.questions[state.currentIndex];
    if (!q || state.phase !== "active") return;
    dispatch({ type: "SELECT", questionId: q.id, letter });
  }, [state.phase, state.questions, state.currentIndex]);

  const confirm = useCallback(async () => {
    if (state.phase !== "active") return;
    const q = state.questions[state.currentIndex];
    if (!q) return;
    const letter = state.pending[q.id];
    if (!letter) return;

    dispatch({ type: "SUBMIT_START" });
    try {
      const result = await submitAttempt({
        question_id: q.id,
        selected_letter: letter,
        discipline: disciplina,
        subcategory: subcategoria,
      });
      dispatch({ type: "SUBMIT_DONE", questionId: q.id, letter, result });
    } catch {
      dispatch({
        type: "SUBMIT_DONE",
        questionId: q.id,
        letter,
        result: { question_id: q.id, selected_letter: letter, is_correct: null },
      });
    }
  }, [state.phase, state.questions, state.currentIndex, state.pending, disciplina, subcategoria]);

  const next  = useCallback(() => dispatch({ type: "NEXT" }), []);
  const prev  = useCallback(() => dispatch({ type: "PREV" }), []);
  const retry = useCallback(() => {
    clearLocal(disciplina, subcategoria);
    deleteRemoteSession(disciplina, subcategoria);
    dispatch({ type: "RESET" });
    setRetryCount((c) => c + 1);
  }, [disciplina, subcategoria]);

  /* ─── Persist on relevant state changes ─── */
  useEffect(() => {
    if (state.phase === "feedback" || state.phase === "results" || state.phase === "active") {
      persistState(state);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.currentIndex, state.feedbackQuestionId]);

  /* ─── Derived values ─── */
  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const currentResult: AttemptResult | null = currentQuestion
    ? {
        question_id:    currentQuestion.id,
        selected_letter: state.selections[currentQuestion.id] ?? "",
        is_correct:     state.isCorrect[currentQuestion.id] ?? null,
        correct_letter: state.correctLetter[currentQuestion.id] || undefined,
      }
    : null;

  const pendingLetter   = currentQuestion ? (state.pending[currentQuestion.id] ?? null) : null;
  const confirmedLetter = currentQuestion ? (state.selections[currentQuestion.id] ?? null) : null;
  const totalAnswered   = Object.keys(state.selections).length;
  const totalCorrect    = Object.values(state.isCorrect).filter((v) => v === true).length;

  return {
    phase: state.phase,
    questions: state.questions,
    currentIndex: state.currentIndex,
    currentQuestion,
    currentResult: state.phase === "feedback" ? currentResult : null,
    pendingLetter,
    confirmedLetter,
    selections: state.selections,
    results: Object.fromEntries(
      Object.entries(state.selections).map(([qId]) => [
        qId,
        {
          question_id:    Number(qId),
          selected_letter: state.selections[Number(qId)],
          is_correct:     state.isCorrect[Number(qId)] ?? null,
          correct_letter: state.correctLetter[Number(qId)] || undefined,
        } as AttemptResult,
      ])
    ),
    errorMsg: state.errorMsg,
    totalAnswered,
    totalCorrect,
    selectOption,
    confirm,
    next,
    prev,
    retry,
  };
}
