import { api } from "@/src/lib/api-client";
import type {
  AttemptPayload,
  AttemptResult,
  QuestionItem,
  QuestionsPage,
  SubcategoryItem,
} from "@/src/types/api";

export function fetchSubcategories(discipline: string) {
  const params = new URLSearchParams({ discipline });
  return api
    .get<{ items: SubcategoryItem[] }>(`/questions/subcategories?${params}`)
    .then((res) => res.items ?? []);
}

export function fetchDisciplines() {
  return api
    .get<{ items: string[] }>("/questions/disciplines")
    .then((res) => res.items ?? []);
}

// Transforms raw DB columns into the QuestionItem shape the app expects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeQuestion(row: Record<string, any>, fallbackDiscipline = "", fallbackSubcategory = ""): QuestionItem {
  const alternatives = (["a", "b", "c", "d", "e"] as const)
    .map((key) => ({
      letter: key.toUpperCase(),
      text:    String(row[`alternativa_${key}`] ?? "").trim(),
      fileUrl: row[`alternativa_${key}_arquivo`] ?? undefined,
    }))
    .filter((alt) => alt.text.length > 0 || alt.fileUrl);

  return {
    id:                       Number(row.id ?? 0),
    statement:                String(row.enunciado ?? ""),
    alternatives,
    subcategory:              String(row.subcategoria ?? fallbackSubcategory),
    discipline:               String(row.disciplina  ?? fallbackDiscipline),
    year:                     row.ano ? Number(row.ano) : undefined,
    alternativesIntroduction: row.introducao_alternativas ? String(row.introducao_alternativas) : undefined,
    answerKey:                row.gabarito ? String(row.gabarito) : undefined,
    tip:                      row.dica     ? String(row.dica)     : undefined,
  };
}

export function fetchQuestions(
  disciplina: string,
  subcategoria: string,
  limit = 10,
  offset = 0
): Promise<QuestionsPage> {
  const params = new URLSearchParams({
    subject:     disciplina,
    subcategory: subcategoria,
    limit:  String(limit),
    offset: String(offset),
  });
  return api
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .get<{ items: Record<string, any>[]; limit: number; offset: number; total?: number }>(`/questions?${params}`)
    .then((res) => ({
      items:  (res.items ?? []).map((row) => normalizeQuestion(row, disciplina, subcategoria)),
      limit:  res.limit,
      offset: res.offset,
      total:  res.total,
    }));
}

export function submitAttempt(payload: AttemptPayload) {
  return api.post<AttemptResult>("/attempts", payload);
}
