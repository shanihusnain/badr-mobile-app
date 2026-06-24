import {
  getMemorizedAyahCount,
  getSurahMemorisationProgressPercent,
  isSurahFullyMemorized,
} from "./quranMemorisationSurahData";
import { getSurahVerseCount } from "./quranSurahVerseMap";

export type SurahMemorisationStatusKind =
  | "not-started"
  | "in-progress"
  | "completed";

export type SurahMemorisationGoal = {
  id: string;
  surahName: string;
  totalAyahs: number;
  memorizedAyahs: number;
  progressPercentage: number;
  completed: boolean;
  status: SurahMemorisationStatusKind;
};

export type MemorisationSurahFilterId = "all" | string;

const SELECTED_SURAH_GOALS: Array<{ id: string; surahName: string }> = [
  { id: "surah-al-baqarah", surahName: "Al-Baqarah" },
  { id: "surah-aal-imran", surahName: "Aal-Imran" },
  { id: "surah-an-nisa", surahName: "An-Nisa" },
  { id: "surah-al-maidah", surahName: "Al-Ma'idah" },
];

function deriveSurahMemorisationStatus(
  memorizedAyahs: number,
  totalAyahs: number,
  completed: boolean,
): SurahMemorisationStatusKind {
  if (completed || memorizedAyahs >= totalAyahs) {
    return "completed";
  }

  if (memorizedAyahs > 0) {
    return "in-progress";
  }

  return "not-started";
}

function buildGoal(id: string, surahName: string): SurahMemorisationGoal {
  const totalAyahs = getSurahVerseCount(id);
  const memorizedAyahs = getMemorizedAyahCount(id);
  const completed = isSurahFullyMemorized(id);
  const progressPercentage = getSurahMemorisationProgressPercent(id);

  return {
    id,
    surahName,
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    status: deriveSurahMemorisationStatus(
      memorizedAyahs,
      totalAyahs,
      completed,
    ),
  };
}

export function getSelectedMemorisationSurahIds(): string[] {
  return SELECTED_SURAH_GOALS.map((goal) => goal.id);
}

export function getSurahMemorisationGoals(): SurahMemorisationGoal[] {
  return SELECTED_SURAH_GOALS.map((goal) => buildGoal(goal.id, goal.surahName));
}

export function getSurahMemorisationGoalById(
  id: string,
): SurahMemorisationGoal | undefined {
  const base = SELECTED_SURAH_GOALS.find((goal) => goal.id === id);
  if (!base) return undefined;
  return buildGoal(base.id, base.surahName);
}

export function getMemorisationGoalsForFilter(
  surahFilter: MemorisationSurahFilterId,
): SurahMemorisationGoal[] {
  const goals = getSurahMemorisationGoals();
  if (surahFilter === "all") return goals;
  const goal = goals.find((item) => item.id === surahFilter);
  return goal ? [goal] : [];
}

export function getMemorisationAggregateProgress() {
  const goals = getSurahMemorisationGoals();
  const totalMemorized = goals.reduce((sum, goal) => sum + goal.memorizedAyahs, 0);
  const totalAyahs = goals.reduce((sum, goal) => sum + goal.totalAyahs, 0);
  const completedSurahs = goals.filter((goal) => goal.completed).length;
  const percent =
    totalAyahs > 0
      ? Math.min(100, Math.round((totalMemorized / totalAyahs) * 1000) / 10)
      : 0;

  return {
    totalMemorized,
    totalAyahs,
    completedSurahs,
    totalSurahs: goals.length,
    percent,
  };
}

export function toSurahMemorisationTargetConfig(goal: SurahMemorisationGoal) {
  return {
    surahId: goal.id,
    surahName: goal.surahName,
    totalAyahs: goal.totalAyahs,
  };
}
