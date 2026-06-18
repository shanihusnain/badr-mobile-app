import { isValidStartTime, isValidTimeSpent } from "./quranRecitationTarget";
import { getJuzVerseCountFromMap } from "./quranJuzVerseMap";

export type CompletionType = "full" | "partial" | "both";

export type QuranCompletionStepId =
  | "date"
  | "startTime"
  | "completionType"
  | "fullJuzRange"
  | "partialJuz"
  | "ayatRange"
  | "timeSpentFull"
  | "timeSpentPartial";

export type CompletionDurationValue = {
  hours: string;
  minutes: string;
};

export const MIN_JUZ = 1;
export const MAX_JUZ = 30;

/** Approximate ayah counts per juz in the standard 30-juz division. */
export const JUZ_AYAH_COUNTS: readonly number[] = [
  148, 111, 126, 131, 124, 110, 149, 142, 159, 127, 151, 170, 154, 227, 185,
  269, 190, 202, 339, 219, 173, 78, 118, 64, 77, 227, 93, 88, 69, 60,
];

export function getAyatCountForJuz(juz: number): number {
  const index = Math.min(Math.max(MIN_JUZ, Math.round(juz)), MAX_JUZ) - 1;
  return JUZ_AYAH_COUNTS[index] ?? 1;
}

export function clampJuz(juz: number): number {
  return Math.min(Math.max(MIN_JUZ, Math.round(juz)), MAX_JUZ);
}

export function buildCompletionSteps(
  completionType: CompletionType,
): QuranCompletionStepId[] {
  const base: QuranCompletionStepId[] = ["date", "startTime", "completionType"];

  switch (completionType) {
    case "full":
      return [...base, "fullJuzRange", "timeSpentFull"];
    case "partial":
      return [...base, "partialJuz", "ayatRange", "timeSpentPartial"];
    case "both":
      return [
        ...base,
        "fullJuzRange",
        "partialJuz",
        "ayatRange",
        "timeSpentFull",
        "timeSpentPartial",
      ];
  }
}

export function createDefaultDuration(): CompletionDurationValue {
  return { hours: "0", minutes: "10" };
}

export function isValidJuzRange(startJuz: number, endJuz: number): boolean {
  const start = clampJuz(startJuz);
  const end = clampJuz(endJuz);
  return start >= MIN_JUZ && end >= start && end <= MAX_JUZ;
}

export function isValidAyatRange(
  juz: number,
  startAyat: number,
  endAyat: number,
): boolean {
  const maxAyat = getJuzVerseCountFromMap(juz);
  const start = Math.round(startAyat);
  const end = Math.round(endAyat);
  return start >= 1 && end >= start && end <= maxAyat;
}

export function isValidCompletionType(
  value: CompletionType | null,
): value is CompletionType {
  return value === "full" || value === "partial" || value === "both";
}

export { isValidStartTime, isValidTimeSpent };
