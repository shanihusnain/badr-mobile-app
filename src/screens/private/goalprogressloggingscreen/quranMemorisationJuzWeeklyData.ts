import { getJuzMemorisationLogsForFilter } from "./quranMemorisationJuzData";
import {
  getJuzMemorisationGoalsForFilter,
  type MemorisationJuzFilterId,
} from "./quranMemorisationJuzGoals";

export type JuzMemorisationDayProgress = {
  day: string;
  date: string;
  ayahsLogged: number;
  minutesLogged: number;
  isLogged: boolean;
  isBestDay?: boolean;
  isToday?: boolean;
};

export type JuzMemorisationWeekSummary = {
  juzFilter: MemorisationJuzFilterId;
  juzName: string;
  weekDays: JuzMemorisationDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  currentWeek: number;
  weekIndex: number;
  totalAyahsThisWeek: number;
  totalMinutesThisWeek: number;
  memorizedAyahs: number;
  totalAyahs: number;
  remainingAyahs: number;
  progressPercent: number;
  completed: boolean;
  streakDays: number;
  motivationalQuoteKey: string;
};

export type JuzMemorisationCycleSummary = {
  juzFilter: MemorisationJuzFilterId;
  weeks: JuzMemorisationWeekSummary[];
  activeWeekIndex: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MEMORISATION_CYCLE_WEEKS = 4;
const CYCLE_START = "2025-10-26";
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
  logs: ReturnType<typeof getJuzMemorisationLogsForFilter>,
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

function aggregateMinutesByDate(
  logs: ReturnType<typeof getJuzMemorisationLogsForFilter>,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const log of logs) {
    totals.set(
      log.date,
      (totals.get(log.date) ?? 0) + log.timeSpentMinutes,
    );
  }
  return totals;
}

function computeStreakDays(weekDays: JuzMemorisationDayProgress[]): number {
  let streak = 0;
  for (let index = weekDays.length - 1; index >= 0; index -= 1) {
    if (!weekDays[index].isLogged) break;
    streak += 1;
  }
  return streak;
}

function applyBestDayFlags(
  weekDays: JuzMemorisationDayProgress[],
): JuzMemorisationDayProgress[] {
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
  minutesByDate: Map<string, number>,
): JuzMemorisationDayProgress[] {
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const ayahsLogged = ayahsByDate.get(date) ?? 0;
    const minutesLogged = minutesByDate.get(date) ?? 0;
    return {
      day: getDayLabel(date),
      date,
      ayahsLogged,
      minutesLogged,
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

function buildJuzProgress(juzFilter: MemorisationJuzFilterId) {
  const goals = getJuzMemorisationGoalsForFilter(juzFilter);
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
    juzFilter === "all"
      ? goals.length > 0 && goals.every((goal) => goal.completed)
      : (goals[0]?.completed ?? false);
  const juzName =
    juzFilter === "all" ? "All Juzs" : (goals[0]?.juzName ?? juzFilter);

  return {
    goals,
    memorizedAyahs,
    totalAyahs,
    remainingAyahs,
    progressPercent,
    completed,
    juzName,
  };
}

function buildWeekSummary(
  juzFilter: MemorisationJuzFilterId,
  weekIndex: number,
  ayahsByDate: Map<string, number>,
  minutesByDate: Map<string, number>,
  progress: ReturnType<typeof buildJuzProgress>,
): JuzMemorisationWeekSummary {
  const weekStart = addDays(CYCLE_START, weekIndex * 7);
  const weekEnd = addDays(weekStart, 6);
  const weekDays = buildWeekDays(weekStart, ayahsByDate, minutesByDate);
  const currentWeek = weekIndex + 1;

  return {
    juzFilter,
    juzName: progress.juzName,
    weekDays,
    weekRangeLabel: formatWeekRangeLabel(weekStart, weekEnd),
    weekFraction: `${currentWeek}/${MEMORISATION_CYCLE_WEEKS}`,
    currentWeek,
    weekIndex,
    totalAyahsThisWeek: weekDays.reduce(
      (sum, day) => sum + day.ayahsLogged,
      0,
    ),
    totalMinutesThisWeek: weekDays.reduce(
      (sum, day) => sum + day.minutesLogged,
      0,
    ),
    memorizedAyahs: progress.memorizedAyahs,
    totalAyahs: progress.totalAyahs,
    remainingAyahs: progress.remainingAyahs,
    progressPercent: progress.progressPercent,
    completed: progress.completed,
    streakDays: computeStreakDays(weekDays),
    motivationalQuoteKey: "progressLogging.quranMemorisationJuzWeekQuote",
  };
}

export function getQuranMemorisationJuzCycleSummary(
  juzFilter: MemorisationJuzFilterId = "all",
): JuzMemorisationCycleSummary {
  const logs = getJuzMemorisationLogsForFilter(juzFilter);
  const ayahsByDate = aggregateAyahsByDate(logs);
  const minutesByDate = aggregateMinutesByDate(logs);
  const progress = buildJuzProgress(juzFilter);

  const weeks = Array.from({ length: MEMORISATION_CYCLE_WEEKS }, (_, weekIndex) =>
    buildWeekSummary(juzFilter, weekIndex, ayahsByDate, minutesByDate, progress),
  );

  return {
    juzFilter,
    weeks,
    activeWeekIndex: getActiveWeekIndex(),
  };
}

export function clampJuzMemorisationWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), MEMORISATION_CYCLE_WEEKS - 1);
}

export function canNavigateJuzMemorisationWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < MEMORISATION_CYCLE_WEEKS - 1;
}
