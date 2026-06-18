import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import {
  getSurahRecitationCycleMode,
  type SurahRecitationGoalId,
} from "./quranRecitationTarget";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";

export type SurahFilterId = "all" | string;

export type RecitationAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTimeSpent";

export type SurahPastAchievementFilter = {
  id: SurahFilterId;
  surahName: string;
};

export type SurahPeriodSlice = {
  chartPeriods: Array<{
    xLabel: string;
    dateLabel: string;
    completed: number;
    incomplete: number;
    timeSpentMinutes: number;
  }>;
  goalTotal: number;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  activeDays: number;
  activeDaysPrevious: number;
  longestStreak: number;
  longestStreakPrevious: number;
  dateRangeLabel: string;
  pageCount: number;
  activePageIndex: number;
};

export type WeeklySurahWeekRecord = {
  weekNumber: number;
  completed: number;
  timeSpentMinutes: number;
};

export type WeeklySurahPastAchievementMock = {
  surahId: string;
  surahName: string;
  goalType: "weekly";
  weeklyTarget: number;
  totalTarget: number;
  weeks: WeeklySurahWeekRecord[];
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  activeDays: number;
  activeDaysPrevious: number;
  longestStreak: number;
  longestStreakPrevious: number;
};

type PastAchievementDataMode = "daily" | "weekly";

const CYCLE_WEEK_LABELS = [
  { xLabel: "w1", dateLabel: "Nov 1–7" },
  { xLabel: "w2", dateLabel: "Nov 8–14" },
  { xLabel: "w3", dateLabel: "Nov 15–21" },
  { xLabel: "w4", dateLabel: "Nov 22–28" },
];

function buildPeriodBar(
  xLabel: string,
  dateLabel: string,
  completed: number,
  periodGoal: number,
  timeSpentMinutes: number,
): QuranPastChartItem & { timeSpentMinutes: number } {
  const incomplete = Math.max(0, periodGoal - completed);
  const stackTotalHours = completed + incomplete;

  return {
    xLabel,
    dateLabel,
    completedHours: completed,
    incompleteHours: incomplete,
    hours: completed,
    stackTotalHours,
    timeSpentMinutes,
  };
}

function buildChartFromSlice(slice: SurahPeriodSlice): QuranPastChartItem[] {
  const periodGoal = slice.goalTotal / slice.chartPeriods.length;
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
  const yMax = Math.max(15, Math.ceil(maxStack / 5) * 5);
  const step = yMax <= 15 ? 5 : yMax <= 25 ? 5 : 10;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

function sliceToAchievement(slice: SurahPeriodSlice): QuranHoursPastAchievement {
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
    achievementPercent: slice.achievementPercent,
    previousPeriodDeltaPercent: slice.previousPeriodDeltaPercent,
    goalHours: slice.goalTotal,
    periodGoalHours: slice.goalTotal / slice.chartPeriods.length,
    completedHours,
    incompleteHours,
    activeDays: slice.activeDays,
    activeDaysPrevious: slice.activeDaysPrevious,
    longestStreak: slice.longestStreak,
    longestStreakPrevious: slice.longestStreakPrevious,
    pageCount: slice.pageCount,
    activePageIndex: slice.activePageIndex,
    chartData,
    ...yAxis,
  };
}

