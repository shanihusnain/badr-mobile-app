import { getMemorisationLogsForFilter } from "./quranMemorisationSurahData";
import {
  getMemorisationGoalsForFilter,
  type MemorisationSurahFilterId,
} from "./quranMemorisationSurahGoals";

export type MemorisationDayProgress = {
  day: string;
  date: string;
  ayahsLogged: number;
  isLogged: boolean;
  isBestDay?: boolean;
  isToday?: boolean;
};

export type MemorisationWeekSummary = {
  surahFilter: MemorisationSurahFilterId;
  surahName: string;
  weekDays: MemorisationDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  currentWeek: number;
  weekIndex: number;
  totalAyahsThisWeek: number;
  memorizedAyahs: number;
  totalAyahs: number;
  remainingAyahs: number;
  progressPercent: number;
  completed: boolean;
  streakDays: number;
  motivationalQuoteKey: string;
};

export type MemorisationCycleSummary = {
  surahFilter: MemorisationSurahFilterId;
  weeks: MemorisationWeekSummary[];
  activeWeekIndex: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MEMORISATION_CYCLE_WEEKS = 4;
/** Sunday start of the mock 4-week cycle (week 1). */
const CYCLE_START = "2025-10-26";
/** Pinned “today” for mock week navigation. */
const MOCK_TODAY = "2025-11-05";

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getDayLabel(dateStr: string): string {
  const dayIndex = new Date(`${dateStr}T12:00:00`).getDay();
  return DAY_LABELS[dayIndex];
}

function formatWeekRangeLabel(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${startLabel} — ${endLabel}`;
}

function aggregateAyahsByDate(
  logs: ReturnType<typeof getMemorisationLogsForFilter>,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const log of logs) {
    totals.set(
      log.date,
      (totals.get(log.date) ?? 0) + log.ayahsMemorizedToday,
    );
  }
  return totals;
}

function computeStreakDays(weekDays: MemorisationDayProgress[]): number {
  let streak = 0;
  for (let index = weekDays.length - 1; index >= 0; index -= 1) {
    if (!weekDays[index].isLogged) break;
    streak += 1;
  }
  return streak;
}

function applyBestDayFlags(
  weekDays: MemorisationDayProgress[],
): MemorisationDayProgress[] {
  const maxAyahs = Math.max(0, ...weekDays.map((day) => day.ayahsLogged));
  if (maxAyahs <= 0) return weekDays;

  return weekDays.map((day) => ({
    ...day,
    isBestDay: day.ayahsLogged === maxAyahs,
  }));
}

function buildWeekDays(
  weekStart: string,
  ayahsByDate: Map<string, number>,
): MemorisationDayProgress[] {
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const ayahsLogged = ayahsByDate.get(date) ?? 0;
    return {
      day: getDayLabel(date),
      date,
      ayahsLogged,
      isLogged: ayahsLogged > 0,
      isToday: date === MOCK_TODAY,
    };
  });

  return applyBestDayFlags(weekDays);
}

function getActiveWeekIndex(): number {
  for (let weekIndex = 0; weekIndex < MEMORISATION_CYCLE_WEEKS; weekIndex += 1) {
    const weekStart = addDays(CYCLE_START, weekIndex * 7);
    const weekEnd = addDays(weekStart, 6);
    if (MOCK_TODAY >= weekStart && MOCK_TODAY <= weekEnd) {
      return weekIndex;
    }
  }

  return MEMORISATION_CYCLE_WEEKS - 1;
}

function buildSurahProgress(surahFilter: MemorisationSurahFilterId) {
  const goals = getMemorisationGoalsForFilter(surahFilter);
  const memorizedAyahs = goals.reduce(
    (sum, goal) => sum + goal.memorizedAyahs,
    0,
  );
  const totalAyahs = goals.reduce((sum, goal) => sum + goal.totalAyahs, 0);
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const progressPercent =
    totalAyahs > 0
      ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 1000) / 10)
      : 0;
  const completed =
    surahFilter === "all"
      ? goals.length > 0 && goals.every((goal) => goal.completed)
      : (goals[0]?.completed ?? false);
  const surahName =
    surahFilter === "all"
      ? "All Surahs"
      : (goals[0]?.surahName ?? surahFilter);

  return {
    goals,
    memorizedAyahs,
    totalAyahs,
    remainingAyahs,
    progressPercent,
    completed,
    surahName,
  };
}

function buildWeekSummary(
  surahFilter: MemorisationSurahFilterId,
  weekIndex: number,
  ayahsByDate: Map<string, number>,
  progress: ReturnType<typeof buildSurahProgress>,
): MemorisationWeekSummary {
  const weekStart = addDays(CYCLE_START, weekIndex * 7);
  const weekEnd = addDays(weekStart, 6);
  const weekDays = buildWeekDays(weekStart, ayahsByDate);
  const currentWeek = weekIndex + 1;

  return {
    surahFilter,
    surahName: progress.surahName,
    weekDays,
    weekRangeLabel: formatWeekRangeLabel(weekStart, weekEnd),
    weekFraction: `${currentWeek}/${MEMORISATION_CYCLE_WEEKS}`,
    currentWeek,
    weekIndex,
    totalAyahsThisWeek: weekDays.reduce(
      (sum, day) => sum + day.ayahsLogged,
      0,
    ),
    memorizedAyahs: progress.memorizedAyahs,
    totalAyahs: progress.totalAyahs,
    remainingAyahs: progress.remainingAyahs,
    progressPercent: progress.progressPercent,
    completed: progress.completed,
    streakDays: computeStreakDays(weekDays),
    motivationalQuoteKey: "progressLogging.quranMemorisationSurahWeekQuote",
  };
}

export function getQuranMemorisationCycleSummary(
  surahFilter: MemorisationSurahFilterId = "all",
): MemorisationCycleSummary {
  const logs = getMemorisationLogsForFilter(surahFilter);
  const ayahsByDate = aggregateAyahsByDate(logs);
  const progress = buildSurahProgress(surahFilter);

  const weeks = Array.from({ length: MEMORISATION_CYCLE_WEEKS }, (_, weekIndex) =>
    buildWeekSummary(surahFilter, weekIndex, ayahsByDate, progress),
  );

  return {
    surahFilter,
    weeks,
    activeWeekIndex: getActiveWeekIndex(),
  };
}

export function clampMemorisationWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), MEMORISATION_CYCLE_WEEKS - 1);
}

export function canNavigateMemorisationWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < MEMORISATION_CYCLE_WEEKS - 1;
}

export function getQuranMemorisationWeekSummary(
  surahFilter: MemorisationSurahFilterId = "all",
  weekIndex?: number,
): MemorisationWeekSummary {
  const cycle = getQuranMemorisationCycleSummary(surahFilter);
  const index = clampMemorisationWeekIndex(
    weekIndex ?? cycle.activeWeekIndex,
  );
  return cycle.weeks[index];
}
