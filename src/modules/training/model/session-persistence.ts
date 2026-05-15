import { api } from "@/src/lib/api-client";
import type { QuestionItem } from "@/src/types/api";

export const STATE_VERSION = 2;

export interface PersistedSessionState {
  stateVersion: number;
  discipline: string;
  subcategory: string;
  completed: boolean;
  currentIndex: number;
  questions: QuestionItem[];
  // questionId (string key) → confirmed letter
  selections: Record<string, string>;
  // questionId (string key) → true/false/null
  isCorrect: Record<string, boolean | null>;
  // questionId (string key) → correct letter from API
  correctLetter: Record<string, string>;
  // whether the current question is in feedback state
  showingAnswerFeedback: boolean;
  feedbackQuestionId: number | null;
  savedAt: number;
}

function localKey(discipline: string, subcategory: string) {
  return `cognix_session_${discipline}_${subcategory}`;
}

/* ── localStorage ── */

export function readLocal(discipline: string, subcategory: string): PersistedSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(localKey(discipline, subcategory));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSessionState;
  } catch {
    return null;
  }
}

export function writeLocal(state: PersistedSessionState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(localKey(state.discipline, state.subcategory), JSON.stringify(state));
  } catch { /* quota exceeded — ignore */ }
}

export function clearLocal(discipline: string, subcategory: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(localKey(discipline, subcategory));
  } catch { /* ignore */ }
}

/* ── Remote API ── */

export async function fetchRemoteSession(
  discipline: string,
  subcategory: string,
): Promise<PersistedSessionState | null> {
  try {
    const params = new URLSearchParams({ discipline, subcategory });
    const res = await api.get<{ state: PersistedSessionState; saved_at: string }>(`/sessions?${params}`);
    if (!res?.state) return null;
    return res.state;
  } catch {
    return null;
  }
}

export async function saveRemoteSession(state: PersistedSessionState): Promise<void> {
  try {
    await api.post("/sessions", {
      discipline: state.discipline,
      subcategory: state.subcategory,
      state,
    });
  } catch { /* best-effort */ }
}

export async function deleteRemoteSession(discipline: string, subcategory: string): Promise<void> {
  try {
    const params = new URLSearchParams({ discipline, subcategory });
    await api.delete(`/sessions?${params}`);
  } catch { /* best-effort */ }
}

/* ── Pick most recent between two snapshots ── */

export function pickMostRecent(
  a: PersistedSessionState | null,
  b: PersistedSessionState | null,
): PersistedSessionState | null {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  return (a.savedAt ?? 0) >= (b.savedAt ?? 0) ? a : b;
}

/* ── Build a snapshot from current hook state ── */

export function buildSnapshot({
  discipline,
  subcategory,
  currentIndex,
  questions,
  selections,
  isCorrect,
  correctLetter,
  showingAnswerFeedback,
  feedbackQuestionId,
  completed,
}: Omit<PersistedSessionState, "stateVersion" | "savedAt">): PersistedSessionState {
  return {
    stateVersion: STATE_VERSION,
    discipline,
    subcategory,
    completed,
    currentIndex,
    questions,
    selections,
    isCorrect,
    correctLetter,
    showingAnswerFeedback,
    feedbackQuestionId,
    savedAt: Date.now(),
  };
}
