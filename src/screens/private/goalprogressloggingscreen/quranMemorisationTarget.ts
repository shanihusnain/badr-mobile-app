import { GoalId } from "../home/components/goalsData";
import { getMemorizedAyahCount, getRemainingAyahCount } from "./quranMemorisationSurahData";
import { getSurahMemorisationGoalById } from "./quranMemorisationSurahGoals";
import { getSurahVerseCount } from "./quranSurahVerseMap";

export type SurahMemorisationGoalId = "quran-memorisationBySurah";

export type QuranMemorisationTargetConfig = {
  surahId: string;
  surahName: string;
  totalAyahs: number;
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

export function getNextMemorisationAyah(surahId: string): number {
  return getMemorizedAyahCount(surahId) + 1;
}

export function isValidMemorisationAyahRange(
  surahId: string,
  startAyah: number,
  endAyah: number,
): boolean {
  const minStart = getNextMemorisationAyah(surahId);
  const total = getSurahVerseCount(surahId);
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
): QuranMemorisationTargetConfig {
  return {
    surahId,
    surahName,
    totalAyahs: getSurahVerseCount(surahId),
  };
}

export function getMemorisationTargetConfigForSurah(
  surahId: string,
): QuranMemorisationTargetConfig | null {
  const goal = getSurahMemorisationGoalById(surahId);
  if (!goal) return null;
  return toMemorisationTargetConfig(goal.id, goal.surahName);
}

/** Placeholder default when no surah is pre-selected. */
export function getQuranMemorisationTargetConfig(
  _goalId: SurahMemorisationGoalId,
): QuranMemorisationTargetConfig {
  return toMemorisationTargetConfig("surah-al-baqarah", "Al-Baqarah");
}