function aggregateSlices(slices: SurahPeriodSlice[]): SurahPeriodSlice {
  const base = slices[0];
  const periodCount = base.chartPeriods.length;

  const chartPeriods = Array.from({ length: periodCount }, (_, index) => ({
    xLabel: base.chartPeriods[index].xLabel,
    dateLabel: base.chartPeriods[index].dateLabel,
    completed: slices.reduce(
      (sum, slice) => sum + slice.chartPeriods[index].completed,
      0,
    ),
    incomplete: slices.reduce(
      (sum, slice) => sum + slice.chartPeriods[index].incomplete,
      0,
    ),
    timeSpentMinutes: slices.reduce(
      (sum, slice) => sum + slice.chartPeriods[index].timeSpentMinutes,
      0,
    ),
  }));

  const goalTotal = slices.reduce((sum, slice) => sum + slice.goalTotal, 0);
  const completedTotal = chartPeriods.reduce(
    (sum, period) => sum + period.completed,
    0,
  );

  return {
    chartPeriods,
    goalTotal,
    achievementPercent: Math.round((completedTotal / goalTotal) * 100),
    previousPeriodDeltaPercent: Math.round(
      slices.reduce((sum, slice) => sum + slice.previousPeriodDeltaPercent, 0) /
        slices.length,
    ),
    activeDays: Math.max(...slices.map((slice) => slice.activeDays)),
    activeDaysPrevious: Math.max(
      ...slices.map((slice) => slice.activeDaysPrevious),
    ),
    longestStreak: Math.max(...slices.map((slice) => slice.longestStreak)),
    longestStreakPrevious: Math.max(
      ...slices.map((slice) => slice.longestStreakPrevious),
    ),
    dateRangeLabel: base.dateRangeLabel,
    pageCount: base.pageCount,
    activePageIndex: base.activePageIndex,
  };
}

function weeklyMockToMonthlySlice(
  mock: WeeklySurahPastAchievementMock,
): SurahPeriodSlice {
  const completedTotal = mock.weeks.reduce(
    (sum, week) => sum + week.completed,
    0,
  );

  return {
    chartPeriods: mock.weeks.map((week, index) => ({
      xLabel: CYCLE_WEEK_LABELS[index]?.xLabel ?? `w${week.weekNumber}`,
      dateLabel: CYCLE_WEEK_LABELS[index]?.dateLabel ?? `Week ${week.weekNumber}`,
      completed: week.completed,
      incomplete: Math.max(0, mock.weeklyTarget - week.completed),
      timeSpentMinutes: week.timeSpentMinutes,
    })),
    goalTotal: mock.totalTarget,
    achievementPercent:
      mock.achievementPercent ??
      Math.round((completedTotal / mock.totalTarget) * 100),
    previousPeriodDeltaPercent: mock.previousPeriodDeltaPercent,
    activeDays: mock.activeDays,
    activeDaysPrevious: mock.activeDaysPrevious,
    longestStreak: mock.longestStreak,
    longestStreakPrevious: mock.longestStreakPrevious,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 2,
  };
}

