import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";
import {
  getJuzMemorisationLogsForFilter,
  type JuzMemorisationLogRecord,
} from "./quranMemorisationJuzData";
import {
  getJuzMemorisationGoals,
  type JuzMemorisationGoal,
  type MemorisationJuzFilterId,
} from "./quranMemorisationJuzGoals";

export type { MemorisationJuzFilterId };

export type JuzMemorisationAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTimeSpent";

export type JuzMemorisationPastStatus = "completed" | "incomplete";

export type JuzMemorisationPastAchievementFilter = {
  id: MemorisationJuzFilterId;
  label: string;
  juzNumber: number;
};

export type JuzMemorisationPastAchievementRecord = {
  juzNumber: number;
  juzId: string;
  juzName: string;
  memorizedAyahs: number;
  totalAyahs: number;
  status: JuzMemorisationPastStatus;
  timeSpentMinutes: number;
  progressPercent: number;
};

export type JuzMemorisationLogHistoryItem = {
  id: string;
  juzId: string;
  juzName: string;
  date: string;
  startTime?: string;
  startAyah: number;
  endAyah: number;
  ayahsMemorizedToday: number;
  timeSpentMinutes: number;
};

type ChartPeriod = {
  xLabel: string;
  dateLabel: string;
  completed: number;
  incomplete: number;
  timeSpentMinutes: number;
};

type JuzUnitPeriodData = {
  juzNumber: number;
  juzId: string;
  chartPeriods: ChartPeriod[];
  memorizedAyahs: number;
  totalAyahs: number;
  status: JuzMemorisationPastStatus;
  timeSpentMinutes: number;
};

export type JuzMemorisationPeriodSlice = {
  chartPeriods: ChartPeriod[];
  juzFilter: MemorisationJuzFilterId;
  targetJuzCount: number;
  completedJuzCount: number;
  incompleteJuzCount: number;
  memorizedAyahs: number;
  totalAyahs: number;
  remainingAyahs: number;
  totalTimeSpentMinutes: number;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  dateRangeLabel: string;
  pageCount: number;
  activePageIndex: number;
  juzRecords: JuzMemorisationPastAchievementRecord[];
  logHistory: JuzMemorisationLogHistoryItem[];
  perJuz: Record<number, JuzUnitPeriodData>;
};

export const MEMORISATION_JUZ_SUMMARY_KEY =
  "progressLogging.achievementSummaryMemorisationJuz";

const CYCLE_WEEK_LABELS = [
  { xLabel: "w1", dateLabel: "Nov 1–7" },
  { xLabel: "w2", dateLabel: "Nov 8–14" },
  { xLabel: "w3", dateLabel: "Nov 15–21" },
  { xLabel: "w4", dateLabel: "Nov 22–28" },
] as const;

const MEMORISATION_CYCLE_START = "2025-10-26";
const MEMORISATION_CYCLE_WEEKS = CYCLE_WEEK_LABELS.length;

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateInWeek(date: string, weekIndex: number): boolean {
  const weekStart = addDays(MEMORISATION_CYCLE_START, weekIndex * 7);
  const weekEnd = addDays(weekStart, 6);
  return date >= weekStart && date <= weekEnd;
}

function getJuzCompletionDate(
  juzId: string,
  logs: JuzMemorisationLogRecord[],
  totalAyahs: number,
): string | null {
  const sorted = logs
    .filter((log) => log.juzId === juzId)
    .sort((a, b) => a.date.localeCompare(b.date));

  let cumulative = 0;
  for (const log of sorted) {
    cumulative += log.ayahsMemorizedToday;
    if (cumulative >= totalAyahs) {
      return log.date;
    }
  }
  return null;
}

