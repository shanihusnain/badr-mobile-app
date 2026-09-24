import { getJuzVerseCountFromMap } from "./quranJuzVerseMap";
import {
  getLastCompletedAyatForJuz,
  getMinAyatStartForJuz,
  isJuzFullyCompletedInLogs,
  type JuzCompletionType,
} from "./quranRecitationJuzData";
import {
  buildCompletionSteps,
  clampJuz,
  createDefaultDuration,
  isValidCompletionType,
  isValidJuzRange,
  isValidStartTime,
  isValidTimeSpent,
  MAX_JUZ,
  MIN_JUZ,
  type CompletionDurationValue,
  type QuranCompletionStepId,
} from "./quranRecitationCompletionTarget";

export type { JuzCompletionType, QuranCompletionStepId, CompletionDurationValue };

export type QuranJuzStepId = QuranCompletionStepId;

export function buildJuzRecitationSteps(
  completionType: JuzCompletionType,
): QuranJuzStepId[] {
  return buildCompletionSteps(completionType);
}

export function getMinPartialJuz(
  completionType: JuzCompletionType,
  fullEndJuz: number,
  goalMinJuz = MIN_JUZ,
  goalMaxJuz = MAX_JUZ,
): number {
  const goalMin = Math.max(MIN_JUZ, Math.min(goalMinJuz, goalMaxJuz));
  const goalMax = Math.min(MAX_JUZ, Math.max(goalMinJuz, goalMaxJuz));
  if (completionType !== "both") return goalMin;
  return Math.min(goalMax, Math.max(goalMin, clampJuz(fullEndJuz) + 1));
}

export function isValidPartialJuzForType(
  partialJuz: number,
  completionType: JuzCompletionType,
  fullEndJuz: number,
  goalMinJuz = MIN_JUZ,
  goalMaxJuz = MAX_JUZ,
): boolean {
  const goalMin = Math.max(MIN_JUZ, Math.min(goalMinJuz, goalMaxJuz));
  const goalMax = Math.min(MAX_JUZ, Math.max(goalMinJuz, goalMaxJuz));
  if (partialJuz < goalMin || partialJuz > goalMax) return false;
  if (!isValidJuzRange(partialJuz, partialJuz)) return false;
  if (isJuzFullyCompletedInLogs(partialJuz)) return false;

  if (completionType === "both") {
    return partialJuz > clampJuz(fullEndJuz);
  }

  return true;
}

export function isValidGoalJuzRange(
  startJuz: number,
  endJuz: number,
  goalMinJuz = MIN_JUZ,
  goalMaxJuz = MAX_JUZ,
): boolean {
  const goalMin = Math.max(MIN_JUZ, Math.min(goalMinJuz, goalMaxJuz));
  const goalMax = Math.min(MAX_JUZ, Math.max(goalMinJuz, goalMaxJuz));
  if (!isValidJuzRange(startJuz, endJuz)) return false;
  return startJuz >= goalMin && endJuz <= goalMax;
}

export function isValidJuzAyatRange(
  juz: number,
  startAyat: number,
  endAyat: number,
  minStartAyat = 1,
): boolean {
  const maxAyat = getJuzVerseCountFromMap(juz);
  const start = Math.round(startAyat);
  const end = Math.round(endAyat);
  const minStart = Math.max(1, Math.round(minStartAyat));

  if (start < minStart) return false;
  if (end < start) return false;
  if (end > maxAyat) return false;

  const lastCompleted = getLastCompletedAyatForJuz(juz);
  if (lastCompleted > 0 && start <= lastCompleted) return false;

  return true;
}

export {
  clampJuz,
  createDefaultDuration,
  getMinAyatStartForJuz,
  getLastCompletedAyatForJuz,
  isValidCompletionType,
  isValidJuzRange,
  isValidStartTime,
  isValidTimeSpent,
  MAX_JUZ,
  MIN_JUZ,
};
