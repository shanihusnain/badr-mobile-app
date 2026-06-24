import { getSelectedMemorisationSurahIds } from "./quranMemorisationSurahGoals";
import { getSurahVerseCount } from "./quranSurahVerseMap";

export type SurahMemorisationLogRecord = {
  surahId: string;
  date: string;
  ayahsMemorizedToday: number;
  startTime?: string;
  hours?: number;
  minutes?: number;
  startAyah?: number;
  endAyah?: number;
};

type SurahMemorisationProgressState = {
  logs: SurahMemorisationLogRecord[];
};

const progressBySurah: Record<string, SurahMemorisationProgressState> = {
  "surah-al-baqarah": {
    logs: [
      { surahId: "surah-al-baqarah", date: "2025-10-28", ayahsMemorizedToday: 10 },
      { surahId: "surah-al-baqarah", date: "2025-10-30", ayahsMemorizedToday: 11 },
      { surahId: "surah-al-baqarah", date: "2025-11-01", ayahsMemorizedToday: 5 },
      { surahId: "surah-al-baqarah", date: "2025-11-02", ayahsMemorizedToday: 8 },
      { surahId: "surah-al-baqarah", date: "2025-11-03", ayahsMemorizedToday: 6 },
    ],
  },
  "surah-aal-imran": {
    logs: [
      { surahId: "surah-aal-imran", date: "2025-11-01", ayahsMemorizedToday: 7 },
      { surahId: "surah-aal-imran", date: "2025-11-04", ayahsMemorizedToday: 8 },
    ],
  },
  "surah-an-nisa": {
    logs: [],
  },
  "surah-al-maidah": {
    logs: [
      { surahId: "surah-al-maidah", date: "2025-11-02", ayahsMemorizedToday: 10 },
      { surahId: "surah-al-maidah", date: "2025-11-05", ayahsMemorizedToday: 12 },
    ],
  },
};

function getSurahState(surahId: string): SurahMemorisationProgressState {
  if (!progressBySurah[surahId]) {
    progressBySurah[surahId] = { logs: [] };
  }
  return progressBySurah[surahId];
}

export function getRawMemorizedAyahCount(surahId: string): number {
  const state = getSurahState(surahId);
  return state.logs.reduce((sum, log) => sum + log.ayahsMemorizedToday, 0);
}

export function getMemorizedAyahCount(surahId: string): number {
  const total = getSurahVerseCount(surahId);
  return Math.min(getRawMemorizedAyahCount(surahId), total);
}

export function getRemainingAyahCount(surahId: string): number {
  const total = getSurahVerseCount(surahId);
  return Math.max(0, total - getMemorizedAyahCount(surahId));
}

export function isSurahFullyMemorized(surahId: string): boolean {
  const total = getSurahVerseCount(surahId);
  return getMemorizedAyahCount(surahId) >= total;
}

export function getSurahMemorisationProgressPercent(surahId: string): number {
  const total = getSurahVerseCount(surahId);
  if (total <= 0) return 0;
  const memorized = getMemorizedAyahCount(surahId);
  return Math.min(100, Math.round((memorized / total) * 1000) / 10);
}

export function getSurahMemorisationLogs(
  surahId: string,
): SurahMemorisationLogRecord[] {
  return [...getSurahState(surahId).logs];
}

export function getAllSurahMemorisationLogs(): SurahMemorisationLogRecord[] {
  return getSelectedMemorisationSurahIds().flatMap((surahId) =>
    getSurahMemorisationLogs(surahId),
  );
}

export function getMemorisationLogsForFilter(
  surahFilter: "all" | string,
): SurahMemorisationLogRecord[] {
  if (surahFilter === "all") {
    return getAllSurahMemorisationLogs();
  }
  return getSurahMemorisationLogs(surahFilter);
}

export function appendSurahMemorisationLog(log: SurahMemorisationLogRecord): void {
  const state = getSurahState(log.surahId);
  progressBySurah[log.surahId] = {
    logs: [...state.logs, log],
  };
}

export function buildSurahMemorisationLogFromEntry(entry: {
  surahId: string;
  date: string;
  ayahsMemorizedToday: number;
  startTime?: string;
  hours?: number;
  minutes?: number;
  startAyah?: number;
  endAyah?: number;
}): SurahMemorisationLogRecord {
  return {
    surahId: entry.surahId,
    date: entry.date,
    ayahsMemorizedToday: entry.ayahsMemorizedToday,
    startTime: entry.startTime,
    hours: entry.hours,
    minutes: entry.minutes,
    startAyah: entry.startAyah,
    endAyah: entry.endAyah,
  };
}