function buildJuzUnit(
  goal: JuzMemorisationGoal,
  logs: JuzMemorisationLogRecord[],
): JuzUnitPeriodData {
  const juzLogs = logs.filter((log) => log.juzId === goal.id);
  const memorizedAyahs = goal.memorizedAyahs;
  const completionDate = getJuzCompletionDate(
    goal.id,
    logs,
    goal.totalAyahs,
  );
  const status: JuzMemorisationPastStatus =
    memorizedAyahs >= goal.totalAyahs ? "completed" : "incomplete";

  const chartPeriods = CYCLE_WEEK_LABELS.map((week, weekIndex) => {
    const weekLogs = juzLogs.filter((log) => dateInWeek(log.date, weekIndex));
    const timeSpentMinutes = weekLogs.reduce(
      (sum, log) => sum + (log.timeSpentMinutes ?? 0),
      0,
    );
    const hadActivity = weekLogs.length > 0;
    const completedInWeek = Boolean(
      completionDate && dateInWeek(completionDate, weekIndex),
    );

    return {
      ...week,
      completed: completedInWeek ? 1 : 0,
      incomplete: hadActivity && !completedInWeek ? 1 : 0,
      timeSpentMinutes,
    };
  });

  return {
    juzNumber: goal.juzNumber,
    juzId: goal.id,
    chartPeriods,
    memorizedAyahs,
    totalAyahs: goal.totalAyahs,
    status,
    timeSpentMinutes: juzLogs.reduce(
      (sum, log) => sum + (log.timeSpentMinutes ?? 0),
      0,
    ),
  };
}

function unitToRecord(unit: JuzUnitPeriodData): JuzMemorisationPastAchievementRecord {
  const goal = getJuzMemorisationGoals().find((item) => item.id === unit.juzId);
  return {
    juzNumber: unit.juzNumber,
    juzId: unit.juzId,
    juzName: goal?.juzName ?? `Juz ${unit.juzNumber}`,
    memorizedAyahs: unit.memorizedAyahs,
    totalAyahs: unit.totalAyahs,
    status: unit.status,
    timeSpentMinutes: unit.timeSpentMinutes,
    progressPercent:
      unit.totalAyahs > 0
        ? Math.min(100, (unit.memorizedAyahs / unit.totalAyahs) * 100)
        : 0,
  };
}

function aggregateChartPeriods(units: JuzUnitPeriodData[]): ChartPeriod[] {
  const periodCount = units[0]?.chartPeriods.length ?? CYCLE_WEEK_LABELS.length;

  return Array.from({ length: periodCount }, (_, index) => ({
    xLabel: units[0]?.chartPeriods[index]?.xLabel ?? `p${index + 1}`,
    dateLabel: units[0]?.chartPeriods[index]?.dateLabel ?? "",
    completed: units.reduce(
      (sum, unit) => sum + (unit.chartPeriods[index]?.completed ?? 0),
      0,
    ),
    incomplete: units.reduce(
      (sum, unit) => sum + (unit.chartPeriods[index]?.incomplete ?? 0),
      0,
    ),
    timeSpentMinutes: units.reduce(
      (sum, unit) => sum + (unit.chartPeriods[index]?.timeSpentMinutes ?? 0),
      0,
    ),
  }));
}

