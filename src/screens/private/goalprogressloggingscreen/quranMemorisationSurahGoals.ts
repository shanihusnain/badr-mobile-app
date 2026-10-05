import {
  getMemorizedAyahCount,
  getSurahMemorisationProgressPercent,
  isSurahFullyMemorized,
} from "./quranMemorisationSurahData";
import {
  SELECTED_SURAH_GOALS,
  getSelectedMemorisationSurahIds,
} from "./quranMemorisationSurahSelection";
import { getSurahVerseCount } from "./quranSurahVerseMap";

export { getSelectedMemorisationSurahIds };

export type SurahMemorisationStatusKind =
  | "not-started"
  | "in-progress"
  | "completed";

export type SurahMemorisationGoal = {
  id: string;
  /** Quran chapter number — frame API `itemNumber`. */
  itemNumber?: number;
  surahName: string;
  /** Frame `items[].subtitle`, e.g. "(total 7 verses)". */
  subtitle?: string;
  /** Frame `items[].pill.label`, e.g. "57% Achieved". */
  pillLabel?: string;
  totalAyahs: number;
  memorizedAyahs: number;
  progressPercentage: number;
  completed: boolean;
  /** Frame `items[].canLog` — when false, hide/disable log CTA. */
  canLog?: boolean;
  status: SurahMemorisationStatusKind;
};

export type MemorisationSurahFilterId = "all" | string;

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

/** Mock fallback itemNumbers for local SELECTED_SURAH_GOALS ids. */
const MOCK_SURAH_ITEM_NUMBERS: Record<string, number> = {
  "surah-al-baqarah": 2,
  "surah-aal-imran": 3,
  "surah-an-nisa": 4,
  "surah-al-maidah": 5,
};

function buildGoal(id: string, surahName: string): SurahMemorisationGoal {
  const totalAyahs = getSurahVerseCount(id);
  const memorizedAyahs = getMemorizedAyahCount(id);
  const completed = isSurahFullyMemorized(id);
  const progressPercentage = getSurahMemorisationProgressPercent(id);

  return {
    id,
    itemNumber: MOCK_SURAH_ITEM_NUMBERS[id],
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