const SURAH_DAILY_MONTHLY_DATA: Record<string, SurahPeriodSlice> = {
  "surah-al-baqarah": {
    chartPeriods: [
      { ...CYCLE_WEEK_LABELS[0], completed: 10, incomplete: 0, timeSpentMinutes: 180 },
      { ...CYCLE_WEEK_LABELS[1], completed: 12, incomplete: 0, timeSpentMinutes: 210 },
      { ...CYCLE_WEEK_LABELS[2], completed: 14, incomplete: 0, timeSpentMinutes: 240 },
      { ...CYCLE_WEEK_LABELS[3], completed: 8, incomplete: 0, timeSpentMinutes: 150 },
    ].map((period) => ({
      ...period,
      incomplete: Math.max(0, 20 - period.completed),
    })),
    goalTotal: 80,
    achievementPercent: 55,
    previousPeriodDeltaPercent: 22,
    activeDays: 24,
    activeDaysPrevious: 20,
    longestStreak: 4,
    longestStreakPrevious: 3,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 2,
  },
  "surah-al-imran": {
    chartPeriods: [
      { ...CYCLE_WEEK_LABELS[0], completed: 6, incomplete: 4, timeSpentMinutes: 120 },
      { ...CYCLE_WEEK_LABELS[1], completed: 8, incomplete: 2, timeSpentMinutes: 140 },
      { ...CYCLE_WEEK_LABELS[2], completed: 5, incomplete: 5, timeSpentMinutes: 95 },
      { ...CYCLE_WEEK_LABELS[3], completed: 9, incomplete: 1, timeSpentMinutes: 160 },
    ],
    goalTotal: 60,
    achievementPercent: 47,
    previousPeriodDeltaPercent: 18,
    activeDays: 20,
    activeDaysPrevious: 18,
    longestStreak: 3,
    longestStreakPrevious: 2,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 1,
  },
  "surah-al-mulk": {
    chartPeriods: [
      { ...CYCLE_WEEK_LABELS[0], completed: 4, incomplete: 6, timeSpentMinutes: 70 },
      { ...CYCLE_WEEK_LABELS[1], completed: 6, incomplete: 4, timeSpentMinutes: 90 },
      { ...CYCLE_WEEK_LABELS[2], completed: 7, incomplete: 3, timeSpentMinutes: 105 },
      { ...CYCLE_WEEK_LABELS[3], completed: 5, incomplete: 5, timeSpentMinutes: 80 },
    ],
    goalTotal: 50,
    achievementPercent: 44,
    previousPeriodDeltaPercent: 15,
    activeDays: 18,
    activeDaysPrevious: 16,
    longestStreak: 2,
    longestStreakPrevious: 2,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 2,
  },
  "surah-ya-sin": {
    chartPeriods: [
      { ...CYCLE_WEEK_LABELS[0], completed: 8, incomplete: 2, timeSpentMinutes: 110 },
      { ...CYCLE_WEEK_LABELS[1], completed: 7, incomplete: 3, timeSpentMinutes: 100 },
      { ...CYCLE_WEEK_LABELS[2], completed: 9, incomplete: 1, timeSpentMinutes: 130 },
      { ...CYCLE_WEEK_LABELS[3], completed: 6, incomplete: 4, timeSpentMinutes: 85 },
    ],
    goalTotal: 60,
    achievementPercent: 50,
    previousPeriodDeltaPercent: 20,
    activeDays: 22,
    activeDaysPrevious: 19,
    longestStreak: 3,
    longestStreakPrevious: 3,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 2,
  },
  "surah-al-kahf": {
    chartPeriods: [
      { ...CYCLE_WEEK_LABELS[0], completed: 12, incomplete: 0, timeSpentMinutes: 200 },
      { ...CYCLE_WEEK_LABELS[1], completed: 11, incomplete: 1, timeSpentMinutes: 185 },
      { ...CYCLE_WEEK_LABELS[2], completed: 10, incomplete: 2, timeSpentMinutes: 170 },
      { ...CYCLE_WEEK_LABELS[3], completed: 13, incomplete: 0, timeSpentMinutes: 220 },
    ],
    goalTotal: 52,
    achievementPercent: 88,
    previousPeriodDeltaPercent: 12,
    activeDays: 26,
    activeDaysPrevious: 24,
    longestStreak: 5,
    longestStreakPrevious: 4,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 3,
  },
};

