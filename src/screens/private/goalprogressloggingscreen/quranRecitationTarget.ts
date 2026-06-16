import { GoalId } from "../home/components/goalsData";

export type RecitationFrequency = "daily" | "weekly";

export type QuranRecitationGoalId =
  | "quran-recitationBySurah"
  | "quran-recitationByCompletion"
  | "quran-recitationByJuz";

export type SurahRecitationGoalId = "quran-recitationBySurah";

export type QuranRecitationTargetConfig = {
  surahName: string;
  frequency: RecitationFrequency;
  quantity: number;
};

export type QuranRecitationStepId =
  | "date"
  | "startTime"
  | "recitationCount"
  | `duration-${number}`;

export type RecitationDurationValue = {
  hours: string;
  minutes: string;
};

export const MAX_RECITATION_QUANTITY = 5;
export const WEEKLY_CYCLE_WEEKS = 4;
export const DAILY_CYCLE_DAYS = 28;

const DEFAULT_TARGET: QuranRecitationTargetConfig = {
  surahName: "Al-Baqarah",
  frequency: "daily",
  quantity: 2,
};

export const isSurahRecitationGoalId = (
  goalId: GoalId,
): goalId is SurahRecitationGoalId => goalId === "quran-recitationBySurah";

export const isQuranRecitationGoalId = (
  goalId: GoalId,
): goalId is QuranRecitationGoalId =>
  goalId === "quran-recitationBySurah" ||
  goalId === "quran-recitationByCompletion" ||
  goalId === "quran-recitationByJuz";

export function clampRecitationQuantity(quantity: number): number {
  return Math.min(Math.max(1, Math.round(quantity)), MAX_RECITATION_QUANTITY);
}

export function getRecitationCycleTotal(
  frequency: RecitationFrequency,
  quantity: number,
): number {
  const clamped = clampRecitationQuantity(quantity);
  return (
    clamped * (frequency === "daily" ? DAILY_CYCLE_DAYS : WEEKLY_CYCLE_WEEKS)
  );
}

export function parseDurationStepIndex(
  step: QuranRecitationStepId,
): number | null {
  if (step.startsWith("duration-")) {
    const index = Number.parseInt(step.slice("duration-".length), 10);
    return Number.isNaN(index) ? null : index;
  }
  return null;
}

export function isDurationStep(step: QuranRecitationStepId): boolean {
  return step.startsWith("duration-");
}

export function getRecitationCountForSteps(
  targetQuantity: number,
  selectedCount: number,
): number {
  if (targetQuantity <= 1) return 1;
  return Math.min(Math.max(1, selectedCount), targetQuantity);
}

export function buildRecitationSteps(
  targetQuantity: number,
  selectedRecitationCount: number,
): QuranRecitationStepId[] {
  const steps: QuranRecitationStepId[] = ["date", "startTime"];
  if (targetQuantity > 1) {
    steps.push("recitationCount");
  }

  const count = getRecitationCountForSteps(
    targetQuantity,
    selectedRecitationCount,
  );
  for (let i = 1; i <= count; i++) {
    steps.push(`duration-${i}`);
  }

  return steps;
}

export function createDefaultDurations(
  count: number,
): RecitationDurationValue[] {
  return Array.from({ length: count }, () => ({
    hours: "0",
    minutes: "10",
  }));
}

export function resolveLoggedRecitationCount(
  targetQuantity: number,
  selectedCount: number | null,
): number {
  if (targetQuantity <= 1) return 1;
  const count = selectedCount ?? 0;
  return Math.min(Math.max(1, count), targetQuantity);
}

export function isValidStartTime(
  hour: string,
  minute: string,
  period: "am" | "pm",
): boolean {
  if (!hour.trim() || !minute.trim()) return false;
  const h = Number.parseInt(hour, 10);
  const m = Number.parseInt(minute, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  return h >= 1 && h <= 12 && m >= 0 && m <= 59;
}

export function isValidTimeSpent(hours: string, minutes: string): boolean {
  const h = Number.parseInt(hours || "0", 10) || 0;
  const m = Number.parseInt(minutes || "0", 10) || 0;
  return h > 0 || m > 0;
}

export function isValidRecitationCount(
  count: number | null,
  maxQuantity: number,
): boolean {
  if (maxQuantity <= 1) return true;
  if (count === null) return false;
  return count >= 1 && count <= maxQuantity;
}

/** Placeholder until surah planner selections are persisted for the active goal. */
export function getQuranRecitationTargetConfig(
  _goalId: SurahRecitationGoalId,
): QuranRecitationTargetConfig {
  return {
    ...DEFAULT_TARGET,
    quantity: clampRecitationQuantity(DEFAULT_TARGET.quantity),
  };
}
