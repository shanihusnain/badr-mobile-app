import { getSurahVerseCount } from "./quranSurahVerseMap";
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
  const maxStack = Math.max(
    ...chartData.map((item) => item.stackTotalHours),
    0,
  );
  const yMax = Math.max(15, Math.ceil(maxStack / 5) * 5);
  const step = yMax <= 15 ? 5 : yMax <= 25 ? 5 : 10;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

function sliceToAchievement(
  slice: SurahPeriodSlice,
): QuranHoursPastAchievement {
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
      dateLabel:
        CYCLE_WEEK_LABELS[index]?.dateLabel ?? `Week ${week.weekNumber}`,
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
      {
        ...CYCLE_WEEK_LABELS[0],
        completed: 10,
        incomplete: 0,
        timeSpentMinutes: 180,
      },
      {
        ...CYCLE_WEEK_LABELS[1],
        completed: 12,
        incomplete: 0,
        timeSpentMinutes: 210,
      },
      {
        ...CYCLE_WEEK_LABELS[2],
        completed: 14,
        incomplete: 0,
        timeSpentMinutes: 240,
      },
      {
        ...CYCLE_WEEK_LABELS[3],
        completed: 8,
        incomplete: 0,
        timeSpentMinutes: 150,
      },
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
      {
        ...CYCLE_WEEK_LABELS[0],
        completed: 6,
        incomplete: 4,
        timeSpentMinutes: 120,
      },
      {
        ...CYCLE_WEEK_LABELS[1],
        completed: 8,
        incomplete: 2,
        timeSpentMinutes: 140,
      },
      {
        ...CYCLE_WEEK_LABELS[2],
        completed: 5,
        incomplete: 5,
        timeSpentMinutes: 95,
      },
      {
        ...CYCLE_WEEK_LABELS[3],
        completed: 9,
        incomplete: 1,
        timeSpentMinutes: 160,
      },
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
      {
        ...CYCLE_WEEK_LABELS[0],
        completed: 4,
        incomplete: 6,
        timeSpentMinutes: 70,
      },
      {
        ...CYCLE_WEEK_LABELS[1],
        completed: 6,
        incomplete: 4,
        timeSpentMinutes: 90,
      },
      {
        ...CYCLE_WEEK_LABELS[2],
        completed: 7,
        incomplete: 3,
        timeSpentMinutes: 105,
      },
      {
        ...CYCLE_WEEK_LABELS[3],
        completed: 5,
        incomplete: 5,
        timeSpentMinutes: 80,
      },
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
      {
        ...CYCLE_WEEK_LABELS[0],
        completed: 8,
        incomplete: 2,
        timeSpentMinutes: 110,
      },
      {
        ...CYCLE_WEEK_LABELS[1],
        completed: 7,
        incomplete: 3,
        timeSpentMinutes: 100,
      },
      {
        ...CYCLE_WEEK_LABELS[2],
        completed: 9,
        incomplete: 1,
        timeSpentMinutes: 130,
      },
      {
        ...CYCLE_WEEK_LABELS[3],
        completed: 6,
        incomplete: 4,
        timeSpentMinutes: 85,
      },
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
      {
        ...CYCLE_WEEK_LABELS[0],
        completed: 12,
        incomplete: 0,
        timeSpentMinutes: 200,
      },
      {
        ...CYCLE_WEEK_LABELS[1],
        completed: 11,
        incomplete: 1,
        timeSpentMinutes: 185,
      },
      {
        ...CYCLE_WEEK_LABELS[2],
        completed: 10,
        incomplete: 2,
        timeSpentMinutes: 170,
      },
      {
        ...CYCLE_WEEK_LABELS[3],
        completed: 13,
        incomplete: 0,
        timeSpentMinutes: 220,
      },
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
  "surah-yusuf": {
    chartPeriods: [
      {
        ...CYCLE_WEEK_LABELS[0],
        completed: 7,
        incomplete: 3,
        timeSpentMinutes: 120,
      },
      {
        ...CYCLE_WEEK_LABELS[1],
        completed: 8,
        incomplete: 2,
        timeSpentMinutes: 135,
      },
      {
        ...CYCLE_WEEK_LABELS[2],
        completed: 6,
        incomplete: 4,
        timeSpentMinutes: 100,
      },
      {
        ...CYCLE_WEEK_LABELS[3],
        completed: 9,
        incomplete: 1,
        timeSpentMinutes: 145,
      },
    ],
    goalTotal: 40,
    achievementPercent: 75,
    previousPeriodDeltaPercent: 12,
    activeDays: 22,
    activeDaysPrevious: 18,
    longestStreak: 4,
    longestStreakPrevious: 3,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 2,
  },
};