export const WEEKLY_SURAH_PAST_MOCKS: WeeklySurahPastAchievementMock[] = [
  {
    surahId: "surah-al-baqarah",
    surahName: "Al-Baqarah",
    goalType: "weekly",
    weeklyTarget: 3,
    totalTarget: 12,
    weeks: [
      { weekNumber: 1, completed: 3, timeSpentMinutes: 95 },
      { weekNumber: 2, completed: 2, timeSpentMinutes: 70 },
      { weekNumber: 3, completed: 1, timeSpentMinutes: 35 },
      { weekNumber: 4, completed: 3, timeSpentMinutes: 90 },
    ],
    achievementPercent: 75,
    previousPeriodDeltaPercent: 18,
    activeDays: 16,
    activeDaysPrevious: 14,
    longestStreak: 3,
    longestStreakPrevious: 2,
  },
  {
    surahId: "surah-al-mulk",
    surahName: "Al-Mulk",
    goalType: "weekly",
    weeklyTarget: 2,
    totalTarget: 8,
    weeks: [
      { weekNumber: 1, completed: 2, timeSpentMinutes: 55 },
      { weekNumber: 2, completed: 1, timeSpentMinutes: 30 },
      { weekNumber: 3, completed: 2, timeSpentMinutes: 60 },
      { weekNumber: 4, completed: 1, timeSpentMinutes: 28 },
    ],
    achievementPercent: 75,
    previousPeriodDeltaPercent: 12,
    activeDays: 14,
    activeDaysPrevious: 12,
    longestStreak: 2,
    longestStreakPrevious: 2,
  },
  {
    surahId: "surah-ya-sin",
    surahName: "Ya-Sin",
    goalType: "weekly",
    weeklyTarget: 3,
    totalTarget: 12,
    weeks: [
      { weekNumber: 1, completed: 3, timeSpentMinutes: 88 },
      { weekNumber: 2, completed: 3, timeSpentMinutes: 92 },
      { weekNumber: 3, completed: 2, timeSpentMinutes: 58 },
      { weekNumber: 4, completed: 2, timeSpentMinutes: 62 },
    ],
    achievementPercent: 83,
    previousPeriodDeltaPercent: 15,
    activeDays: 18,
    activeDaysPrevious: 16,
    longestStreak: 3,
    longestStreakPrevious: 3,
  },
  {
    surahId: "surah-ar-rahman",
    surahName: "Ar-Rahman",
    goalType: "weekly",
    weeklyTarget: 2,
    totalTarget: 8,
    weeks: [
      { weekNumber: 1, completed: 1, timeSpentMinutes: 32 },
      { weekNumber: 2, completed: 2, timeSpentMinutes: 48 },
      { weekNumber: 3, completed: 2, timeSpentMinutes: 52 },
      { weekNumber: 4, completed: 2, timeSpentMinutes: 45 },
    ],
    achievementPercent: 88,
    previousPeriodDeltaPercent: 10,
    activeDays: 15,
    activeDaysPrevious: 13,
    longestStreak: 2,
    longestStreakPrevious: 2,
  },
];

const WEEKLY_SURAH_MONTHLY_DATA: Record<string, SurahPeriodSlice> =
  Object.fromEntries(
    WEEKLY_SURAH_PAST_MOCKS.map((mock) => [
      mock.surahId,
      weeklyMockToMonthlySlice(mock),
    ]),
  );

function scaleSlice(
  slice: SurahPeriodSlice,
  period: PastAchievementPeriod,
): SurahPeriodSlice {
  if (period === "monthly") return slice;

  if (period === "threeMonths") {
    return {
      ...slice,
      dateRangeLabel: "Sep — Nov, 24",
      goalTotal: Math.round(slice.goalTotal * 2.6),
      pageCount: 3,
      activePageIndex: 2,
      chartPeriods: [
        {
          xLabel: "m1",
          dateLabel: "Sep 1–30",
          completed: Math.round(slice.chartPeriods[0].completed * 2.4),
          incomplete: Math.round(slice.chartPeriods[0].incomplete * 2.4),
          timeSpentMinutes: slice.chartPeriods[0].timeSpentMinutes * 4,
        },
        {
          xLabel: "m2",
          dateLabel: "Oct 1–31",
          completed: Math.round(slice.chartPeriods[1].completed * 2.6),
          incomplete: Math.round(slice.chartPeriods[1].incomplete * 2.6),
          timeSpentMinutes: slice.chartPeriods[1].timeSpentMinutes * 4,
        },
        {
          xLabel: "m3",
          dateLabel: "Nov 1–30",
          completed: slice.chartPeriods.reduce(
            (sum, periodItem) => sum + periodItem.completed,
            0,
          ),
          incomplete: slice.chartPeriods.reduce(
            (sum, periodItem) => sum + periodItem.incomplete,
            0,
          ),
          timeSpentMinutes: slice.chartPeriods.reduce(
            (sum, periodItem) => sum + periodItem.timeSpentMinutes,
            0,
          ),
        },
      ],
    };
  }

  return {
    ...slice,
    dateRangeLabel: "Jun — Nov, 24",
    goalTotal: Math.round(slice.goalTotal * 4.5),
    pageCount: 6,
    activePageIndex: 5,
    chartPeriods: CYCLE_WEEK_LABELS.map((week, index) => ({
      xLabel: `m${index + 1}`,
      dateLabel: week.dateLabel.replace("Nov", "Jun").replace("Nov", "Jul"),
      completed: Math.max(
        1,
        Math.round(slice.chartPeriods[index % 4].completed * (1.1 + index * 0.05)),
      ),
      incomplete: Math.max(
        0,
        Math.round(slice.chartPeriods[index % 4].incomplete * (1.1 + index * 0.05)),
      ),
      timeSpentMinutes: slice.chartPeriods[index % 4].timeSpentMinutes * 3,
    })),
  };
}

