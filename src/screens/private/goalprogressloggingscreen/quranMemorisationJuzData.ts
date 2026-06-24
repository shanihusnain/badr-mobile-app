import { getSelectedMemorisationJuzIds } from "./quranMemorisationJuzGoals";
import { getJuzVerseCount } from "./quranMemorisationJuzVerse";

export type JuzMemorisationLogRecord = {
  juzId: string;
  date: string;
  startAyah: number;
  endAyah: number;
  ayahsMemorizedToday: number;
  startTime: string;
  timeSpentMinutes: number;
  hours?: number;
  minutes?: number;
};

type JuzMemorisationProgressState = {
  logs: JuzMemorisationLogRecord[];
};

const progressByJuz: Record<string, JuzMemorisationProgressState> = {
  "juz-1": {
    logs: [
      { juzId: "juz-1", date: "2025-10-28", startAyah: 1, endAyah: 8, ayahsMemorizedToday: 8, startTime: "6:15 am", timeSpentMinutes: 25, hours: 0, minutes: 25 },
      { juzId: "juz-1", date: "2025-10-30", startAyah: 9, endAyah: 15, ayahsMemorizedToday: 7, startTime: "7:30 am", timeSpentMinutes: 20, hours: 0, minutes: 20 },
      { juzId: "juz-1", date: "2025-11-02", startAyah: 16, endAyah: 20, ayahsMemorizedToday: 5, startTime: "6:45 am", timeSpentMinutes: 15, hours: 0, minutes: 15 },
      { juzId: "juz-1", date: "2025-11-05", startAyah: 21, endAyah: 25, ayahsMemorizedToday: 5, startTime: "8:00 am", timeSpentMinutes: 18, hours: 0, minutes: 18 },
    ],
  },
  "juz-2": {
    logs: [
      { juzId: "juz-2", date: "2025-11-01", startAyah: 1, endAyah: 15, ayahsMemorizedToday: 15, startTime: "6:00 am", timeSpentMinutes: 40, hours: 0, minutes: 40 },
      { juzId: "juz-2", date: "2025-11-03", startAyah: 16, endAyah: 27, ayahsMemorizedToday: 12, startTime: "7:15 am", timeSpentMinutes: 35, hours: 0, minutes: 35 },
      { juzId: "juz-2", date: "2025-11-04", startAyah: 28, endAyah: 40, ayahsMemorizedToday: 13, startTime: "6:30 am", timeSpentMinutes: 38, hours: 0, minutes: 38 },
    ],
  },
  "juz-3": {
    logs: [
      { juzId: "juz-3", date: "2025-11-02", startAyah: 1, endAyah: 6, ayahsMemorizedToday: 6, startTime: "5:45 am", timeSpentMinutes: 22, hours: 0, minutes: 22 },
      { juzId: "juz-3", date: "2025-11-05", startAyah: 7, endAyah: 10, ayahsMemorizedToday: 4, startTime: "6:20 am", timeSpentMinutes: 15, hours: 0, minutes: 15 },
    ],
  },
  "juz-4": {
    logs: [{ juzId: "juz-4", date: "2025-11-05", startAyah: 1, endAyah: 2, ayahsMemorizedToday: 2, startTime: "7:00 am", timeSpentMinutes: 10, hours: 0, minutes: 10 }],
  },
};

function getJuzState(juzId: string): JuzMemorisationProgressState {
  if (!progressByJuz[juzId]) {
    progressByJuz[juzId] = { logs: [] };
  }
  return progressByJuz[juzId];
}

export function getRawMemorizedJuzAyahCount(juzId: string): number {
  const state = getJuzState(juzId);
  return (state.logs ?? []).reduce(
    (sum, log) => sum + log.ayahsMemorizedToday,
    0,
  );
}

export function getMemorizedJuzAyahCount(juzId: string): number {
  const total = getJuzVerseCount(juzId);
  return Math.min(getRawMemorizedJuzAyahCount(juzId), total);
}

export function getRemainingJuzAyahCount(juzId: string): number {
  const total = getJuzVerseCount(juzId);
  return Math.max(0, total - getMemorizedJuzAyahCount(juzId));
}

export function isJuzFullyMemorized(juzId: string): boolean {
  const total = getJuzVerseCount(juzId);
  return getMemorizedJuzAyahCount(juzId) >= total;
}

export function getJuzMemorisationProgressPercent(juzId: string): number {
  const total = getJuzVerseCount(juzId);
  if (total <= 0) return 0;
  const memorized = getMemorizedJuzAyahCount(juzId);
  return Math.min(100, Math.round((memorized / total) * 1000) / 10);
}

export function getJuzMemorisationLogs(
  juzId: string,
): JuzMemorisationLogRecord[] {
  const state = getJuzState(juzId);
  return [...(state.logs ?? [])];
}

export function getAllJuzMemorisationLogs(): JuzMemorisationLogRecord[] {
  return getSelectedMemorisationJuzIds().flatMap((juzId) =>
    getJuzMemorisationLogs(juzId),
  );
}

export function getJuzMemorisationLogsForFilter(
  juzFilter: "all" | string,
): JuzMemorisationLogRecord[] {
  if (juzFilter === "all") {
    return getAllJuzMemorisationLogs();
  }
  return getJuzMemorisationLogs(juzFilter);
}

export function appendJuzMemorisationLog(log: JuzMemorisationLogRecord): void {
  const state = getJuzState(log.juzId);
  const existingLogs = state.logs ?? [];
  progressByJuz[log.juzId] = {
    logs: [...existingLogs, log],
  };
}

export function getJuzMemorisationTotalTimeSpentMinutes(
  juzId: string,
): number {
  return getJuzMemorisationLogs(juzId).reduce(
    (sum, log) => sum + log.timeSpentMinutes,
    0,
  );
}

export function getAllJuzMemorisationTotalTimeSpentMinutes(): number {
  return getAllJuzMemorisationLogs().reduce(
    (sum, log) => sum + log.timeSpentMinutes,
    0,
  );
}

export function buildJuzMemorisationLogFromEntry(entry: {
  juzId: string;
  date: string;
  startAyah: number;
  endAyah: number;
  ayahsMemorizedToday: number;
  startTime: string;
  timeSpentMinutes: number;
  hours?: number;
  minutes?: number;
}): JuzMemorisationLogRecord {
  return {
    juzId: entry.juzId,
    date: entry.date,
    startAyah: entry.startAyah,
    endAyah: entry.endAyah,
    ayahsMemorizedToday: entry.ayahsMemorizedToday,
    startTime: entry.startTime,
    timeSpentMinutes: entry.timeSpentMinutes,
    hours: entry.hours,
    minutes: entry.minutes,
  };
}
