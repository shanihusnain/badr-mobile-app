import { GoalId } from "../home/components/goalsData";
import {
  getMemorizedHizbAyahCount,
  getRemainingHizbAyahCount,
} from "./quranMemorisationHizbData";
import { getHizbMemorisationGoalById } from "./quranMemorisationHizbGoals";
import { getHizbVerseCount } from "./quranHizbVerseMap";

export type HizbMemorisationGoalId = "quran-memorisationByHizb";

export type QuranMemorisationHizbTargetConfig = {
  hizbId: string;
  hizbName: string;
  totalAyahs: number;
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

export function getNextHizbMemorisationAyah(hizbId: string): number {
  return getMemorizedHizbAyahCount(hizbId) + 1;
}

export function isValidHizbMemorisationAyahRange(
  hizbId: string,
  startAyah: number,
  endAyah: number,
): boolean {
  const minStart = getNextHizbMemorisationAyah(hizbId);
  const total = getHizbVerseCount(hizbId);
  const start = Math.round(startAyah);
  const end = Math.round(endAyah);

  return start >= minStart && end >= start && end <= total;
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
): QuranMemorisationHizbTargetConfig {
  return {
    hizbId,
    hizbName,
    totalAyahs: getHizbVerseCount(hizbId),
  };
}

export function getMemorisationTargetConfigForHizb(
  hizbId: string,
): QuranMemorisationHizbTargetConfig | null {
  const goal = getHizbMemorisationGoalById(hizbId);
  if (!goal) return null;
  return toHizbMemorisationTargetConfig(goal.id, goal.displayName);
}

export function getQuranMemorisationHizbTargetConfig(
  _goalId: HizbMemorisationGoalId,
): QuranMemorisationHizbTargetConfig {
  return toHizbMemorisationTargetConfig("hizb-1", "Hizb 1");
}

export function getMaxHizbAyahsMemorizedToday(hizbId: string): number {
  return Math.max(1, getRemainingHizbAyahCount(hizbId));
}
