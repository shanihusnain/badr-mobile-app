import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";

export type CompletionAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTimeSpent";

export type CompletionPastStatus = "completed" | "incomplete";

export type CompletionPastAchievementRecord = {
  completionNumber: number;
  startJuz: number;
  endJuz: number;
  completedJuzCount: number;
  totalJuzCount: number;
  status: CompletionPastStatus;
  timeSpentMinutes: number;
};

export type CompletionPeriodSlice = {
  chartPeriods: Array<{
    xLabel: string;
    dateLabel: string;
    completed: number;
    incomplete: number;
    timeSpentMinutes: number;
  }>;
  targetCompletions: number;
  completedCompletions: number;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  dateRangeLabel: string;
  pageCount: number;
  activePageIndex: number;
  completions: CompletionPastAchievementRecord[];
};

const CYCLE_WEEK_LABELS = [
  { xLabel: "w1", dateLabel: "Nov 1–7" },
  { xLabel: "w2", dateLabel: "Nov 8–14" },
  { xLabel: "w3", dateLabel: "Nov 15–21" },
  { xLabel: "w4", dateLabel: "Nov 22–28" },
];

const MONTHLY_COMPLETIONS: CompletionPastAchievementRecord[] = [
  {
    completionNumber: 1,
    startJuz: 1,
    endJuz: 30,
    completedJuzCount: 30,
    totalJuzCount: 30,
    status: "completed",
    timeSpentMinutes: 480,
  },
  {
    completionNumber: 2,
    startJuz: 1,
    endJuz: 30,
    completedJuzCount: 30,
    totalJuzCount: 30,
    status: "completed",
    timeSpentMinutes: 455,
  },
  {
    completionNumber: 3,
    startJuz: 1,
    endJuz: 30,
    completedJuzCount: 30,
    totalJuzCount: 30,
    status: "completed",
    timeSpentMinutes: 420,
  },
  {
    completionNumber: 4,
    startJuz: 1,
    endJuz: 30,
    completedJuzCount: 15,
    totalJuzCount: 30,
    status: "incomplete",
    timeSpentMinutes: 220,
  },
];

const MONTHLY_SLICE: CompletionPeriodSlice = {
  chartPeriods: [
    { ...CYCLE_WEEK_LABELS[0], completed: 1, incomplete: 0, timeSpentMinutes: 180 },
    { ...CYCLE_WEEK_LABELS[1], completed: 1, incomplete: 0, timeSpentMinutes: 165 },
    { ...CYCLE_WEEK_LABELS[2], completed: 1, incomplete: 0, timeSpentMinutes: 150 },
    { ...CYCLE_WEEK_LABELS[3], completed: 0, incomplete: 1, timeSpentMinutes: 95 },
  ],
  targetCompletions: 4,
  completedCompletions: 3,
  achievementPercent: 75,
  previousPeriodDeltaPercent: 12,
  dateRangeLabel: "Nov 1 — 28, 24",
  pageCount: 4,
  activePageIndex: 2,
  completions: MONTHLY_COMPLETIONS,
};

function buildPeriodBar(
  xLabel: string,
  dateLabel: string,
  completed: number,
  periodGoal: number,
  timeSpentMinutes: number,
): QuranPastChartItem {
  const incompleteHours = Math.max(0, periodGoal - completed);
  const stackTotalHours = completed + incompleteHours;

  return {
    xLabel,
    dateLabel,
    completedHours: completed,
    incompleteHours,
    hours: completed,
    stackTotalHours,
  };
}

function buildChartFromSlice(slice: CompletionPeriodSlice): QuranPastChartItem[] {
  const periodGoal = slice.targetCompletions / slice.chartPeriods.length;
  return slice.chartPeriods.map((period) =>
    buildPeriodBar(
      period.xLabel,
      period.dateLabel,
      period.completed,
      periodGoal,
      period.timeSpentMinutes,
    ),
  );
}