export function getPastAchievementDataMode(
  goalId: SurahRecitationGoalId,
): PastAchievementDataMode {
  return getSurahRecitationCycleMode(goalId);
}

function getMonthlyDataForMode(
  mode: PastAchievementDataMode,
): Record<string, SurahPeriodSlice> {
  return mode === "weekly" ? WEEKLY_SURAH_MONTHLY_DATA : SURAH_DAILY_MONTHLY_DATA;
}

export function getWeeklySurahPastAchievementMock(
  surahId: string,
): WeeklySurahPastAchievementMock | undefined {
  return WEEKLY_SURAH_PAST_MOCKS.find((mock) => mock.surahId === surahId);
}

export function getPastAchievementSurahFilters(
  goalId: SurahRecitationGoalId,
): SurahPastAchievementFilter[] {
  const mode = getPastAchievementDataMode(goalId);
  const monthlyData = getMonthlyDataForMode(mode);

  const surahs =
    mode === "weekly"
      ? WEEKLY_SURAH_PAST_MOCKS.map((mock) => ({
          id: mock.surahId,
          surahName: mock.surahName,
        }))
      : Object.keys(monthlyData).map((id) => ({
          id,
          surahName: id
            .replace("surah-", "")
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("-"),
        }));

  return [{ id: "all", surahName: "All" }, ...surahs];
}

function getSliceForSurah(
  goalId: SurahRecitationGoalId,
  surahId: SurahFilterId,
  period: PastAchievementPeriod,
): SurahPeriodSlice {
  const monthlyData = getMonthlyDataForMode(getPastAchievementDataMode(goalId));

  if (surahId === "all") {
    return aggregateSlices(
      Object.values(monthlyData).map((slice) => scaleSlice(slice, period)),
    );
  }

  const surahSlice = monthlyData[surahId];
  if (!surahSlice) {
    return aggregateSlices(
      Object.values(monthlyData).map((slice) => scaleSlice(slice, period)),
    );
  }

  return scaleSlice(surahSlice, period);
}

export function getQuranRecitationPastAchievement(
  goalId: SurahRecitationGoalId,
  period: PastAchievementPeriod,
  surahId: SurahFilterId = "all",
): QuranHoursPastAchievement {
  return sliceToAchievement(getSliceForSurah(goalId, surahId, period));
}

export function getQuranRecitationPastAchievementSlice(
  goalId: SurahRecitationGoalId,
  period: PastAchievementPeriod,
  surahId: SurahFilterId = "all",
): SurahPeriodSlice {
  return getSliceForSurah(goalId, surahId, period);
}

export function applyRecitationAnalyticsView(
  achievement: QuranHoursPastAchievement,
  timeSpentByPeriod: number[],
  view: RecitationAnalyticsView,
): QuranHoursPastAchievement {
  switch (view) {
    case "completedVsIncomplete":
      return achievement;
    case "completedVsTimeSpent": {
      const chartData = achievement.chartData.map((item) => ({
        ...item,
        incompleteHours: 0,
        stackTotalHours: item.completedHours,
        hours: item.completedHours,
      }));
      return {
        ...achievement,
        chartData,
        ...computeYAxis(chartData),
      };
    }
  }
}

export function getTotalTimeSpentMinutes(timeSpentByPeriod: number[]): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatGoalRecitationsLabel(count: number): string {
  return String(Math.round(count));
}

export function formatRecitationTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}
