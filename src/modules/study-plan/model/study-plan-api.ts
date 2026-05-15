import { api } from "@/src/lib/api-client";
import type { StudyPlanData } from "@/src/types/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: Record<string, any>): StudyPlanData {
  return {
    configured:                  Boolean(raw.configured),
    studyDaysPerWeek:            Number(raw.study_days_per_week            ?? raw.studyDaysPerWeek            ?? 5),
    minutesPerDay:               Number(raw.minutes_per_day                ?? raw.minutesPerDay               ?? 60),
    weeklyQuestionsGoal:         Number(raw.weekly_questions_goal          ?? raw.weeklyQuestionsGoal         ?? 80),
    focusMode:                   String(raw.focus_mode                     ?? raw.focusMode                   ?? "constancia"),
    preferredPeriod:             String(raw.preferred_period               ?? raw.preferredPeriod             ?? "flexivel"),
    priorityDisciplines:         Array.isArray(raw.priority_disciplines ?? raw.priorityDisciplines) ? (raw.priority_disciplines ?? raw.priorityDisciplines) : [],
    weekStart:                   raw.week_start     ?? raw.weekStart,
    weekEnd:                     raw.week_end       ?? raw.weekEnd,
    activeDaysThisWeek:          Number(raw.active_days_this_week          ?? raw.activeDaysThisWeek          ?? 0),
    completedMinutesThisWeek:    Number(raw.completed_minutes_this_week    ?? raw.completedMinutesThisWeek    ?? 0),
    answeredQuestionsThisWeek:   Number(raw.answered_questions_this_week   ?? raw.answeredQuestionsThisWeek   ?? 0),
    activeDaysGoal:              Number(raw.active_days_goal               ?? raw.activeDaysGoal              ?? 0),
    activeDaysPercent:           Number(raw.active_days_percent            ?? raw.activeDaysPercent           ?? 0),
    weeklyMinutesTarget:         Number(raw.weekly_minutes_target          ?? raw.weeklyMinutesTarget         ?? 0),
    minutesPercent:              Number(raw.minutes_percent                ?? raw.minutesPercent              ?? 0),
    questionsPercent:            Number(raw.questions_percent              ?? raw.questionsPercent            ?? 0),
    weeklyCompletionPercent:     Number(raw.weekly_completion_percent      ?? raw.weeklyCompletionPercent     ?? 0),
    updatedAt:                   raw.updated_at ?? raw.updatedAt,
  };
}

export function fetchStudyPlan(): Promise<StudyPlanData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return api.get<Record<string, any>>("/study-plan").then(normalize);
}

export function saveStudyPlan(payload: Partial<StudyPlanData>): Promise<StudyPlanData> {
  const body: Record<string, unknown> = {};
  if (payload.studyDaysPerWeek  != null) body.study_days_per_week    = payload.studyDaysPerWeek;
  if (payload.minutesPerDay     != null) body.minutes_per_day        = payload.minutesPerDay;
  if (payload.weeklyQuestionsGoal != null) body.weekly_questions_goal = payload.weeklyQuestionsGoal;
  if (payload.focusMode         != null) body.focus_mode             = payload.focusMode;
  if (payload.preferredPeriod   != null) body.preferred_period       = payload.preferredPeriod;
  if (payload.priorityDisciplines != null) body.priority_disciplines = payload.priorityDisciplines;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return api.post<Record<string, any>>("/study-plan", body).then(normalize);
}
