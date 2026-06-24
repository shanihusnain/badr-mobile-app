import { getSelectedMemorisationHizbIds } from "./quranMemorisationHizbGoals";
import { getHizbVerseCount } from "./quranHizbVerseMap";

export type HizbMemorisationLogRecord = {
  hizbId: string;
  date: string;
  ayahsMemorizedToday: number;
  startTime?: string;
  hours?: number;
  minutes?: number;
  startAyah?: number;
  endAyah?: number;
};

type HizbMemorisationProgressState = {
  logs: HizbMemorisationLogRecord[];
};

const progressByHizb: Record<string, HizbMemorisationProgressState> = {
  "hizb-1": {
    logs: [
      { hizbId: "hizb-1", date: "2025-10-28", ayahsMemorizedToday: 15 },
      { hizbId: "hizb-1", date: "2025-10-30", ayahsMemorizedToday: 12 },
      { hizbId: "hizb-1", date: "2025-11-02", ayahsMemorizedToday: 8 },
      { hizbId: "hizb-1", date: "2025-11-05", ayahsMemorizedToday: 5 },
    ],
  },
  "hizb-2": {
    logs: [
      { hizbId: "hizb-2", date: "2025-11-01", ayahsMemorizedToday: 12 },
      { hizbId: "hizb-2", date: "2025-11-04", ayahsMemorizedToday: 8 },
    ],
  },
  "hizb-3": {
    logs: [
      { hizbId: "hizb-3", date: "2025-11-02", ayahsMemorizedToday: 7 },
      { hizbId: "hizb-3", date: "2025-11-03", ayahsMemorizedToday: 5 },
    ],
  },
  "hizb-4": {
    logs: [{ hizbId: "hizb-4", date: "2025-11-05", ayahsMemorizedToday: 5 }],
  },
};

function getHizbState(hizbId: string): HizbMemorisationProgressState {
  if (!progressByHizb[hizbId]) {
    progressByHizb[hizbId] = { logs: [] };
  }
  return progressByHizb[hizbId];
}

export function getRawMemorizedHizbAyahCount(hizbId: string): number {
  const state = getHizbState(hizbId);
  return state.logs.reduce((sum, log) => sum + log.ayahsMemorizedToday, 0);
}

export function getMemorizedHizbAyahCount(hizbId: string): number {
  const total = getHizbVerseCount(hizbId);
  return Math.min(getRawMemorizedHizbAyahCount(hizbId), total);
}

export function getRemainingHizbAyahCount(hizbId: string): number {
  const total = getHizbVerseCount(hizbId);
  return Math.max(0, total - getMemorizedHizbAyahCount(hizbId));
}

export function isHizbFullyMemorized(hizbId: string): boolean {
  const total = getHizbVerseCount(hizbId);
  return getMemorizedHizbAyahCount(hizbId) >= total;
}

export function getHizbMemorisationProgressPercent(hizbId: string): number {
  const total = getHizbVerseCount(hizbId);
  if (total <= 0) return 0;
  const memorized = getMemorizedHizbAyahCount(hizbId);
  return Math.min(100, Math.round((memorized / total) * 1000) / 10);
}

export function getHizbMemorisationLogs(
  hizbId: string,
): HizbMemorisationLogRecord[] {
  return [...getHizbState(hizbId).logs];
}

export function getAllHizbMemorisationLogs(): HizbMemorisationLogRecord[] {
  return getSelectedMemorisationHizbIds().flatMap((hizbId) =>
    getHizbMemorisationLogs(hizbId),
  );
}

export function getHizbMemorisationLogsForFilter(
  hizbFilter: "all" | string,
): HizbMemorisationLogRecord[] {
  if (hizbFilter === "all") {
    return getAllHizbMemorisationLogs();
  }
  return getHizbMemorisationLogs(hizbFilter);
}

export function appendHizbMemorisationLog(
  log: HizbMemorisationLogRecord,
): void {
  const state = getHizbState(log.hizbId);
  progressByHizb[log.hizbId] = {
    logs: [...state.logs, log],
  };
}

export function buildHizbMemorisationLogFromEntry(entry: {
  hizbId: string;
  date: string;
  ayahsMemorizedToday: number;
  startTime?: string;
  hours?: number;
  minutes?: number;
  startAyah?: number;
  endAyah?: number;
}): HizbMemorisationLogRecord {
  return {
    hizbId: entry.hizbId,
    date: entry.date,
    ayahsMemorizedToday: entry.ayahsMemorizedToday,
    startTime: entry.startTime,
    hours: entry.hours,
    minutes: entry.minutes,
    startAyah: entry.startAyah,
    endAyah: entry.endAyah,
  };
}