function computeYAxis(chartData: QuranPastChartItem[]) {
  const maxStack = Math.max(...chartData.map((item) => item.stackTotalHours), 0);
  const yMax = Math.max(4, Math.ceil(maxStack));
  const step = yMax <= 4 ? 1 : yMax <= 8 ? 2 : 4;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

function sliceToAchievement(slice: CompletionPeriodSlice): QuranHoursPastAchievement {
  const chartData = buildChartFromSlice(slice);
  const completedHours = chartData.reduce(
    (sum, item) => sum + item.completedHours,
    0,
  );
  const incompleteHours = chartData.reduce(
    (sum, item) => sum + item.incompleteHours,
    0,
  );
  const yAxis = computeYAxis(chartData);

  return {
    dateRangeLabel: slice.dateRangeLabel,
    achievementPercent: Math.round(
      (slice.completedCompletions / Math.max(slice.targetCompletions, 1)) * 100,
    ),
    previousPeriodDeltaPercent: slice.previousPeriodDeltaPercent,
    goalHours: slice.targetCompletions,
    periodGoalHours: slice.targetCompletions / slice.chartPeriods.length,
    completedHours,
    incompleteHours,
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

function scaleCompletionSlice(
  slice: CompletionPeriodSlice,
  period: PastAchievementPeriod,
): CompletionPeriodSlice {
  if (period === "monthly") return slice;

  if (period === "threeMonths") {
    return {
      ...slice,
      dateRangeLabel: "Sep — Nov, 24",
      targetCompletions: 4,
      completedCompletions: 3,
      achievementPercent: 75,
      previousPeriodDeltaPercent: 8,
      pageCount: 3,
      activePageIndex: 2,
      chartPeriods: [
        {
          xLabel: "m1",
          dateLabel: "Sep 1–30",
          completed: 2,
          incomplete: 1,
          timeSpentMinutes: 520,
        },
        {
          xLabel: "m2",
          dateLabel: "Oct 1–31",
          completed: 3,
          incomplete: 1,
          timeSpentMinutes: 610,
        },
        {
          xLabel: "m3",
          dateLabel: "Nov 1–30",
          completed: 3,
          incomplete: 1,
          timeSpentMinutes: 580,
        },
      ],
      completions: slice.completions.map((item, index) =>
        index < 3
          ? { ...item, status: "completed" as const, completedJuzCount: 30 }
          : item,
      ),
    };
  }

  return {
    ...slice,
    dateRangeLabel: "Jun — Nov, 24",
    targetCompletions: 4,
    completedCompletions: 2,
    achievementPercent: 62,
    previousPeriodDeltaPercent: -8,
    pageCount: 6,
    activePageIndex: 4,
    chartPeriods: [
      { xLabel: "m1", dateLabel: "Jun", completed: 1, incomplete: 2, timeSpentMinutes: 400 },
      { xLabel: "m2", dateLabel: "Jul", completed: 2, incomplete: 1, timeSpentMinutes: 480 },
      { xLabel: "m3", dateLabel: "Aug", completed: 2, incomplete: 1, timeSpentMinutes: 450 },
      { xLabel: "m4", dateLabel: "Sep", completed: 2, incomplete: 1, timeSpentMinutes: 430 },
      { xLabel: "m5", dateLabel: "Oct", completed: 3, incomplete: 1, timeSpentMinutes: 560 },
      { xLabel: "m6", dateLabel: "Nov", completed: 3, incomplete: 1, timeSpentMinutes: 580 },
    ],
    completions: [
      { ...MONTHLY_COMPLETIONS[0], completedJuzCount: 30, status: "completed" },
      { ...MONTHLY_COMPLETIONS[1], completedJuzCount: 30, status: "completed" },
      { ...MONTHLY_COMPLETIONS[2], completedJuzCount: 12, status: "incomplete" },
      { ...MONTHLY_COMPLETIONS[3], completedJuzCount: 0, status: "incomplete" },
    ],
  };
}

const PERIOD_DATA: Record<PastAchievementPeriod, CompletionPeriodSlice> = {
  monthly: MONTHLY_SLICE,
  threeMonths: scaleCompletionSlice(MONTHLY_SLICE, "threeMonths"),
  sixMonths: scaleCompletionSlice(MONTHLY_SLICE, "sixMonths"),
};

export function getQuranCompletionPastAchievementSlice(
  period: PastAchievementPeriod,
): CompletionPeriodSlice {
  return PERIOD_DATA[period];
}

export function getQuranCompletionPastAchievement(
  period: PastAchievementPeriod,
): QuranHoursPastAchievement {
  return sliceToAchievement(getQuranCompletionPastAchievementSlice(period));
}

export function applyCompletionAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: CompletionPeriodSlice,
  view: CompletionAnalyticsView,
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

export function getCompletionTimeSpentByPeriod(
  slice: CompletionPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalCompletionTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatCompletionCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatCompletionTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatJuzRangeLabel(startJuz: number, endJuz: number): string {
  if (startJuz === endJuz) {
    return `Juz ${startJuz}`;
  }
  return `Juz ${startJuz} - ${endJuz}`;
}

export function getCompletionJuzProgressPercent(
  completedJuzCount: number,
  totalJuzCount: number,
): number {
  if (totalJuzCount <= 0) return 0;
  return Math.min(100, (completedJuzCount / totalJuzCount) * 100);
}