function buildSliceFromUnits(
  units: JuzUnitPeriodData[],
  meta: {
    juzFilter: MemorisationJuzFilterId;
    previousPeriodDeltaPercent: number;
    dateRangeLabel: string;
    pageCount: number;
    activePageIndex: number;
    allLogs: JuzMemorisationLogRecord[];
  },
): JuzMemorisationPeriodSlice {
  const activeUnits = units.filter(
    (unit) => unit.memorizedAyahs > 0 || unit.timeSpentMinutes > 0,
  );
  const completedJuzCount = units.filter(
    (unit) => unit.status === "completed",
  ).length;
  const targetJuzCount = units.length;
  const incompleteJuzCount = targetJuzCount - completedJuzCount;
  const memorizedAyahs = units.reduce(
    (sum, unit) => sum + unit.memorizedAyahs,
    0,
  );
  const totalAyahs = units.reduce((sum, unit) => sum + unit.totalAyahs, 0);
  const goalsById = new Map(
    getJuzMemorisationGoals().map((goal) => [goal.id, goal]),
  );
  const sortedLogs = [...meta.allLogs].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    chartPeriods: aggregateChartPeriods(units),
    juzFilter: meta.juzFilter,
    targetJuzCount,
    completedJuzCount,
    incompleteJuzCount,
    memorizedAyahs,
    totalAyahs,
    remainingAyahs: Math.max(0, totalAyahs - memorizedAyahs),
    totalTimeSpentMinutes: meta.allLogs.reduce(
      (sum, log) => sum + (log.timeSpentMinutes ?? 0),
      0,
    ),
    achievementPercent: Math.round(
      (completedJuzCount / Math.max(targetJuzCount, 1)) * 100,
    ),
    previousPeriodDeltaPercent: meta.previousPeriodDeltaPercent,
    dateRangeLabel: meta.dateRangeLabel,
    pageCount: meta.pageCount,
    activePageIndex: meta.activePageIndex,
    juzRecords: units.map(unitToRecord),
    perJuz: Object.fromEntries(units.map((unit) => [unit.juzNumber, unit])),
    logHistory: sortedLogs
      .map((log) => {
        const goal = goalsById.get(log.juzId);
        return {
          id: `${log.juzId}-${log.date}-${log.startAyah}-${log.endAyah}`,
          juzId: log.juzId,
          juzName: goal?.juzName ?? log.juzId,
          date: log.date,
          startTime: log.startTime,
          startAyah: log.startAyah,
          endAyah: log.endAyah,
          ayahsMemorizedToday: log.ayahsMemorizedToday,
          timeSpentMinutes: log.timeSpentMinutes,
        };
      })
      .reverse(),
  };
}

function buildMonthlySlice(): JuzMemorisationPeriodSlice {
  const goals = getJuzMemorisationGoals();
  const allLogs = getJuzMemorisationLogsForFilter("all") ?? [];
  const units = goals.map((goal) => buildJuzUnit(goal, allLogs));

  return buildSliceFromUnits(units, {
    juzFilter: "all",
    previousPeriodDeltaPercent: 15,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: MEMORISATION_CYCLE_WEEKS,
    activePageIndex: 2,
    allLogs,
  });
}

function filterJuzPeriodSlice(
  slice: JuzMemorisationPeriodSlice,
  juzFilter: MemorisationJuzFilterId,
): JuzMemorisationPeriodSlice {
  if (juzFilter === "all") return slice;

  const goal = getJuzMemorisationGoals().find((item) => item.id === juzFilter);
  const unit = goal ? slice.perJuz[goal.juzNumber] : undefined;

  if (!unit) {
    return {
      ...slice,
      juzFilter,
      chartPeriods: slice.chartPeriods.map((period) => ({
        ...period,
        completed: 0,
        incomplete: 0,
        timeSpentMinutes: 0,
      })),
      targetJuzCount: 1,
      completedJuzCount: 0,
      incompleteJuzCount: 1,
      achievementPercent: 0,
      juzRecords: [],
    };
  }

  const record = unitToRecord(unit);
  const filteredLogs = slice.logHistory.filter((log) => log.juzId === juzFilter);

  return {
    ...slice,
    juzFilter,
    chartPeriods: unit.chartPeriods,
    targetJuzCount: 1,
    completedJuzCount: unit.status === "completed" ? 1 : 0,
    incompleteJuzCount: unit.status === "completed" ? 0 : 1,
    memorizedAyahs: unit.memorizedAyahs,
    totalAyahs: unit.totalAyahs,
    remainingAyahs: Math.max(0, unit.totalAyahs - unit.memorizedAyahs),
    totalTimeSpentMinutes: unit.timeSpentMinutes,
    achievementPercent: Math.round(
      (unit.memorizedAyahs / Math.max(unit.totalAyahs, 1)) * 100,
    ),
    juzRecords: [record],
    logHistory: filteredLogs,
  };
}

