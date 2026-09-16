import { GoalId } from "../home/components/goalsData";
import {
  getMemorizedAyahCount,
  getRemainingAyahCount,
} from "./quranMemorisationSurahData";
import {
  getSurahMemorisationGoalById,
  type SurahMemorisationGoal,
} from "./quranMemorisationSurahGoals";
import { getSurahVerseCount } from "./quranSurahVerseMap";

export type SurahMemorisationGoalId = "quran-memorisationBySurah";

export type QuranMemorisationTargetConfig = {
  surahId: string;
  surahName: string;
  totalAyahs: number;
  /** Verses already memorized (from frame/API when available). */
  memorizedAyahs?: number;
};

export type QuranMemorisationStepId =
  | "surah"
  | "date"
  | "startTime"
  | "ayahCount"
  | "timeSpent";

export const isSurahMemorisationGoalId = (
  goalId: GoalId,
): goalId is SurahMemorisationGoalId =>
  goalId === "quran-memorisationBySurah";

const MEMORISATION_FLOW_STEPS: QuranMemorisationStepId[] = [
  "date",
  "startTime",
  "ayahCount",
  "timeSpent",
];

export function buildMemorisationSteps(
  includeSurahSelection: boolean,
): QuranMemorisationStepId[] {
  if (includeSurahSelection) {
    return ["surah", ...MEMORISATION_FLOW_STEPS];
  }
  return MEMORISATION_FLOW_STEPS;
}

export function toMemorisationTargetConfigFromGoal(
  goal: Pick<
    SurahMemorisationGoal,
    "id" | "surahName" | "totalAyahs" | "memorizedAyahs"
  >,
): QuranMemorisationTargetConfig {
  return {
    surahId: goal.id,
    surahName: goal.surahName,
    totalAyahs: Math.max(1, goal.totalAyahs || getSurahVerseCount(goal.id)),
    memorizedAyahs: Math.max(0, goal.memorizedAyahs ?? 0),
  };
}

export function getNextMemorisationAyah(
  surahId: string,
  memorizedAyahsOverride?: number,
): number {
  const memorized =
    memorizedAyahsOverride != null
      ? Math.max(0, memorizedAyahsOverride)
      : getMemorizedAyahCount(surahId);
  return memorized + 1;
}

export function isValidMemorisationAyahRange(
  surahId: string,
  startAyah: number,
  endAyah: number,
  options?: { totalAyahs?: number; memorizedAyahs?: number },
): boolean {
  const minStart = getNextMemorisationAyah(surahId, options?.memorizedAyahs);
  const total =
    options?.totalAyahs != null && options.totalAyahs > 0
      ? options.totalAyahs
      : getSurahVerseCount(surahId);
  const start = Math.round(startAyah);
  const end = Math.round(endAyah);

  return start >= minStart && end >= start && end <= total;
}

export function getAyahsMemorizedFromRange(
  startAyah: number,
  endAyah: number,
): number {
  return Math.max(0, Math.round(endAyah) - Math.round(startAyah) + 1);
}

/** @deprecated Use isValidMemorisationAyahRange */
export function isValidAyahsMemorizedToday(
  surahId: string,
  count: number,
): boolean {
  const remaining = getRemainingAyahCount(surahId);
  const value = Math.round(count);
  return value >= 1 && value <= remaining;
}

/** @deprecated Use getNextMemorisationAyah + surah total for range bounds */
export function getMaxAyahsMemorizedToday(surahId: string): number {
  return Math.max(1, getRemainingAyahCount(surahId));
}

export function toMemorisationTargetConfig(
  surahId: string,
  surahName: string,
  totalAyahs?: number,
  memorizedAyahs?: number,
): QuranMemorisationTargetConfig {
  return {
    surahId,
    surahName,
    totalAyahs: totalAyahs ?? getSurahVerseCount(surahId),
    memorizedAyahs,
  };
}

export function getMemorisationTargetConfigForSurah(
  surahId: string,
  fallbackGoal?: SurahMemorisationGoal | null,
): QuranMemorisationTargetConfig | null {
  if (fallbackGoal && fallbackGoal.id === surahId) {
    return toMemorisationTargetConfigFromGoal(fallbackGoal);
  }

  const goal = getSurahMemorisationGoalById(surahId);
  if (goal) {
    return toMemorisationTargetConfigFromGoal(goal);
  }

  // API carousel ids are numeric itemNumbers (e.g. "1").
  const itemNumber = Number(surahId);
  if (Number.isFinite(itemNumber) && itemNumber > 0) {
    return toMemorisationTargetConfig(
      surahId,
      `Surah ${itemNumber}`,
      getSurahVerseCount(surahId),
    );
  }

  return null;
}

/** Placeholder default when no surah is pre-selected. */
export function getQuranMemorisationTargetConfig(
  _goalId: SurahMemorisationGoalId,
): QuranMemorisationTargetConfig {
  return toMemorisationTargetConfig("surah-al-baqarah", "Al-Baqarah");
}
