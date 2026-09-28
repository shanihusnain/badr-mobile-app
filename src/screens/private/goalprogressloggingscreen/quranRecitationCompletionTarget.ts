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
  return { hours: "0", minutes: "0" };
}

export function isValidJuzRange(startJuz: number, endJuz: number): boolean {
  const start = clampJuz(startJuz);
  const end = clampJuz(endJuz);
  return start >= MIN_JUZ && end >= start && end <= MAX_JUZ;
}

/**
 * Resume cursor inside the open Khatm (C1/C2/…).
 * `completedJuzTotal` is frame `goal.completed` (juz units across the goal).
 */
export type CompletionResumeCursor = {
  /** First juz allowed as Full-range start (already-logged full juz are locked out). */
  minFullStartJuz: number;
  /** Lowest juz on the Partial stepper. */
  minPartialJuz: number;
  /** Locked start ayah on `minPartialJuz` (1 = start of juz). */
  minStartAyat: number;
};

const RESUME_EPS = 1e-6;

export function getCompletionResumeCursor(
  completedJuzTotal: number,
): CompletionResumeCursor {
  const raw = Math.max(0, Number(completedJuzTotal) || 0);
  // Progress within the open completion (0 → just finished prior C / fresh C).
  let within = raw % 30;
  if (within > 30 - RESUME_EPS) within = 0;

  if (within < RESUME_EPS) {
    return { minFullStartJuz: 1, minPartialJuz: 1, minStartAyat: 1 };
  }

  const fullDone = Math.floor(within + RESUME_EPS / 10);
  const fraction = within - fullDone;

  // Exactly N full juz logged → continue from N+1 ayah 1.
  if (fraction < RESUME_EPS) {
    const next = Math.min(MAX_JUZ, fullDone + 1);
    return {
      minFullStartJuz: next,
      minPartialJuz: next,
      minStartAyat: 1,
    };
  }

  // Partial progress on juz (fullDone + 1).
  const currentJuz = Math.min(MAX_JUZ, fullDone + 1);
  const verseCount = Math.max(1, getJuzVerseCountFromMap(currentJuz));
  const ayahsDone = Math.min(
    verseCount,
    Math.max(0, Math.floor(fraction * verseCount + RESUME_EPS)),
  );

  if (ayahsDone >= verseCount) {
    const next = Math.min(MAX_JUZ, currentJuz + 1);
    return {
      minFullStartJuz: next,
      minPartialJuz: next,
      minStartAyat: 1,
    };
  }

  const minStartAyat = ayahsDone + 1;
  return {
    // Full = whole juz only — skip the open partial juz (31 = none left).
    minFullStartJuz: Math.min(MAX_JUZ + 1, currentJuz + 1),
    minPartialJuz: currentJuz,
    minStartAyat,
  };
}

/** Partial juz min when logging Both — after the Full range and after resume. */
export function getCompletionMinPartialJuz(
  completionType: CompletionType,
  fullEndJuz: number,
  resume: CompletionResumeCursor,
): number {
  if (completionType !== "both") return resume.minPartialJuz;
  return Math.min(
    MAX_JUZ,
    Math.max(resume.minPartialJuz, clampJuz(fullEndJuz) + 1),
  );
}

export function isValidAyatRange(
  juz: number,
  startAyat: number,
  endAyat: number,
  minStartAyat = 1,
): boolean {
  const maxAyat = getJuzVerseCountFromMap(juz);
  const minStart = Math.min(Math.max(1, Math.round(minStartAyat)), maxAyat);
  const start = Math.round(startAyat);
  const end = Math.round(endAyat);
  return start >= minStart && end >= start && end <= maxAyat;
}

export function isValidCompletionFullJuzRange(
  startJuz: number,
  endJuz: number,
  minFullStartJuz: number,
): boolean {
  if (minFullStartJuz > MAX_JUZ) return false;
  if (!isValidJuzRange(startJuz, endJuz)) return false;
  return clampJuz(startJuz) >= clampJuz(minFullStartJuz);
}

export function isValidCompletionType(
  value: CompletionType | null,
): value is CompletionType {
  return value === "full" || value === "partial" || value === "both";
}

export { isValidStartTime, isValidTimeSpent };