function scaleJuzSlice(
  slice: JuzMemorisationPeriodSlice,
  period: PastAchievementPeriod,
): JuzMemorisationPeriodSlice {
  if (period === "monthly") return slice;

  if (period === "threeMonths") {
    const scaledUnits = Object.values(slice.perJuz).map((unit) => ({
      ...unit,
      chartPeriods: [
        {
          xLabel: "m1",
          dateLabel: "Sep 1–30",
          completed: unit.chartPeriods[0]?.completed ?? 0,
          incomplete: unit.chartPeriods[0]?.incomplete ?? 0,
          timeSpentMinutes: (unit.chartPeriods[0]?.timeSpentMinutes ?? 0) * 3,
        },
        {
          xLabel: "m2",
          dateLabel: "Oct 1–31",
          completed: unit.chartPeriods[1]?.completed ?? 0,
          incomplete: unit.chartPeriods[1]?.incomplete ?? 0,
          timeSpentMinutes: (unit.chartPeriods[1]?.timeSpentMinutes ?? 0) * 3,
        },
        {
          xLabel: "m3",
          dateLabel: "Nov 1–30",
          completed: unit.chartPeriods.reduce((sum, p) => sum + p.completed, 0),
          incomplete: unit.chartPeriods.reduce((sum, p) => sum + p.incomplete, 0),
          timeSpentMinutes: unit.chartPeriods.reduce(
            (sum, p) => sum + p.timeSpentMinutes,
            0,
          ),
        },
      ],
    }));

    return buildSliceFromUnits(scaledUnits, {
      juzFilter: slice.juzFilter,
      previousPeriodDeltaPercent: 6,
      dateRangeLabel: "Sep — Nov, 24",
      pageCount: 3,
      activePageIndex: 2,
      allLogs: [],
    });
  }

  const scaledUnits = Object.values(slice.perJuz).map((unit) => ({
    ...unit,
    chartPeriods: [
      { xLabel: "m1", dateLabel: "Jun", completed: unit.chartPeriods[0]?.completed ?? 0, incomplete: unit.chartPeriods[0]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[0]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m2", dateLabel: "Jul", completed: unit.chartPeriods[1]?.completed ?? 0, incomplete: unit.chartPeriods[1]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[1]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m3", dateLabel: "Aug", completed: unit.chartPeriods[2]?.completed ?? 0, incomplete: unit.chartPeriods[2]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[2]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m4", dateLabel: "Sep", completed: unit.chartPeriods[3]?.completed ?? 0, incomplete: unit.chartPeriods[3]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[3]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m5", dateLabel: "Oct", completed: unit.chartPeriods[1]?.completed ?? 0, incomplete: unit.chartPeriods[1]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[1]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m6", dateLabel: "Nov", completed: unit.chartPeriods.reduce((sum, p) => sum + p.completed, 0), incomplete: unit.chartPeriods.reduce((sum, p) => sum + p.incomplete, 0), timeSpentMinutes: unit.chartPeriods.reduce((sum, p) => sum + p.timeSpentMinutes, 0) },
    ],
  }));

  return buildSliceFromUnits(scaledUnits, {
    juzFilter: slice.juzFilter,
    previousPeriodDeltaPercent: -5,
    dateRangeLabel: "Jun — Nov, 24",
    pageCount: 6,
    activePageIndex: 4,
    allLogs: [],
  });
}

function buildPeriodBar(
  xLabel: string,
  dateLabel: string,
  completed: number,
  periodGoal: number,
): QuranPastChartItem {
  const incompleteHours = Math.max(0, periodGoal - completed);
  return {
    xLabel,
    dateLabel,
    completedHours: completed,
    incompleteHours,
    hours: completed,
    stackTotalHours: completed + incompleteHours,
  };
}

function buildChartFromSlice(slice: JuzMemorisationPeriodSlice): QuranPastChartItem[] {
  const periodGoal = Math.max(
    slice.targetJuzCount / slice.chartPeriods.length,
    1,
  );
  return slice.chartPeriods.map((period) =>
    buildPeriodBar(
      period.xLabel,
      period.dateLabel,
      period.completed,
      periodGoal,
    ),
  );
}

function computeYAxis(chartData: QuranPastChartItem[]) {
  const maxStack = Math.max(
    ...chartData.map((item) => item.stackTotalHours),
    0,
  );
  const yMax = Math.max(4, Math.ceil(maxStack));
  const step = yMax <= 4 ? 1 : yMax <= 8 ? 2 : 4;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

let cachedMonthlySlice: JuzMemorisationPeriodSlice | null = null;

function getBaseMonthlySlice(): JuzMemorisationPeriodSlice {
  if (!cachedMonthlySlice) {
    cachedMonthlySlice = buildMonthlySlice();
  }
  return cachedMonthlySlice;
}

export function getJuzMemorisationPastAchievementFilters(): JuzMemorisationPastAchievementFilter[] {
  const goals = getJuzMemorisationGoals();
  return [
    { id: "all", label: "All", juzNumber: 0 },
    ...goals.map((goal) => ({
      id: goal.id,
      label: goal.juzName,
      juzNumber: goal.juzNumber,
    })),
  ];
}

export function getJuzMemorisationPastAchievementSlice(
  period: PastAchievementPeriod,
  juzFilter: MemorisationJuzFilterId = "all",
): JuzMemorisationPeriodSlice {
  const scaled = scaleJuzSlice(getBaseMonthlySlice(), period);
  return filterJuzPeriodSlice(scaled, juzFilter);
}

function sliceToAchievement(
  slice: JuzMemorisationPeriodSlice,
): QuranHoursPastAchievement {
  const chartData = buildChartFromSlice(slice);
  const yAxis = computeYAxis(chartData);

  return {
    dateRangeLabel: slice.dateRangeLabel,
    achievementPercent: slice.achievementPercent,
    previousPeriodDeltaPercent: slice.previousPeriodDeltaPercent,
    goalHours: slice.targetJuzCount,
    periodGoalHours: slice.targetJuzCount / slice.chartPeriods.length,
    completedHours: chartData.reduce(
      (sum, item) => sum + item.completedHours,
      0,
    ),
    incompleteHours: chartData.reduce(
      (sum, item) => sum + item.incompleteHours,
      0,
    ),
    activeDays: 0,
    activeDaysPrevious: 0,
    longestStreak: 0,
    longestStreakPrevious: 0,
    pageCount: slice.pageCount,
    activePageIndex: slice.activePageIndex,
    chartData,
    ...yAxis,
  };
}

export function getJuzMemorisationPastAchievement(
  period: PastAchievementPeriod,
  juzFilter: MemorisationJuzFilterId = "all",
): QuranHoursPastAchievement {
  return sliceToAchievement(
    getJuzMemorisationPastAchievementSlice(period, juzFilter),
  );
}

export function applyJuzMemorisationAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: JuzMemorisationPeriodSlice,
  view: JuzMemorisationAnalyticsView,
): QuranHoursPastAchievement {
  if (view === "completedVsIncomplete") {
    return achievement;
  }

  const chartData = achievement.chartData.map((item, index) => {
    const timeSpentHours =
      (slice.chartPeriods[index]?.timeSpentMinutes ?? 0) / 60;
    return {
      ...item,
      incompleteHours: timeSpentHours,
      stackTotalHours: item.completedHours + timeSpentHours,
      hours: item.completedHours,
    };
  });

  return {
    ...achievement,
    chartData,
    ...computeYAxis(chartData),
  };
}

export function getJuzMemorisationTimeSpentByPeriod(
  slice: JuzMemorisationPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalJuzMemorisationTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatJuzMemorisationCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatJuzMemorisationTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function getJuzMemorisationAyahProgressPercent(
  memorizedAyahs: number,
  totalAyahs: number,
): number {
  if (totalAyahs <= 0) return 0;
  return Math.min(100, (memorizedAyahs / totalAyahs) * 100);
}

export function invalidateJuzMemorisationPastAchievementCache(): void {
  cachedMonthlySlice = null;
}
