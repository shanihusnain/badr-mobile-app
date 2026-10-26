import { getJuzVerseCountFromMap } from "./quranJuzVerseMap";
import {
  clampJuz,
  MAX_JUZ,
  MIN_JUZ,
  type CompletionType,
} from "./quranRecitationCompletionTarget";

export type CompletionRecitationProgress = {
  targetCompletions: number;
  completedCompletions: number;
};

const MOCK_COMPLETION_PROGRESS: CompletionRecitationProgress = {
  targetCompletions: 3,
  completedCompletions: 0,
};

export function getCompletionRecitationProgress(): CompletionRecitationProgress {
  return MOCK_COMPLETION_PROGRESS;
}

export function isCompletionGoalComplete(
  progress: CompletionRecitationProgress,
): boolean {
  return progress.completedCompletions >= progress.targetCompletions;
}

/** Returns 1-based current completion number, or null when the goal is complete. */
export function getCurrentCompletionNumber(
  progress: CompletionRecitationProgress,
): number | null {
  if (isCompletionGoalComplete(progress)) return null;
  return progress.completedCompletions + 1;
}
/**
 * Session-local completion logs — same role as `appendJuzLog` for Recitation by Juz.
 * Merged into Full/Partial exclusions so already-logged juz disappear immediately
 * (and stay hidden if the frame refetch omits juz captions).
 */
export type CompletionLogRecord = {
  completionType: CompletionType;
  fullRange: { start: number; end: number } | null;
  partialJuz: number | null;
  ayatRange: { start: number; end: number } | null;
};

let completionLogs: CompletionLogRecord[] = [];

export function getCompletionLogs(): CompletionLogRecord[] {
  return completionLogs;
}

export function appendCompletionLog(log: CompletionLogRecord): void {
  completionLogs = [...completionLogs, log];
}

/** Drop session logs after frame refetch (post-log / dashboard delete). */
export function clearCompletionLogs(): void {
  completionLogs = [];
}

export function buildCompletionLogRecordFromEntry(entry: {
  completionType: CompletionType;
  fullJuzRange: { startJuz: number; endJuz: number } | null;
  partialJuz: number | null;
  ayatRange: { startAyat: number; endAyat: number } | null;
}): CompletionLogRecord {
  return {
    completionType: entry.completionType,
    fullRange: entry.fullJuzRange
      ? {
          start: clampJuz(entry.fullJuzRange.startJuz),
          end: clampJuz(entry.fullJuzRange.endJuz),
        }
      : null,
    partialJuz:
      entry.partialJuz != null ? clampJuz(entry.partialJuz) : null,
    ayatRange: entry.ayatRange
      ? {
          start: Math.round(entry.ayatRange.startAyat),
          end: Math.round(entry.ayatRange.endAyat),
        }
      : null,
  };
}

/** Juz already fully / partially logged in this session (Juz dual-exclusion model). */
export function getLocalCompletionLoggedJuz(): {
  fullyLogged: number[];
  openPartialJuz: number[];
  /** Fully logged + open partals — blocked on Full. */
  fullExcludedJuz: number[];
  openPartialMinAyatByJuz: Record<number, number>;
} {
  const fullyLogged = new Set<number>();
  const openPartial = new Set<number>();
  const openPartialMinAyatByJuz: Record<number, number> = {};

  for (const log of completionLogs) {
    if (
      log.fullRange &&
      (log.completionType === "full" || log.completionType === "both")
    ) {
      for (let j = log.fullRange.start; j <= log.fullRange.end; j += 1) {
        if (j >= MIN_JUZ && j <= MAX_JUZ) {
          fullyLogged.add(j);
          openPartial.delete(j);
          delete openPartialMinAyatByJuz[j];
        }
      }
    }

    if (
      log.partialJuz != null &&
      log.ayatRange &&
      (log.completionType === "partial" || log.completionType === "both")
    ) {
      const juz = log.partialJuz;
      if (juz < MIN_JUZ || juz > MAX_JUZ) continue;
      const verseCount = Math.max(1, getJuzVerseCountFromMap(juz));
      if (log.ayatRange.end >= verseCount) {
        fullyLogged.add(juz);
        openPartial.delete(juz);
        delete openPartialMinAyatByJuz[juz];
      } else if (!fullyLogged.has(juz)) {
        openPartial.add(juz);
        openPartialMinAyatByJuz[juz] = Math.max(
          openPartialMinAyatByJuz[juz] ?? 1,
          log.ayatRange.end + 1,
        );
      }
    }
  }

  const fullyLoggedList = [...fullyLogged].sort((a, b) => a - b);
  const openPartialList = [...openPartial].sort((a, b) => a - b);

  return {
    fullyLogged: fullyLoggedList,
    openPartialJuz: openPartialList,
    fullExcludedJuz: [
      ...new Set([...fullyLoggedList, ...openPartialList]),
    ].sort((a, b) => a - b),
    openPartialMinAyatByJuz,
  };
}

