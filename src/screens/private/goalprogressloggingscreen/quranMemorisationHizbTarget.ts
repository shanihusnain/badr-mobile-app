import { GoalId } from "../home/components/goalsData";
import {
  getMemorizedHizbAyahCount,
  getRemainingHizbAyahCount,
} from "./quranMemorisationHizbData";
import {
  getHizbMemorisationGoalById,
  type HizbMemorisationGoal,
} from "./quranMemorisationHizbGoals";
import { getHizbVerseCount } from "./quranHizbVerseMap";

export type HizbMemorisationGoalId = "quran-memorisationByHizb";

export type QuranMemorisationHizbTargetConfig = {
  hizbId: string;
  hizbName: string;
  totalAyahs: number;
  /** Verses already memorized (from frame/API when available). */
  memorizedAyahs?: number;
};

export type QuranMemorisationHizbStepId =
  | "hizb"
  | "date"
  | "startTime"
  | "ayahCount"
  | "timeSpent";

export const isHizbMemorisationGoalId = (
  goalId: GoalId,
): goalId is HizbMemorisationGoalId =>
  goalId === "quran-memorisationByHizb";

const MEMORISATION_HIZB_FLOW_STEPS: QuranMemorisationHizbStepId[] = [
  "date",
  "startTime",
  "ayahCount",
  "timeSpent",
];

export function buildHizbMemorisationSteps(
  includeHizbSelection: boolean,
): QuranMemorisationHizbStepId[] {
  if (includeHizbSelection) {
    return ["hizb", ...MEMORISATION_HIZB_FLOW_STEPS];
  }
  return MEMORISATION_HIZB_FLOW_STEPS;
}

export function toMemorisationTargetConfigFromHizbGoal(
  goal: Pick<
    HizbMemorisationGoal,
    "id" | "hizbName" | "displayName" | "totalAyahs" | "memorizedAyahs"
  >,
): QuranMemorisationHizbTargetConfig {
  return {
    hizbId: goal.id,
    hizbName: goal.hizbName || goal.displayName,
    totalAyahs: Math.max(1, goal.totalAyahs || getHizbVerseCount(goal.id)),
    memorizedAyahs: Math.max(0, goal.memorizedAyahs ?? 0),
  };
}

export function getNextHizbMemorisationAyah(
  hizbId: string,
  memorizedAyahsOverride?: number,
): number {
  const memorized =
    memorizedAyahsOverride != null
      ? Math.max(0, memorizedAyahsOverride)
      : getMemorizedHizbAyahCount(hizbId);
  return memorized + 1;
}

export function isValidHizbMemorisationAyahRange(
  hizbId: string,
  startAyah: number,
  endAyah: number,
  options?: { totalAyahs?: number; memorizedAyahs?: number },
): boolean {
  const minStart = getNextHizbMemorisationAyah(
    hizbId,
    options?.memorizedAyahs,
  );
  const total =
    options?.totalAyahs != null && options.totalAyahs > 0
      ? options.totalAyahs
      : getHizbVerseCount(hizbId);
  const start = Math.round(startAyah);
  const end = Math.round(endAyah);

  return total > 0 && start >= minStart && end >= start && end <= total;
}

export function getHizbAyahsMemorizedFromRange(
  startAyah: number,
  endAyah: number,
): number {
  return Math.max(0, Math.round(endAyah) - Math.round(startAyah) + 1);
}

export function toHizbMemorisationTargetConfig(
  hizbId: string,
  hizbName: string,
  totalAyahs?: number,
  memorizedAyahs?: number,
): QuranMemorisationHizbTargetConfig {
  return {
    hizbId,
    hizbName,
    totalAyahs: Math.max(1, totalAyahs ?? (getHizbVerseCount(hizbId) || 1)),
    memorizedAyahs: Math.max(0, memorizedAyahs ?? 0),
  };
}

export function getMemorisationTargetConfigForHizb(
  hizbId: string,
  activeGoal?: HizbMemorisationGoal | null,
): QuranMemorisationHizbTargetConfig | null {
  if (activeGoal && activeGoal.id === hizbId) {
    return toMemorisationTargetConfigFromHizbGoal(activeGoal);
  }
  const goal = getHizbMemorisationGoalById(hizbId);
  if (goal) return toMemorisationTargetConfigFromHizbGoal(goal);
  const fromId = Number(hizbId);
  if (Number.isFinite(fromId) && fromId > 0) {
    return toHizbMemorisationTargetConfig(
      hizbId,
      `Hizb ${fromId}`,
      getHizbVerseCount(hizbId) || undefined,
    );
  }
  return null;
}

export function getQuranMemorisationHizbTargetConfig(
  _goalId: HizbMemorisationGoalId,
): QuranMemorisationHizbTargetConfig {
  return toHizbMemorisationTargetConfig("hizb-1", "Hizb 1");
}

export function getMaxHizbAyahsMemorizedToday(hizbId: string): number {
  return Math.max(1, getRemainingHizbAyahCount(hizbId));
}
