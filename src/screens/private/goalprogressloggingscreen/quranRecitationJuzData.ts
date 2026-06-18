import { getJuzVerseCountFromMap } from "./quranJuzVerseMap";

export type JuzCompletionType = "full" | "partial" | "both";

export type JuzLogRecord = {
  juzNumber: number;
  completionType: JuzCompletionType;
  fullRange: { start: number; end: number } | null;
  partialJuz: number | null;
  ayatRange: { start: number; end: number } | null;
  timeSpentFull: number | null;
  timeSpentPartial: number | null;
  lastCompletedAyat: number | null;
};

export type JuzRecitationProgress = {
  targetJuzCount: number;
  completedJuzCount: number;
  targetJuzRange: { startJuz: number; endJuz: number };
  logs: JuzLogRecord[];
};

const INITIAL_PROGRESS: JuzRecitationProgress = {
  targetJuzCount: 10,
  completedJuzCount: 3,
  targetJuzRange: { startJuz: 1, endJuz: 10 },
  logs: [
    {
      juzNumber: 5,
      completionType: "partial",
      fullRange: null,
      partialJuz: 5,
      ayatRange: { start: 1, end: 40 },
      timeSpentFull: null,
      timeSpentPartial: 15,
      lastCompletedAyat: 40,
    },
  ],
};

let progressState: JuzRecitationProgress = {
  ...INITIAL_PROGRESS,
  logs: INITIAL_PROGRESS.logs.map((log) => ({ ...log })),
};

export function getJuzRecitationProgress(): JuzRecitationProgress {
  return progressState;
}

export function isJuzGoalComplete(progress = getJuzRecitationProgress()): boolean {
  return progress.completedJuzCount >= progress.targetJuzCount;
}

export function getLastCompletedAyatForJuz(
  juz: number,
  progress = getJuzRecitationProgress(),
): number {
  const matchingLogs = progress.logs.filter(
    (log) => log.partialJuz === juz && log.ayatRange,
  );
  if (matchingLogs.length === 0) return 0;

  return Math.max(
    ...matchingLogs.map(
      (log) => log.lastCompletedAyat ?? log.ayatRange?.end ?? 0,
    ),
  );
}

export function getMinAyatStartForJuz(
  juz: number,
  progress = getJuzRecitationProgress(),
): number {
  const lastCompleted = getLastCompletedAyatForJuz(juz, progress);
  if (lastCompleted <= 0) return 1;
  return lastCompleted + 1;
}

export function isJuzFullyCompletedInLogs(
  juz: number,
  progress = getJuzRecitationProgress(),
): boolean {
  return progress.logs.some((log) => {
    if (log.fullRange && juz >= log.fullRange.start && juz <= log.fullRange.end) {
      return log.completionType === "full" || log.completionType === "both";
    }

    if (log.partialJuz === juz && log.ayatRange) {
      const maxAyat = getJuzVerseCountFromMap(juz);
      return log.ayatRange.end >= maxAyat;
    }

    return false;
  });
}

function countNewlyCompletedJuz(log: JuzLogRecord): number {
  let count = 0;

  if (log.fullRange) {
    for (let juz = log.fullRange.start; juz <= log.fullRange.end; juz += 1) {
      if (!isJuzFullyCompletedInLogs(juz)) {
        count += 1;
      }
    }
  }

  if (
    log.partialJuz &&
    log.ayatRange &&
    log.ayatRange.end >= getJuzVerseCountFromMap(log.partialJuz) &&
    !isJuzFullyCompletedInLogs(log.partialJuz)
  ) {
    count += 1;
  }

  return count;
}

export function appendJuzLog(log: JuzLogRecord): void {
  const newlyCompleted = countNewlyCompletedJuz(log);
  progressState = {
    ...progressState,
    completedJuzCount: progressState.completedJuzCount + newlyCompleted,
    logs: [...progressState.logs, log],
  };
}

export function buildJuzLogRecordFromEntry(entry: {
  completionType: JuzCompletionType;
  fullJuzRange: { startJuz: number; endJuz: number } | null;
  partialJuz: number | null;
  ayatRange: { startAyat: number; endAyat: number } | null;
  fullTimeSpentMinutes: number | null;
  partialTimeSpentMinutes: number | null;
}): JuzLogRecord {
  const partialJuz = entry.partialJuz;
  const juzNumber =
    entry.completionType === "full"
      ? (entry.fullJuzRange?.startJuz ?? 0)
      : (partialJuz ?? entry.fullJuzRange?.startJuz ?? 0);

  return {
    juzNumber,
    completionType: entry.completionType,
    fullRange: entry.fullJuzRange
      ? { start: entry.fullJuzRange.startJuz, end: entry.fullJuzRange.endJuz }
      : null,
    partialJuz,
    ayatRange: entry.ayatRange
      ? { start: entry.ayatRange.startAyat, end: entry.ayatRange.endAyat }
      : null,
    timeSpentFull: entry.fullTimeSpentMinutes,
    timeSpentPartial: entry.partialTimeSpentMinutes,
    lastCompletedAyat: entry.ayatRange?.endAyat ?? null,
  };
}
