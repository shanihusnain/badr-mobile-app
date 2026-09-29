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
 * Prefers an explicit set of already-logged juz (non-sequential logs like
 * j1-4 + j6 + j8). Falls back to sequential math from `completedJuzTotal`.
 */
export type CompletionResumeCursor = {
  /** First juz allowed as Full-range start when using sequential fallback. */
  minFullStartJuz: number;
  /** Lowest selectable Partial juz (first not-yet-fully-logged). */
  minPartialJuz: number;
  /** Locked start ayah on the open partial juz (1 = start of juz). */
  minStartAyat: number;
  /** Fully logged juz numbers that must not be selectable again. */
  excludedJuz: number[];
  /** Juz with an open partial (verses left) — Partial only, not Full. */
  openPartialJuz: number | null;
};

const RESUME_EPS = 1e-6;

export function parseJuzNumbersFromCompletionLabel(
  juzLabel: string | null | undefined,
): { full: number[]; partialJuz: number | null } {
  const raw = (juzLabel ?? "").trim();
  if (!raw) return { full: [], partialJuz: null };

  const full = new Set<number>();
  let partialJuz: number | null = null;

  const tokens = raw
    .split(/[,|\n]+/)
    .map((part) =>
      part
        .trim()
        .replace(/^BEST\s*DAY!?\s*/i, "")
        .replace(/J(\d)/g, "j$1")
        .replace(/j(\d+)\s*[-–]\s*j(\d+)/i, "j$1-$2"),
    )
    .filter(Boolean);

  for (const token of tokens) {
    const rangeMatch = token.match(/^j?(\d+)\s*[-–]\s*(\d+)$/i);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
        for (let j = start; j <= end; j += 1) {
          if (j >= MIN_JUZ && j <= MAX_JUZ) full.add(j);
        }
      }
      continue;
    }

    const partialMatch = token.match(/^j?(\d+)\*$/i);
    if (partialMatch) {
      const juz = Number(partialMatch[1]);
      if (Number.isFinite(juz) && juz >= MIN_JUZ && juz <= MAX_JUZ) {
        partialJuz = juz;
      }
      continue;
    }

    const singleMatch = token.match(/^j?(\d+)$/i);
    if (singleMatch) {
      const juz = Number(singleMatch[1]);
      if (Number.isFinite(juz) && juz >= MIN_JUZ && juz <= MAX_JUZ) {
        full.add(juz);
      }
    }
  }

  return { full: [...full], partialJuz };
}

function firstAvailableJuz(
  excluded: ReadonlySet<number>,
  from = MIN_JUZ,
): number {
  for (let j = Math.max(MIN_JUZ, from); j <= MAX_JUZ; j += 1) {
    if (!excluded.has(j)) return j;
  }
  return MAX_JUZ + 1;
}

