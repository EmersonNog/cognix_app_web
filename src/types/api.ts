// --- Questions ---

export interface QuestionAlternative {
  letter: string;
  text: string;
  fileUrl?: string;
}

export interface QuestionItem {
  id: number;
  statement: string;
  alternatives: QuestionAlternative[];
  subcategory: string;
  discipline: string;
  year?: number;
  alternativesIntroduction?: string;
  answerKey?: string;
  tip?: string;
}

export interface QuestionsPage {
  items: QuestionItem[];
  total?: number;
  limit: number;
  offset: number;
}

export interface SubcategoryItem {
  name: string;
  total: number;
  discipline: string;
}

// --- Attempts ---

export interface AttemptPayload {
  question_id: number;
  selected_letter: string;
  discipline: string;
  subcategory: string;
}

export interface AttemptResult {
  question_id: number;
  selected_letter: string;
  is_correct: boolean | null;
  correct_letter?: string;
}

// --- Profile ---

export interface ProfileDisciplineStat {
  discipline: string;
  count: number;
}

export interface ProfileRecentActivityDay {
  date: string;
  active: boolean;
  isToday: boolean;
}

export interface ProfileRecentCompletedSession {
  discipline: string;
  subcategory: string;
  answeredQuestions: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
  completedAt?: string;
}

export interface ProfileSubcategoryInsight {
  discipline: string;
  subcategory: string;
  accuracyPercent: number;
  totalAttempts: number;
  totalCorrect: number;
}

export interface ProfilePerformanceInsight {
  title: string;
  summary: string;
  priority: string;
  riskLevel: string;
  nextAction: string;
  confidence: number;
  generatedAt?: string;
}

export interface ProfileAvatarStoreItem {
  seed: string;
  title: string;
  theme: string;
  rarity: string;
  costCoins: number;
  costHalfUnits: number;
  owned: boolean;
  equipped: boolean;
  affordable: boolean;
  isDefault: boolean;
}

export interface ProfileScoreData {
  score: number;
  exactScore: number;
  level: string;
  coinsBalance: number;
  coinsHalfUnits: number;
  equippedAvatarSeed: string;
  ownedAvatarSeeds: string[];
  avatarStore: ProfileAvatarStoreItem[];
  recentIndex: number;
  recentIndexReady: boolean;
  questionsAnswered: number;
  uniqueQuestionsAnswered: number;
  questionBankTotal: number;
  disciplinesCovered: number;
  totalCorrect: number;
  accuracyPercent: number;
  completedSessions: number;
  totalStudySeconds: number;
  activeDaysLast30: number;
  currentStreakDays: number;
  recentActivityWindow: ProfileRecentActivityDay[];
  recentCompletedSessionsPreview: ProfileRecentCompletedSession[];
  consistencyWindowDays: number;
  lastActivityAt?: string;
  nextLevel?: string;
  pointsToNextLevel: number;
  questionsByDiscipline: ProfileDisciplineStat[];
  strongestSubcategory?: ProfileSubcategoryInsight;
  weakestSubcategory?: ProfileSubcategoryInsight;
  attentionSubcategoriesCount: number;
  attentionAccuracyThreshold: number;
  aiInsight?: ProfilePerformanceInsight;
}

// --- Recommendations ---

export interface HomeRecommendationItem {
  title: string;
  discipline: string;
  subcategory: string;
  description: string;
  badgeLabel: string;
  badgeTone: string;
  countLabel: string;
  reasonLabel: string;
  source: string;
  accuracyPercent?: number;
  totalAttempts: number;
  totalQuestions: number;
}

export interface HomeRecommendationsData {
  title: string;
  subtitle: string;
  items: HomeRecommendationItem[];
}

// --- Study Plan ---

export interface StudyPlanData {
  configured: boolean;
  studyDaysPerWeek: number;
  minutesPerDay: number;
  weeklyQuestionsGoal: number;
  focusMode: string;
  preferredPeriod: string;
  priorityDisciplines: string[];
  weekStart?: string;
  weekEnd?: string;
  activeDaysThisWeek: number;
  completedMinutesThisWeek: number;
  answeredQuestionsThisWeek: number;
  activeDaysGoal: number;
  activeDaysPercent: number;
  weeklyMinutesTarget: number;
  minutesPercent: number;
  questionsPercent: number;
  weeklyCompletionPercent: number;
  updatedAt?: string;
}

// --- Entitlements ---

export interface EntitlementStatus {
  accessStatus: "subscription" | "trial" | "trial_available" | "trial_expired";
  hasFullAccess: boolean;
  activeSource: string | null;
  eligibleForMonthlyIntroOffer: boolean;
  features: string[];
  trialAvailable: boolean;
  trialStatus: "not_started" | "active" | "expired";
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  subscriptionPlanId: string | null;
  subscriptionHasAccess: boolean;
  subscriptionAccessEndsAt: string | null;
  subscriptionWillCancelAtPeriodEnd: boolean;
  subscriptionCanCancel: boolean;
  subscriptionProvider: string | null;
}

// --- Sessions ---

export interface TrainingSessionOverviewItem {
  discipline: string;
  subcategory: string;
  completed: boolean;
  answeredQuestions: number;
  totalQuestions: number;
  progress: number;
  sessionAt?: string;
}

export interface TrainingSessionsOverview {
  completedSessions: number;
  inProgressSessions: number;
  latestSession?: TrainingSessionOverviewItem;
}