const SIX_MONTH_LABELS = [
  { xLabel: "m1", dateLabel: "Jun 14" },
  { xLabel: "m2", dateLabel: "Jul 12" },
  { xLabel: "m3", dateLabel: "Aug 9" },
  { xLabel: "m4", dateLabel: "Sep 6" },
  { xLabel: "m5", dateLabel: "Oct 3" },
  { xLabel: "m6", dateLabel: "Nov 1" },
];

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
    dateRangeLabel: "Jun 14 — Nov 28, 24",
    goalTotal: Math.round(slice.goalTotal * 4.5),
    pageCount: 6,
    activePageIndex: 5,
    chartPeriods: SIX_MONTH_LABELS.map((month, index) => ({
      xLabel: month.xLabel,
      dateLabel: month.dateLabel,
      completed: Math.max(
        0,
        Math.round(
          slice.chartPeriods[index % 4].completed * (1.1 + index * 0.05),
        ),
      ),
      incomplete: Math.max(
        0,
        Math.round(
          slice.chartPeriods[index % 4].incomplete * (1.1 + index * 0.05),
        ),
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
  return mode === "weekly"
    ? WEEKLY_SURAH_MONTHLY_DATA
    : SURAH_DAILY_MONTHLY_DATA;
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
    const template = scaleSlice(Object.values(monthlyData)[0], period);
    return zeroOutPeriodSlice(template);
  }

  return scaleSlice(surahSlice, period);
}

export function zeroOutPeriodSlice(slice: SurahPeriodSlice): SurahPeriodSlice {
  return {
    ...slice,
    goalTotal: 0,
    achievementPercent: 0,
    previousPeriodDeltaPercent: 0,
    activeDays: 0,
    activeDaysPrevious: 0,
    longestStreak: 0,
    longestStreakPrevious: 0,
    chartPeriods: slice.chartPeriods.map((period) => ({
      ...period,
      completed: 0,
      incomplete: 0,
      timeSpentMinutes: 0,
    })),
  };
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
      const chartData = achievement.chartData.map((item, index) => {
        const timeSpentHours = (timeSpentByPeriod[index] ?? 0) / 60;
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
  }
}

export function applyTimeSpentOnlyGreenChart(
  achievement: QuranHoursPastAchievement,
  timeSpentByPeriod: number[],
): QuranHoursPastAchievement {
  const chartData = achievement.chartData.map((item, index) => {
    const hours = (timeSpentByPeriod[index] ?? 0) / 60;
    return {
      ...item,
      completedHours: hours,
      incompleteHours: 0,
      stackTotalHours: Math.max(hours, 0.01),
      hours,
    };
  });

  return {
    ...achievement,
    chartData,
    ...computeYAxis(chartData),
  };
}

export function applyMonthlyCompletedOnlyChart(
  achievement: QuranHoursPastAchievement,
): QuranHoursPastAchievement {
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

export function hasRecitationPastAchievementLogs(
  slice: SurahPeriodSlice,
): boolean {
  return slice.chartPeriods.some(
    (period) => period.completed > 0 || period.timeSpentMinutes > 0,
  );
}

function formatSurahFilterName(surahId: string, surahName: string): string {
  if (surahName && surahName !== "All") {
    return surahName;
  }

  return surahId
    .replace(/^surah-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

export function getRecitationSurahContextLabel(
  goalId: SurahRecitationGoalId,
  surahId: SurahFilterId,
): string {
  const filters = getPastAchievementSurahFilters(goalId).filter(
    (filter) => filter.id !== "all",
  );

  if (surahId !== "all") {
    const selected = filters.find((filter) => filter.id === surahId);
    const name = formatSurahFilterName(
      surahId,
      selected?.surahName ?? String(surahId),
    );
    return `Surah ${name}`;
  }

  if (filters.length === 0) {
    return "";
  }

  return `Surah ${filters.map((filter) => formatSurahFilterName(filter.id, filter.surahName)).join(" / ")}`;
}

export function getRecitationGoalAyahCount(
  goalId: SurahRecitationGoalId,
  surahId: SurahFilterId,
): number {
  if (surahId !== "all") {
    return getSurahVerseCount(surahId);
  }

  return getPastAchievementSurahFilters(goalId)
    .filter((filter) => filter.id !== "all")
    .reduce((sum, filter) => sum + getSurahVerseCount(filter.id), 0);
}

export function getRecitationGoalAyahLabel(
  goalId: SurahRecitationGoalId,
  surahId: SurahFilterId,
): { ayahCount: number; surahName?: string } {
  const ayahCount = getRecitationGoalAyahCount(goalId, surahId);

  if (surahId === "all") {
    return { ayahCount };
  }

  const selected = getPastAchievementSurahFilters(goalId).find(
    (filter) => filter.id === surahId,
  );

  return {
    ayahCount,
    surahName: formatSurahFilterName(
      surahId,
      selected?.surahName ?? String(surahId),
    ),
  };
}

export function getTotalTimeSpentMinutes(timeSpentByPeriod: number[]): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatGoalRecitationsLabel(count: number): string {
  return String(Math.round(count));
}

export function formatRecitationTimeSpentLabel(totalMinutes: number): string {
  return formatRecitationDetailedTimeSpent(totalMinutes);
}

export function formatRecitationDetailedTimeSpent(
  totalMinutes: number,
): string {
  const roundedMinutes = Math.max(0, Math.round(totalMinutes));

  if (roundedMinutes < 60) {
    return `${roundedMinutes}m`;
  }

  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/** HH:MM chip format used above the progress bar in time-spent view. */
export function formatRecitationTimeSpentChip(totalMinutes: number): string {
  const roundedMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

const WEEK_DAY_LABELS = [
  { xLabel: "mon", dateLabel: "Mon" },
  { xLabel: "tue", dateLabel: "Tue" },
  { xLabel: "wed", dateLabel: "Wed" },
  { xLabel: "thu", dateLabel: "Thu" },
  { xLabel: "fri", dateLabel: "Fri" },
  { xLabel: "sat", dateLabel: "Sat" },
  { xLabel: "sun", dateLabel: "Sun" },
];

function distributeAcrossDays(total: number, days: number): number[] {
  if (days <= 0) {
    return [];
  }

  const safeTotal = Math.max(0, Math.round(total));
  const base = Math.floor(safeTotal / days);
  const remainder = safeTotal % days;

  return Array.from(
    { length: days },
    (_, index) => base + (index < remainder ? 1 : 0),
  );
}

export type RecitationSurahBreakdownRow = {
  surahId: string;
  surahName: string;
  frequency: "daily" | "weekly";
  quantity: number;
  completed: number;
  target: number;
  longestStreak: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
};

const SURAH_BREAKDOWN_META: Record<
  string,
  { frequency: "daily" | "weekly"; quantity: number }
> = {
  "surah-al-baqarah": { frequency: "daily", quantity: 2 },
  "surah-al-imran": { frequency: "daily", quantity: 1 },
  "surah-al-mulk": { frequency: "daily", quantity: 2 },
  "surah-ya-sin": { frequency: "weekly", quantity: 3 },
  "surah-al-kahf": { frequency: "daily", quantity: 1 },
  "surah-ar-rahman": { frequency: "weekly", quantity: 2 },
  "surah-yusuf": { frequency: "weekly", quantity: 2 },
};

export function getRecitationWeekDrillDownSlice(
  goalId: SurahRecitationGoalId,
  surahId: SurahFilterId,
  period: PastAchievementPeriod,
  weekIndex: number,
): SurahPeriodSlice | null {
  if (period !== "monthly") {
    return null;
  }

  const parentSlice = getSliceForSurah(goalId, surahId, period);
  const weekPeriod = parentSlice.chartPeriods[weekIndex];

  if (!weekPeriod) {
    return null;
  }

  const weeklyGoal = Math.round(
    parentSlice.goalTotal / Math.max(parentSlice.chartPeriods.length, 1),
  );
  const completedDays = distributeAcrossDays(weekPeriod.completed, 7);
  const incompleteDays = distributeAcrossDays(weekPeriod.incomplete, 7);
  const timeDays = distributeAcrossDays(weekPeriod.timeSpentMinutes, 7);

  return {
    ...parentSlice,
    goalTotal: weeklyGoal,
    achievementPercent: Math.min(
      100,
      Math.round((weekPeriod.completed / Math.max(weeklyGoal, 1)) * 100),
    ),
    chartPeriods: WEEK_DAY_LABELS.map((day, index) => ({
      xLabel: day.xLabel,
      dateLabel: day.dateLabel,
      completed: completedDays[index] ?? 0,
      incomplete: incompleteDays[index] ?? 0,
      timeSpentMinutes: timeDays[index] ?? 0,
    })),
    pageCount: 1,
    activePageIndex: 0,
  };
}

export function achievementFromPeriodSlice(
  slice: SurahPeriodSlice,
): QuranHoursPastAchievement {
  return sliceToAchievement(slice);
}

export function getRecitationSurahBreakdownRows(
  goalId: SurahRecitationGoalId,
  period: PastAchievementPeriod,
  selectedBarIndex: number | null = null,
): RecitationSurahBreakdownRow[] {
  const filters = getPastAchievementSurahFilters(goalId).filter(
    (filter) => filter.id !== "all",
  );

  return filters.map((filter) => {
    const slice = getSliceForSurah(goalId, filter.id, period);
    const completed = slice.chartPeriods.reduce(
      (sum, chartPeriod) => sum + chartPeriod.completed,
      0,
    );
    const timeSpentMinutes =
      selectedBarIndex !== null
        ? (slice.chartPeriods[selectedBarIndex]?.timeSpentMinutes ?? 0)
        : slice.chartPeriods.reduce(
            (sum, chartPeriod) => sum + chartPeriod.timeSpentMinutes,
            0,
          );
    const meta = SURAH_BREAKDOWN_META[filter.id] ?? {
      frequency: getPastAchievementDataMode(goalId),
      quantity: 1,
    };

    return {
      surahId: filter.id,
      surahName: filter.surahName,
      frequency: meta.frequency,
      quantity: meta.quantity,
      completed,
      target: slice.goalTotal,
      longestStreak: slice.longestStreak,
      isCompleted: completed >= slice.goalTotal,
      timeSpentMinutes,
    };
  });
}

export function getRecitationWeeklyAverage(
  goalId: SurahRecitationGoalId,
  period: PastAchievementPeriod,
  surahId: SurahFilterId = "all",
): number {
  const slice = getSliceForSurah(goalId, surahId, period);
  const completed = slice.chartPeriods.reduce(
    (sum, chartPeriod) => sum + chartPeriod.completed,
    0,
  );

  if (period === "monthly") {
    return Math.round(completed / Math.max(slice.chartPeriods.length, 1));
  }

  return Math.round(completed / Math.max(slice.chartPeriods.length, 1));
}

export function getRecitationGoalTrackedMonths(
  period: PastAchievementPeriod,
): number {
  switch (period) {
    case "monthly":
      return 1;
    case "threeMonths":
      return 3;
    case "sixMonths":
      return 6;
  }
}

export function getRecitationSurahGoalTrackedMonths(
  slice: SurahPeriodSlice,
): number {
  return slice.chartPeriods.filter(
    (period) => period.completed > 0 || period.incomplete > 0,
  ).length;
}

export type SurahProgressSegmentStatus = "completed" | "incomplete" | "pending";

export type SurahProgressSegment = {
  status: SurahProgressSegmentStatus;
  /** Relative width; defaults to 1 (equal segments). */
  flex?: number;
};

export function getRecitationSurahProgressSegments(
  slice: SurahPeriodSlice,
): SurahProgressSegment[] {
  const periodGoal = slice.goalTotal / Math.max(slice.chartPeriods.length, 1);

  return slice.chartPeriods.map((period) => {
    const metGoal = periodGoal > 0 && period.completed >= periodGoal;
    const hasMissed = period.incomplete > 0;
    const hasCompleted = period.completed > 0;

    if (hasCompleted && metGoal && !hasMissed) {
      return { status: "completed" as const };
    }

    if (hasMissed || (hasCompleted && !metGoal)) {
      return { status: "incomplete" as const };
    }

    return { status: "pending" as const };
  });
}

export function getRecitationGoalSummarySegments(
  completed: number,
  incomplete: number,
  goalTotal: number,
): SurahProgressSegment[] {
  const pending = Math.max(0, goalTotal - completed - incomplete);
  const segments: SurahProgressSegment[] = [];

  if (completed > 0) {
    segments.push({ status: "completed", flex: completed });
  }
  if (incomplete > 0) {
    segments.push({ status: "incomplete", flex: incomplete });
  }
  if (pending > 0) {
    segments.push({ status: "pending", flex: pending });
  }
  if (segments.length === 0) {
    segments.push({ status: "pending", flex: 1 });
  }

  return segments;
}

export function getRecitationSurahDetailRow(
  goalId: SurahRecitationGoalId,
  period: PastAchievementPeriod,
  surahId: SurahFilterId,
): RecitationSurahBreakdownRow | null {
  if (surahId === "all") {
    return null;
  }

  const slice = getSliceForSurah(goalId, surahId, period);
  const completed = slice.chartPeriods.reduce(
    (sum, chartPeriod) => sum + chartPeriod.completed,
    0,
  );
  const timeSpentMinutes = slice.chartPeriods.reduce(
    (sum, chartPeriod) => sum + chartPeriod.timeSpentMinutes,
    0,
  );
  const meta = SURAH_BREAKDOWN_META[surahId] ?? {
    frequency: getPastAchievementDataMode(goalId),
    quantity: 1,
  };
  const filter = getPastAchievementSurahFilters(goalId).find(
    (item) => item.id === surahId,
  );

  return {
    surahId,
    surahName: formatSurahFilterName(
      surahId,
      filter?.surahName ?? String(surahId),
    ),
    frequency: meta.frequency,
    quantity: meta.quantity,
    completed,
    target: slice.goalTotal,
    longestStreak: slice.longestStreak,
    isCompleted: completed >= slice.goalTotal && slice.goalTotal > 0,
    timeSpentMinutes,
  };
}
