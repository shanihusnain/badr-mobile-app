import { GoalId } from "../home/components/goalsData";
import {
  getMemorizedJuzAyahCount,
  getRemainingJuzAyahCount,
} from "./quranMemorisationJuzData";
import {
  getJuzMemorisationGoalById,
  type JuzMemorisationGoal,
} from "./quranMemorisationJuzGoals";
import { getJuzVerseCount } from "./quranMemorisationJuzVerse";

export type JuzMemorisationGoalId = "quran-memorisationByJuz";

export type QuranMemorisationJuzTargetConfig = {
  juzId: string;
  juzName: string;
  juzNumber: number;
  totalAyahs: number;
  /** Verses already memorized (from frame/API when available). */
  memorizedAyahs?: number;
};

export type QuranMemorisationJuzStepId =
  | "juz"
  | "date"
  | "startTime"
  | "ayahCount"
  | "timeSpent";

export const isJuzMemorisationGoalId = (
  goalId: GoalId,
): goalId is JuzMemorisationGoalId =>
  goalId === "quran-memorisationByJuz";

const MEMORISATION_JUZ_FLOW_STEPS: QuranMemorisationJuzStepId[] = [
  "date",
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

export function toMemorisationTargetConfigFromJuzGoal(
  goal: Pick<
    JuzMemorisationGoal,
    | "id"
    | "juzName"
    | "displayName"
    | "juzNumber"
    | "itemNumber"
    | "totalAyahs"
    | "memorizedAyahs"
  >,
): QuranMemorisationJuzTargetConfig {
  const juzNumber =
    goal.juzNumber ||
    goal.itemNumber ||
    Number(String(goal.id).replace(/^juz-/i, "")) ||
    1;
  return {
    juzId: goal.id,
    juzName: goal.juzName || goal.displayName || `Juz ${juzNumber}`,
    juzNumber,
    totalAyahs: Math.max(1, goal.totalAyahs || getJuzVerseCount(goal.id)),
    memorizedAyahs: Math.max(0, goal.memorizedAyahs ?? 0),
  };
}

export function getNextJuzMemorisationAyah(
  juzId: string,
  memorizedAyahsOverride?: number,
): number {
  const memorized =
    memorizedAyahsOverride != null
      ? Math.max(0, memorizedAyahsOverride)
      : getMemorizedJuzAyahCount(juzId);
  return memorized + 1;
}

export function isValidJuzMemorisationAyahRange(
  juzId: string,
  startAyah: number,
  endAyah: number,
  options?: { totalAyahs?: number; memorizedAyahs?: number },
): boolean {
  const minStart = getNextJuzMemorisationAyah(juzId, options?.memorizedAyahs);
  const total =
    options?.totalAyahs != null && options.totalAyahs > 0
      ? options.totalAyahs
      : getJuzVerseCount(juzId);
  const start = Math.round(startAyah);
  const end = Math.round(endAyah);

  return total > 0 && start >= minStart && end >= start && end <= total;
}

export function getJuzAyahsMemorizedFromRange(
  startAyah: number,
  endAyah: number,
): number {
  return Math.max(0, Math.round(endAyah) - Math.round(startAyah) + 1);
}

export function toJuzMemorisationTargetConfig(
  juzId: string,
  juzName: string,
  juzNumber?: number,
  totalAyahs?: number,
  memorizedAyahs?: number,
): QuranMemorisationJuzTargetConfig {
  const n =
    juzNumber ?? (Number(String(juzId).replace(/^juz-/i, "")) || 1);
  return {
    juzId,
    juzName,
    juzNumber: n,
    totalAyahs: Math.max(1, totalAyahs ?? (getJuzVerseCount(juzId) || 1)),
    memorizedAyahs: Math.max(0, memorizedAyahs ?? 0),
  };
}

export function getMemorisationTargetConfigForJuz(
  juzId: string,
  activeGoal?: JuzMemorisationGoal | null,
): QuranMemorisationJuzTargetConfig | null {
  if (activeGoal && activeGoal.id === juzId) {
    return toMemorisationTargetConfigFromJuzGoal(activeGoal);
  }
  const goal = getJuzMemorisationGoalById(juzId);
  if (goal) return toMemorisationTargetConfigFromJuzGoal(goal);
  const fromId = Number(String(juzId).replace(/^juz-/i, ""));
  if (Number.isFinite(fromId) && fromId > 0) {
    return toJuzMemorisationTargetConfig(
      juzId,
      `Juz ${fromId}`,
      fromId,
      getJuzVerseCount(juzId) || undefined,
    );
  }
  return null;
}

export function getQuranMemorisationJuzTargetConfig(
  _goalId: JuzMemorisationGoalId,
): QuranMemorisationJuzTargetConfig {
  return toJuzMemorisationTargetConfig("juz-1", "Juz 1", 1);
}

export function getMaxJuzAyahsMemorizedToday(juzId: string): number {
  return Math.max(1, getRemainingJuzAyahCount(juzId));
}
