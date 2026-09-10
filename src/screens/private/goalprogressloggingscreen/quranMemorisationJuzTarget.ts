import { GoalId } from "../home/components/goalsData";
import {
  getMemorizedJuzAyahCount,
  getRemainingJuzAyahCount,
} from "./quranMemorisationJuzData";
import { getJuzMemorisationGoalById } from "./quranMemorisationJuzGoals";
import { getJuzVerseCount } from "./quranMemorisationJuzVerse";

export type JuzMemorisationGoalId = "quran-memorisationByJuz";

export type QuranMemorisationJuzTargetConfig = {
  juzId: string;
  juzName: string;
  juzNumber: number;
  totalAyahs: number;
};

export type QuranMemorisationJuzStepId =
  | "juz"
  | "ayahCount"
  | "startTime"
  | "timeSpent";

export const isJuzMemorisationGoalId = (
  goalId: GoalId,
): goalId is JuzMemorisationGoalId =>
  goalId === "quran-memorisationByJuz";

const MEMORISATION_JUZ_FLOW_STEPS: QuranMemorisationJuzStepId[] = [
  "startTime",
  "ayahCount",
  "timeSpent",
];

export function buildJuzMemorisationSteps(
  includeJuzSelection: boolean,
): QuranMemorisationJuzStepId[] {
  if (includeJuzSelection) {
    return ["juz", ...MEMORISATION_JUZ_FLOW_STEPS];
  }
  return MEMORISATION_JUZ_FLOW_STEPS;
}

export function getNextJuzMemorisationAyah(juzId: string): number {
  return getMemorizedJuzAyahCount(juzId) + 1;
}

export function isValidJuzMemorisationAyahRange(
  juzId: string,
  startAyah: number,
  endAyah: number,
): boolean {
  const minStart = getNextJuzMemorisationAyah(juzId);
  const total = getJuzVerseCount(juzId);
  const start = Math.round(startAyah);
  const end = Math.round(endAyah);

  return start >= minStart && end >= start && end <= total;
}

export function getJuzAyahsMemorizedFromRange(
  startAyah: number,
  endAyah: number,
): number {
  return Math.max(0, Math.round(endAyah) - Math.round(startAyah) + 1);
}

/** @deprecated Use isValidJuzMemorisationAyahRange */
export function isValidJuzAyahsMemorizedToday(
  juzId: string,
  count: number,
): boolean {
  const remaining = getRemainingJuzAyahCount(juzId);
  const value = Math.round(count);
  return value >= 1 && value <= remaining;
}

export { isValidTimeSpent } from "./quranRecitationTarget";

export function toJuzMemorisationTargetConfig(
  juzId: string,
  juzName: string,
  juzNumber: number,
  totalAyahs: number,
): QuranMemorisationJuzTargetConfig {
  return {
    juzId,
    juzName,
    juzNumber,
    totalAyahs,
  };
}

export function getMemorisationTargetConfigForJuz(
  juzId: string,
): QuranMemorisationJuzTargetConfig | null {
  const goal = getJuzMemorisationGoalById(juzId);
  if (!goal) return null;
  return toJuzMemorisationTargetConfig(
    goal.id,
    goal.juzName,
    goal.juzNumber,
    goal.totalAyahs,
  );
}

export function getQuranMemorisationJuzTargetConfig(
  _goalId: JuzMemorisationGoalId,
): QuranMemorisationJuzTargetConfig {
  return toJuzMemorisationTargetConfig(
    "juz-1",
    "Juz 1",
    1,
    getJuzVerseCount("juz-1"),
  );
}