export function getCompletionResumeCursor(
  completedJuzTotal: number,
  options?: {
    fullyLoggedJuz?: number[];
    openPartialJuz?: number | null;
    openPartialMinAyat?: number;
  },
): CompletionResumeCursor {
  const fullyLogged = [
    ...new Set(
      (options?.fullyLoggedJuz ?? [])
        .map((n) => Math.round(n))
        .filter((n) => n >= MIN_JUZ && n <= MAX_JUZ),
    ),
  ].sort((a, b) => a - b);
  const excludedSet = new Set(fullyLogged);
  const openPartialJuz =
    options?.openPartialJuz != null &&
    options.openPartialJuz >= MIN_JUZ &&
    options.openPartialJuz <= MAX_JUZ &&
    !excludedSet.has(options.openPartialJuz)
      ? options.openPartialJuz
      : null;
  const openPartialMinAyat = Math.max(
    1,
    Math.round(options?.openPartialMinAyat ?? 1),
  );

  // Prefer explicit logged-juz set from the frame (supports non-sequential logs).
  if (fullyLogged.length > 0 || openPartialJuz != null) {
    if (openPartialJuz != null) {
      const nextFull = firstAvailableJuz(excludedSet, openPartialJuz + 1);
      return {
        minFullStartJuz: nextFull,
        minPartialJuz: openPartialJuz,
        minStartAyat: openPartialMinAyat,
        excludedJuz: fullyLogged,
        openPartialJuz,
      };
    }

    const next = firstAvailableJuz(excludedSet);
    return {
      minFullStartJuz: next,
      minPartialJuz: next,
      minStartAyat: 1,
      excludedJuz: fullyLogged,
      openPartialJuz: null,
    };
  }

  // Sequential fallback from aggregate completed juz count.
  const raw = Math.max(0, Number(completedJuzTotal) || 0);
  let within = raw % 30;
  if (within > 30 - RESUME_EPS) within = 0;

  if (within < RESUME_EPS) {
    return {
      minFullStartJuz: 1,
      minPartialJuz: 1,
      minStartAyat: 1,
      excludedJuz: [],
      openPartialJuz: null,
    };
  }

  const fullDone = Math.floor(within + RESUME_EPS / 10);
  const fraction = within - fullDone;
  const sequentialExcluded = Array.from({ length: fullDone }, (_, i) => i + 1);

  if (fraction < RESUME_EPS) {
    const next = Math.min(MAX_JUZ, fullDone + 1);
    return {
      minFullStartJuz: next,
      minPartialJuz: next,
      minStartAyat: 1,
      excludedJuz: sequentialExcluded,
      openPartialJuz: null,
    };
  }

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
      excludedJuz: [...sequentialExcluded, currentJuz],
      openPartialJuz: null,
    };
  }

  return {
    minFullStartJuz: Math.min(MAX_JUZ + 1, currentJuz + 1),
    minPartialJuz: currentJuz,
    minStartAyat: ayahsDone + 1,
    excludedJuz: sequentialExcluded,
    openPartialJuz: currentJuz,
  };
}

/** Next selectable juz above/below `from`, skipping excluded. */
export function stepJuzSkippingExcluded(
  from: number,
  direction: 1 | -1,
  min: number,
  max: number,
  excluded: ReadonlyArray<number> = [],
): number | null {
  const blocked = new Set(excluded);
  let next = from + direction;
  while (next >= min && next <= max) {
    if (!blocked.has(next)) return next;
    next += direction;
  }
  return null;
}

export function snapJuzOffExcluded(
  value: number,
  min: number,
  max: number,
  excluded: ReadonlyArray<number> = [],
): number {
  const blocked = new Set(excluded);
  const clamped = Math.min(max, Math.max(min, Math.round(value)));
  if (!blocked.has(clamped)) return clamped;
  const up = stepJuzSkippingExcluded(clamped, 1, min, max, excluded);
  if (up != null) return up;
  const down = stepJuzSkippingExcluded(clamped, -1, min, max, excluded);
  if (down != null) return down;
  return clamped;
}

/** True when [start, end] intersects any excluded juz. */
export function juzRangeIncludesExcluded(
  startJuz: number,
  endJuz: number,
  excluded: ReadonlyArray<number>,
): boolean {
  if (excluded.length === 0) return false;
  const start = clampJuz(startJuz);
  const end = clampJuz(endJuz);
  const blocked = new Set(excluded);
  for (let j = start; j <= end; j += 1) {
    if (blocked.has(j)) return true;
  }
  return false;
}

/** Partial juz min when logging Both — after the Full range and after resume. */
export function getCompletionMinPartialJuz(
  completionType: CompletionType,
  fullEndJuz: number,
  resume: CompletionResumeCursor,
): number {
  if (completionType !== "both") return resume.minPartialJuz;
  return snapJuzOffExcluded(
    Math.max(resume.minPartialJuz, clampJuz(fullEndJuz) + 1),
    MIN_JUZ,
    MAX_JUZ,
    resume.excludedJuz,
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
  excludedJuz: ReadonlyArray<number> = [],
): boolean {
  if (minFullStartJuz > MAX_JUZ) return false;
  if (!isValidJuzRange(startJuz, endJuz)) return false;
  if (clampJuz(startJuz) < clampJuz(Math.min(MAX_JUZ, minFullStartJuz))) {
    return false;
  }
  return !juzRangeIncludesExcluded(startJuz, endJuz, excludedJuz);
}

export function isValidCompletionType(
  value: CompletionType | null,
): value is CompletionType {
  return value === "full" || value === "partial" || value === "both";
}

export { isValidStartTime, isValidTimeSpent };
