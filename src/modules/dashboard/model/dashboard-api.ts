import { api } from "@/src/lib/api-client";
import type {
  HomeRecommendationItem,
  HomeRecommendationsData,
  ProfileScoreData,
  ProfileRecentActivityDay,
  ProfileRecentCompletedSession,
  ProfileDisciplineStat,
  ProfileSubcategoryInsight,
  ProfilePerformanceInsight,
  ProfileAvatarStoreItem,
} from "@/src/types/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProfile(raw: Record<string, any>): ProfileScoreData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normActivity = (a: Record<string, any>): ProfileRecentActivityDay => ({
    date:     String(a.date    ?? ""),
    active:   Boolean(a.active),
    isToday:  Boolean(a.is_today ?? a.isToday),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normSession = (s: Record<string, any>): ProfileRecentCompletedSession => ({
    discipline:        String(s.discipline         ?? ""),
    subcategory:       String(s.subcategory        ?? ""),
    answeredQuestions: Number(s.answered_questions ?? s.answeredQuestions ?? 0),
    totalQuestions:    Number(s.total_questions    ?? s.totalQuestions    ?? 0),
    correctAnswers:    Number(s.correct_answers    ?? s.correctAnswers    ?? 0),
    accuracyPercent:   Number(s.accuracy_percent   ?? s.accuracyPercent   ?? 0),
    completedAt:       s.completed_at ?? s.completedAt,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normDisciplineStat = (d: Record<string, any>): ProfileDisciplineStat => ({
    discipline: String(d.discipline ?? ""),
    count:      Number(d.count      ?? 0),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normSubcategoryInsight = (x: Record<string, any>): ProfileSubcategoryInsight => ({
    discipline:      String(x.discipline       ?? ""),
    subcategory:     String(x.subcategory      ?? ""),
    accuracyPercent: Number(x.accuracy_percent ?? x.accuracyPercent ?? 0),
    totalAttempts:   Number(x.total_attempts   ?? x.totalAttempts   ?? 0),
    totalCorrect:    Number(x.total_correct    ?? x.totalCorrect    ?? 0),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normAiInsight = (ai: Record<string, any>): ProfilePerformanceInsight => ({
    title:       String(ai.title        ?? ""),
    summary:     String(ai.summary      ?? ""),
    priority:    String(ai.priority     ?? ""),
    riskLevel:   String(ai.risk_level   ?? ai.riskLevel   ?? ""),
    nextAction:  String(ai.next_action  ?? ai.nextAction  ?? ""),
    confidence:  Number(ai.confidence   ?? 0),
    generatedAt: ai.generated_at ?? ai.generatedAt,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normAvatarStore = (a: Record<string, any>): ProfileAvatarStoreItem => ({
    seed:           String(a.seed             ?? ""),
    title:          String(a.title            ?? ""),
    theme:          String(a.theme            ?? ""),
    rarity:         String(a.rarity           ?? ""),
    costCoins:      Number(a.cost_coins       ?? a.costCoins      ?? 0),
    costHalfUnits:  Number(a.cost_half_units  ?? a.costHalfUnits  ?? 0),
    owned:          Boolean(a.owned),
    equipped:       Boolean(a.equipped),
    affordable:     Boolean(a.affordable),
    isDefault:      Boolean(a.is_default      ?? a.isDefault),
  });

  const aiRaw = raw.ai_insight ?? raw.aiInsight;
  const weakRaw = raw.weakest_subcategory ?? raw.weakestSubcategory;
  const strongRaw = raw.strongest_subcategory ?? raw.strongestSubcategory;

  return {
    score:                           Number(raw.score                              ?? 0),
    exactScore:                      Number(raw.exact_score                        ?? raw.exactScore                        ?? 0),
    level:                           String(raw.level                              ?? ""),
    coinsBalance:                    Number(raw.coins_balance                      ?? raw.coinsBalance                      ?? 0),
    coinsHalfUnits:                  Number(raw.coins_half_units                   ?? raw.coinsHalfUnits                    ?? 0),
    equippedAvatarSeed:              String(raw.equipped_avatar_seed               ?? raw.equippedAvatarSeed                ?? ""),
    ownedAvatarSeeds:                (raw.owned_avatar_seeds                       ?? raw.ownedAvatarSeeds                  ?? []) as string[],
    avatarStore:                     ((raw.avatar_store ?? raw.avatarStore ?? []) as Record<string, any>[]).map(normAvatarStore),
    recentIndex:                     Number(raw.recent_index                       ?? raw.recentIndex                       ?? 0),
    recentIndexReady:                Boolean(raw.recent_index_ready                ?? raw.recentIndexReady),
    questionsAnswered:               Number(raw.questions_answered                 ?? raw.questionsAnswered                 ?? 0),
    uniqueQuestionsAnswered:         Number(raw.unique_questions_answered          ?? raw.uniqueQuestionsAnswered           ?? 0),
    questionBankTotal:               Number(raw.question_bank_total                ?? raw.questionBankTotal                 ?? 0),
    disciplinesCovered:              Number(raw.disciplines_covered                ?? raw.disciplinesCovered                ?? 0),
    totalCorrect:                    Number(raw.total_correct                      ?? raw.totalCorrect                      ?? 0),
    accuracyPercent:                 Number(raw.accuracy_percent                   ?? raw.accuracyPercent                   ?? 0),
    completedSessions:               Number(raw.completed_sessions                 ?? raw.completedSessions                 ?? 0),
    totalStudySeconds:               Number(raw.total_study_seconds                ?? raw.totalStudySeconds                 ?? 0),
    activeDaysLast30:                Number(raw.active_days_last_30                ?? raw.activeDaysLast30                  ?? 0),
    currentStreakDays:               Number(raw.current_streak_days                ?? raw.currentStreakDays                 ?? 0),
    recentActivityWindow:            ((raw.recent_activity_window                  ?? raw.recentActivityWindow              ?? []) as Record<string, any>[]).map(normActivity),
    recentCompletedSessionsPreview:  ((raw.recent_completed_sessions_preview       ?? raw.recentCompletedSessionsPreview    ?? []) as Record<string, any>[]).map(normSession),
    consistencyWindowDays:           Number(raw.consistency_window_days            ?? raw.consistencyWindowDays             ?? 0),
    lastActivityAt:                  raw.last_activity_at                          ?? raw.lastActivityAt,
    nextLevel:                       raw.next_level                                ?? raw.nextLevel,
    pointsToNextLevel:               Number(raw.points_to_next_level               ?? raw.pointsToNextLevel                 ?? 0),
    questionsByDiscipline:           ((raw.questions_by_discipline                 ?? raw.questionsByDiscipline             ?? []) as Record<string, any>[]).map(normDisciplineStat),
    strongestSubcategory:            strongRaw ? normSubcategoryInsight(strongRaw) : undefined,
    weakestSubcategory:              weakRaw   ? normSubcategoryInsight(weakRaw)   : undefined,
    attentionSubcategoriesCount:     Number(raw.attention_subcategories_count      ?? raw.attentionSubcategoriesCount       ?? 0),
    attentionAccuracyThreshold:      Number(raw.attention_accuracy_threshold       ?? raw.attentionAccuracyThreshold        ?? 0),
    aiInsight:                       aiRaw ? normAiInsight(aiRaw) : undefined,
  };
}

export function fetchProfile(): Promise<ProfileScoreData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return api.get<Record<string, any>>("/users/profile").then(normalizeProfile);
}

// API returns snake_case — normalize to camelCase to match TypeScript types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItem(raw: Record<string, any>): HomeRecommendationItem {
  return {
    title:           String(raw.title        ?? "").trim(),
    discipline:      String(raw.discipline   ?? "").trim(),
    subcategory:     String(raw.subcategory  ?? "").trim(),
    description:     String(raw.description  ?? "").trim(),
    badgeLabel:      String(raw.badge_label  ?? raw.badgeLabel  ?? "Moderado").trim(),
    badgeTone:       String(raw.badge_tone   ?? raw.badgeTone   ?? "moderate").trim(),
    countLabel:      String(raw.count_label  ?? raw.countLabel  ?? "").trim(),
    reasonLabel:     String(raw.reason_label ?? raw.reasonLabel ?? "").trim(),
    source:          String(raw.source       ?? "").trim(),
    accuracyPercent: raw.accuracy_percent != null
      ? Number(raw.accuracy_percent)
      : raw.accuracyPercent != null
        ? Number(raw.accuracyPercent)
        : undefined,
    totalAttempts:   Number(raw.total_attempts  ?? raw.totalAttempts  ?? 0),
    totalQuestions:  Number(raw.total_questions ?? raw.totalQuestions ?? 0),
  };
}

export function fetchRecommendations(): Promise<HomeRecommendationsData> {
  return api
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .get<{ title: string; subtitle: string; items: Record<string, any>[] }>("/users/recommendations")
    .then((res) => ({
      title:    String(res.title    ?? "").trim() || "Recomendado para Hoje",
      subtitle: String(res.subtitle ?? "").trim() || "Sem recomendações disponíveis por enquanto.",
      items:    (res.items ?? [])
        .map(normalizeItem)
        .filter((item) => item.title.length > 0 && item.discipline.length > 0),
    }));
}
