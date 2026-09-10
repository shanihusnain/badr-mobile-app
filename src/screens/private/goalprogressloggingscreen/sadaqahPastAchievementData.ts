import { GoalId } from "../home/components/goalsData";
import { formatTotalTime } from "../home/timeSpentData";
import type { QuranPastChartItem } from "./quranHoursPastAchievementData";

export type PastAchievementPeriod = "monthly" | "threeMonths" | "sixMonths";

export type SadaqahAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTimeSpent"
  | "completedByCategory";

export type SadaqahPastChartItem = QuranPastChartItem & {
  completedAmount: number;
  incompleteAmount: number;
  stackTotalAmount: number;
};

export type SadaqahPastAchievement = {
  dateRangeLabel: string;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  chartData: SadaqahPastChartItem[];
  goalAmount: number; // General term: could be $, hours, count
  periodGoalAmount: number;
  completedAmount: number;
  incompleteAmount: number;
  totalTimeSpentMinutes: number; // Mainly for Volunteering
  yMax: number;
  yTicks: number[];
  pageCount: number;
  activePageIndex: number;
};

function buildPeriodBar(
  xLabel: string,
  dateLabel: string,
  completedAmount: number,
  periodGoalAmount: number,
  timeSpentMinutes: number
): SadaqahPastChartItem {
  const incompleteAmount = Math.max(0, periodGoalAmount - completedAmount);
  const stackTotalAmount = completedAmount + incompleteAmount;

  return {
    xLabel,
    dateLabel,
    completedHours: completedAmount, // mapping to existing chart fields
    incompleteHours: incompleteAmount,
    hours: completedAmount,
    stackTotalHours: stackTotalAmount,
    // Store original exact values
    completedAmount,
    incompleteAmount,
    stackTotalAmount,
    timeSpentMinutes,
  } as any;
}

function buildPeriodChart(
  periods: Array<{ xLabel: string; dateLabel: string; completed: number; timeSpent: number }>,
  goalAmount: number
): SadaqahPastChartItem[] {
  const periodGoalAmount = goalAmount / periods.length;
  return periods.map((period) =>
    buildPeriodBar(
      period.xLabel,
      period.dateLabel,
      period.completed,
      periodGoalAmount,
      period.timeSpent
    )
  );
}

function computeYAxis(chartData: SadaqahPastChartItem[]) {
  const maxStack = Math.max(...chartData.map((item) => item.stackTotalAmount), 0);
  const yMax = Math.max(10, Math.ceil(maxStack / 5) * 5);
  const step = yMax <= 15 ? 5 : yMax <= 25 ? 5 : yMax <= 100 ? 25 : 50;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step
  );
  return { yMax, yTicks };
}

export function applySadaqahAnalyticsView(
  achievement: SadaqahPastAchievement,
  view: SadaqahAnalyticsView,
  isVolunteering: boolean
): SadaqahPastAchievement {
  if (view === "completedVsIncomplete" || view === "completedByCategory") {
    return achievement;
  }

  if (view === "completedVsTimeSpent") {
    const chartData = achievement.chartData.map((item: any) => {
      const timeSpentHours = (item.timeSpentMinutes ?? 0) / 60;
      if (isVolunteering) {
        return {
          ...item,
          completedHours: item.completedHours + timeSpentHours,
          incompleteHours: 0,
          stackTotalHours: item.completedHours + timeSpentHours,
          hours: item.completedHours,
        };
      } else {
        // Financial goals: show completed bars only, bar value label = time spent
        return {
          ...item,
          incompleteHours: 0,
          stackTotalHours: item.completedHours,
        };
      }
    });

    return {
      ...achievement,
      chartData,
      ...computeYAxis(chartData),
    };
  }

  return achievement;
}

export function formatSadaqahAmountLabel(amount: number, isVolunteering: boolean): string {
  if (isVolunteering) {
    return formatTotalTime(amount);
  }
  return `$${Math.round(amount)}`;
}

// ----------------------------------------------------
// Mock Data (Volunteering / Hours)
// ----------------------------------------------------
const VOL_MONTHLY_CHART = buildPeriodChart(
  [
    { xLabel: "w1", dateLabel: "Nov 1–7", completed: 5, timeSpent: 300 },
    { xLabel: "w2", dateLabel: "Nov 8–14", completed: 2, timeSpent: 120 },
    { xLabel: "w3", dateLabel: "Nov 15–21", completed: 2, timeSpent: 120 },
    { xLabel: "w4", dateLabel: "Nov 22–28", completed: 1, timeSpent: 60 },
  ],
  12 // 12 hours goal
);
const VOL_MONTHLY_Y = computeYAxis(VOL_MONTHLY_CHART);
const VOL_MONTHLY_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 73,
  previousPeriodDeltaPercent: 12,
  goalAmount: 12,
  periodGoalAmount: 12 / 4,
  completedAmount: 10,
  incompleteAmount: 2,
  totalTimeSpentMinutes: 600,
  yMax: VOL_MONTHLY_Y.yMax,
  yTicks: VOL_MONTHLY_Y.yTicks,
  pageCount: 4,
  activePageIndex: 1,
  chartData: VOL_MONTHLY_CHART,
};

const VOL_THREE_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Sept 6—Oct 3", completed: 10, timeSpent: 600 },
    { xLabel: "m2", dateLabel: "Oct 4—31", completed: 12, timeSpent: 720 },
    { xLabel: "m3", dateLabel: "Nov 1—28", completed: 10, timeSpent: 600 },
  ],
  36
);
const VOL_THREE_MONTHS_Y = computeYAxis(VOL_THREE_MONTHS_CHART);
const VOL_THREE_MONTHS_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 88,
  previousPeriodDeltaPercent: 5,
  goalAmount: 36,
  periodGoalAmount: 36 / 3,
  completedAmount: 32,
  incompleteAmount: 4,
  totalTimeSpentMinutes: 1920,
  pageCount: 3,
  activePageIndex: 2,
  chartData: VOL_THREE_MONTHS_CHART,
  ...VOL_THREE_MONTHS_Y,
};

const VOL_SIX_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Jun 14—Jul 11", completed: 8, timeSpent: 480 },
    { xLabel: "m2", dateLabel: "Jul 12—Aug 8", completed: 9, timeSpent: 540 },
    { xLabel: "m3", dateLabel: "Aug 9—Sep 5", completed: 11, timeSpent: 660 },
    { xLabel: "m4", dateLabel: "Sept 6—Oct 3", completed: 10, timeSpent: 600 },
    { xLabel: "m5", dateLabel: "Oct 4—31", completed: 12, timeSpent: 720 },
    { xLabel: "m6", dateLabel: "Nov 1—28", completed: 10, timeSpent: 600 },
  ],
  72
);
const VOL_SIX_MONTHS_Y = computeYAxis(VOL_SIX_MONTHS_CHART);
const VOL_SIX_MONTHS_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 83,
  previousPeriodDeltaPercent: 10,
  goalAmount: 72,
  periodGoalAmount: 72 / 6,
  completedAmount: 60,
  incompleteAmount: 12,
  totalTimeSpentMinutes: 3600,
  pageCount: 6,
  activePageIndex: 5,
  chartData: VOL_SIX_MONTHS_CHART,
  ...VOL_SIX_MONTHS_Y,
};

// ----------------------------------------------------
// Mock Data (Financial / Money)
// ----------------------------------------------------
const FIN_MONTHLY_CHART = buildPeriodChart(
  [
    { xLabel: "w1", dateLabel: "Nov 1–7", completed: 50, timeSpent: 0 },
    { xLabel: "w2", dateLabel: "Nov 8–14", completed: 25, timeSpent: 0 },
    { xLabel: "w3", dateLabel: "Nov 15–21", completed: 100, timeSpent: 0 },
    { xLabel: "w4", dateLabel: "Nov 22–28", completed: 25, timeSpent: 0 },
  ],
  250 // $250 goal
);
const FIN_MONTHLY_Y = computeYAxis(FIN_MONTHLY_CHART);
const FIN_MONTHLY_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 80,
  previousPeriodDeltaPercent: 15,
  goalAmount: 250,
  periodGoalAmount: 250 / 4,
  completedAmount: 200,
  incompleteAmount: 50,
  totalTimeSpentMinutes: 0,
  yMax: FIN_MONTHLY_Y.yMax,
  yTicks: FIN_MONTHLY_Y.yTicks,
  pageCount: 4,
  activePageIndex: 1,
  chartData: FIN_MONTHLY_CHART,
};

const FIN_THREE_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Sept 6—Oct 3", completed: 200, timeSpent: 0 },
    { xLabel: "m2", dateLabel: "Oct 4—31", completed: 250, timeSpent: 0 },
    { xLabel: "m3", dateLabel: "Nov 1—28", completed: 200, timeSpent: 0 },
  ],
  750
);
const FIN_THREE_MONTHS_Y = computeYAxis(FIN_THREE_MONTHS_CHART);
const FIN_THREE_MONTHS_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 86,
  previousPeriodDeltaPercent: 5,
  goalAmount: 750,
  periodGoalAmount: 750 / 3,
  completedAmount: 650,
  incompleteAmount: 100,
  totalTimeSpentMinutes: 0,
  pageCount: 3,
  activePageIndex: 2,
  chartData: FIN_THREE_MONTHS_CHART,
  ...FIN_THREE_MONTHS_Y,
};

const FIN_SIX_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Jun 14—Jul 11", completed: 150, timeSpent: 0 },
    { xLabel: "m2", dateLabel: "Jul 12—Aug 8", completed: 180, timeSpent: 0 },
    { xLabel: "m3", dateLabel: "Aug 9—Sep 5", completed: 200, timeSpent: 0 },
    { xLabel: "m4", dateLabel: "Sept 6—Oct 3", completed: 200, timeSpent: 0 },
    { xLabel: "m5", dateLabel: "Oct 4—31", completed: 250, timeSpent: 0 },
    { xLabel: "m6", dateLabel: "Nov 1—28", completed: 200, timeSpent: 0 },
  ],
  1500
);
const FIN_SIX_MONTHS_Y = computeYAxis(FIN_SIX_MONTHS_CHART);
const FIN_SIX_MONTHS_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 78,
  previousPeriodDeltaPercent: 12,
  goalAmount: 1500,
  periodGoalAmount: 1500 / 6,
  completedAmount: 1180,
  incompleteAmount: 320,
  totalTimeSpentMinutes: 0,
  pageCount: 6,
  activePageIndex: 5,
  chartData: FIN_SIX_MONTHS_CHART,
  ...FIN_SIX_MONTHS_Y,
};

// ----------------------------------------------------
// Mock Data (Fidya / Meals count)
// ----------------------------------------------------
const FIDYA_MONTHLY_CHART = buildPeriodChart(
  [
    { xLabel: "w1", dateLabel: "Nov 1–7",   completed: 5, timeSpent: 30 },
    { xLabel: "w2", dateLabel: "Nov 8–14",  completed: 2, timeSpent: 15 },
    { xLabel: "w3", dateLabel: "Nov 15–21", completed: 2, timeSpent: 15 },
    { xLabel: "w4", dateLabel: "Nov 22–28", completed: 1, timeSpent: 10 },
  ],
  12 // 12 meals goal
);
const FIDYA_MONTHLY_Y = computeYAxis(FIDYA_MONTHLY_CHART);
const FIDYA_MONTHLY_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 83,
  previousPeriodDeltaPercent: 0,   // 0% = "same amount"
  goalAmount: 12,
  periodGoalAmount: 12 / 4,
  completedAmount: 10,
  incompleteAmount: 2,
  totalTimeSpentMinutes: 75,       // 1h 15m
  pageCount: 4,
  activePageIndex: 1,
  chartData: FIDYA_MONTHLY_CHART,
  ...FIDYA_MONTHLY_Y,
};

const FIDYA_THREE_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Sept 6—Oct 3", completed: 10, timeSpent: 65 },
    { xLabel: "m2", dateLabel: "Oct 4—31",     completed: 12, timeSpent: 80 },
    { xLabel: "m3", dateLabel: "Nov 1—28",     completed: 10, timeSpent: 65 },
  ],
  36
);
const FIDYA_THREE_MONTHS_Y = computeYAxis(FIDYA_THREE_MONTHS_CHART);
const FIDYA_THREE_MONTHS_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 88,
  previousPeriodDeltaPercent: -5,
  goalAmount: 36,
  periodGoalAmount: 36 / 3,
  completedAmount: 32,
  incompleteAmount: 4,
  totalTimeSpentMinutes: 210,
  pageCount: 3,
  activePageIndex: 2,
  chartData: FIDYA_THREE_MONTHS_CHART,
  ...FIDYA_THREE_MONTHS_Y,
};

const FIDYA_SIX_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Jun 14—Jul 11", completed: 8,  timeSpent: 50 },
    { xLabel: "m2", dateLabel: "Jul 12—Aug 8",  completed: 9,  timeSpent: 55 },
    { xLabel: "m3", dateLabel: "Aug 9—Sep 5",   completed: 11, timeSpent: 70 },
    { xLabel: "m4", dateLabel: "Sept 6—Oct 3",  completed: 10, timeSpent: 65 },
    { xLabel: "m5", dateLabel: "Oct 4—31",      completed: 12, timeSpent: 80 },
    { xLabel: "m6", dateLabel: "Nov 1—28",      completed: 10, timeSpent: 65 },
  ],
  72
);
const FIDYA_SIX_MONTHS_Y = computeYAxis(FIDYA_SIX_MONTHS_CHART);
const FIDYA_SIX_MONTHS_ACHIEVEMENT: SadaqahPastAchievement = {
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 83,
  previousPeriodDeltaPercent: 8,
  goalAmount: 72,
  periodGoalAmount: 72 / 6,
  completedAmount: 60,
  incompleteAmount: 12,
  totalTimeSpentMinutes: 385,
  pageCount: 6,
  activePageIndex: 5,
  chartData: FIDYA_SIX_MONTHS_CHART,
  ...FIDYA_SIX_MONTHS_Y,
};

// ────────────────────────────────────────────────────────
// Mock Data (Kaffarah / Meals + Clothing Items sub-types)
// ────────────────────────────────────────────────────────

// ── Monthly ──
const KAFFARAH_ALL_MONTHLY_CHART = buildPeriodChart([
  { xLabel: "w1", dateLabel: "Nov 1–7",   completed: 2, timeSpent: 20 },
  { xLabel: "w2", dateLabel: "Nov 8–14",  completed: 0, timeSpent: 0  },
  { xLabel: "w3", dateLabel: "Nov 15–21", completed: 2, timeSpent: 5  },
  { xLabel: "w4", dateLabel: "Nov 22–28", completed: 1, timeSpent: 5  },
], 7);
const KAFFARAH_ALL_MONTHLY: SadaqahPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 71,
  previousPeriodDeltaPercent: 114,
  goalAmount: 7,
  periodGoalAmount: 7 / 4,
  completedAmount: 5,
  incompleteAmount: 2,
  totalTimeSpentMinutes: 30,
  pageCount: 4,
  activePageIndex: 1,
  chartData: KAFFARAH_ALL_MONTHLY_CHART,
  ...computeYAxis(KAFFARAH_ALL_MONTHLY_CHART),
};

const KAFFARAH_MEALS_MONTHLY_CHART = buildPeriodChart([
  { xLabel: "w1", dateLabel: "Nov 1–7",   completed: 2, timeSpent: 15 },
  { xLabel: "w2", dateLabel: "Nov 8–14",  completed: 0, timeSpent: 0  },
  { xLabel: "w3", dateLabel: "Nov 15–21", completed: 0, timeSpent: 0  },
  { xLabel: "w4", dateLabel: "Nov 22–28", completed: 1, timeSpent: 5  },
], 5);
const KAFFARAH_MEALS_MONTHLY: SadaqahPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 60,
  previousPeriodDeltaPercent: -40,
  goalAmount: 5,
  periodGoalAmount: 5 / 4,
  completedAmount: 3,
  incompleteAmount: 2,
  totalTimeSpentMinutes: 20,
  pageCount: 4,
  activePageIndex: 1,
  chartData: KAFFARAH_MEALS_MONTHLY_CHART,
  ...computeYAxis(KAFFARAH_MEALS_MONTHLY_CHART),
};

const KAFFARAH_CLOTHING_MONTHLY_CHART = buildPeriodChart([
  { xLabel: "w1", dateLabel: "Nov 1–7",   completed: 0, timeSpent: 5  },
  { xLabel: "w2", dateLabel: "Nov 8–14",  completed: 0, timeSpent: 0  },
  { xLabel: "w3", dateLabel: "Nov 15–21", completed: 1, timeSpent: 0  },
  { xLabel: "w4", dateLabel: "Nov 22–28", completed: 1, timeSpent: 5  },
], 2);
const KAFFARAH_CLOTHING_MONTHLY: SadaqahPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 100,
  previousPeriodDeltaPercent: 100,
  goalAmount: 2,
  periodGoalAmount: 2 / 4,
  completedAmount: 2,
  incompleteAmount: 0,
  totalTimeSpentMinutes: 10,
  pageCount: 4,
  activePageIndex: 3,
  chartData: KAFFARAH_CLOTHING_MONTHLY_CHART,
  ...computeYAxis(KAFFARAH_CLOTHING_MONTHLY_CHART),
};

// ── 3 Months ──
const KAFFARAH_ALL_3M_CHART = buildPeriodChart([
  { xLabel: "m1", dateLabel: "Sept 6—Oct 3", completed: 6, timeSpent: 25 },
  { xLabel: "m2", dateLabel: "Oct 4—31",     completed: 8, timeSpent: 35 },
  { xLabel: "m3", dateLabel: "Nov 1—28",     completed: 5, timeSpent: 30 },
], 21);
const KAFFARAH_ALL_3M: SadaqahPastAchievement = {
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 90,
  previousPeriodDeltaPercent: 20,
  goalAmount: 21,
  periodGoalAmount: 21 / 3,
  completedAmount: 19,
  incompleteAmount: 2,
  totalTimeSpentMinutes: 90,
  pageCount: 3,
  activePageIndex: 2,
  chartData: KAFFARAH_ALL_3M_CHART,
  ...computeYAxis(KAFFARAH_ALL_3M_CHART),
};

const KAFFARAH_MEALS_3M_CHART = buildPeriodChart([
  { xLabel: "m1", dateLabel: "Sept 6—Oct 3", completed: 4, timeSpent: 15 },
  { xLabel: "m2", dateLabel: "Oct 4—31",     completed: 5, timeSpent: 20 },
  { xLabel: "m3", dateLabel: "Nov 1—28",     completed: 3, timeSpent: 15 },
], 15);
const KAFFARAH_MEALS_3M: SadaqahPastAchievement = {
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 80,
  previousPeriodDeltaPercent: -15,
  goalAmount: 15,
  periodGoalAmount: 15 / 3,
  completedAmount: 12,
  incompleteAmount: 3,
  totalTimeSpentMinutes: 50,
  pageCount: 3,
  activePageIndex: 2,
  chartData: KAFFARAH_MEALS_3M_CHART,
  ...computeYAxis(KAFFARAH_MEALS_3M_CHART),
};

const KAFFARAH_CLOTHING_3M_CHART = buildPeriodChart([
  { xLabel: "m1", dateLabel: "Sept 6—Oct 3", completed: 2, timeSpent: 10 },
  { xLabel: "m2", dateLabel: "Oct 4—31",     completed: 3, timeSpent: 15 },
  { xLabel: "m3", dateLabel: "Nov 1—28",     completed: 2, timeSpent: 15 },
], 6);
const KAFFARAH_CLOTHING_3M: SadaqahPastAchievement = {
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 100,
  previousPeriodDeltaPercent: 50,
  goalAmount: 6,
  periodGoalAmount: 6 / 3,
  completedAmount: 6,
  incompleteAmount: 0,
  totalTimeSpentMinutes: 40,
  pageCount: 3,
  activePageIndex: 2,
  chartData: KAFFARAH_CLOTHING_3M_CHART,
  ...computeYAxis(KAFFARAH_CLOTHING_3M_CHART),
};

// ── 6 Months ──
const KAFFARAH_ALL_6M_CHART = buildPeriodChart([
  { xLabel: "m1", dateLabel: "Jun 14—Jul 11", completed: 5,  timeSpent: 20 },
  { xLabel: "m2", dateLabel: "Jul 12—Aug 8",  completed: 6,  timeSpent: 25 },
  { xLabel: "m3", dateLabel: "Aug 9—Sep 5",   completed: 7,  timeSpent: 30 },
  { xLabel: "m4", dateLabel: "Sept 6—Oct 3",  completed: 6,  timeSpent: 25 },
  { xLabel: "m5", dateLabel: "Oct 4—31",      completed: 8,  timeSpent: 35 },
  { xLabel: "m6", dateLabel: "Nov 1—28",      completed: 5,  timeSpent: 30 },
], 42);
const KAFFARAH_ALL_6M: SadaqahPastAchievement = {
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 88,
  previousPeriodDeltaPercent: 30,
  goalAmount: 42,
  periodGoalAmount: 42 / 6,
  completedAmount: 37,
  incompleteAmount: 5,
  totalTimeSpentMinutes: 165,
  pageCount: 6,
  activePageIndex: 5,
  chartData: KAFFARAH_ALL_6M_CHART,
  ...computeYAxis(KAFFARAH_ALL_6M_CHART),
};

const KAFFARAH_MEALS_6M_CHART = buildPeriodChart([
  { xLabel: "m1", dateLabel: "Jun 14—Jul 11", completed: 3, timeSpent: 12 },
  { xLabel: "m2", dateLabel: "Jul 12—Aug 8",  completed: 4, timeSpent: 15 },
  { xLabel: "m3", dateLabel: "Aug 9—Sep 5",   completed: 5, timeSpent: 20 },
  { xLabel: "m4", dateLabel: "Sept 6—Oct 3",  completed: 4, timeSpent: 15 },
  { xLabel: "m5", dateLabel: "Oct 4—31",      completed: 5, timeSpent: 20 },
  { xLabel: "m6", dateLabel: "Nov 1—28",      completed: 3, timeSpent: 12 },
], 30);
const KAFFARAH_MEALS_6M: SadaqahPastAchievement = {
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 80,
  previousPeriodDeltaPercent: -10,
  goalAmount: 30,
  periodGoalAmount: 30 / 6,
  completedAmount: 24,
  incompleteAmount: 6,
  totalTimeSpentMinutes: 94,
  pageCount: 6,
  activePageIndex: 5,
  chartData: KAFFARAH_MEALS_6M_CHART,
  ...computeYAxis(KAFFARAH_MEALS_6M_CHART),
};

const KAFFARAH_CLOTHING_6M_CHART = buildPeriodChart([
  { xLabel: "m1", dateLabel: "Jun 14—Jul 11", completed: 2, timeSpent: 8  },
  { xLabel: "m2", dateLabel: "Jul 12—Aug 8",  completed: 2, timeSpent: 10 },
  { xLabel: "m3", dateLabel: "Aug 9—Sep 5",   completed: 2, timeSpent: 10 },
  { xLabel: "m4", dateLabel: "Sept 6—Oct 3",  completed: 2, timeSpent: 10 },
  { xLabel: "m5", dateLabel: "Oct 4—31",      completed: 3, timeSpent: 15 },
  { xLabel: "m6", dateLabel: "Nov 1—28",      completed: 2, timeSpent: 10 },
], 12);
const KAFFARAH_CLOTHING_6M: SadaqahPastAchievement = {
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 100,
  previousPeriodDeltaPercent: 20,
  goalAmount: 12,
  periodGoalAmount: 12 / 6,
  completedAmount: 12,
  incompleteAmount: 0,
  totalTimeSpentMinutes: 63,
  pageCount: 6,
  activePageIndex: 5,
  chartData: KAFFARAH_CLOTHING_6M_CHART,
  ...computeYAxis(KAFFARAH_CLOTHING_6M_CHART),
};


export function getSadaqahPastAchievement(
  goalId: GoalId,
  period: PastAchievementPeriod,
  isVolunteering: boolean,
  kaffarahSubType?: string
): SadaqahPastAchievement {
  if (isVolunteering) {
    if (period === "monthly") return VOL_MONTHLY_ACHIEVEMENT;
    if (period === "threeMonths") return VOL_THREE_MONTHS_ACHIEVEMENT;
    return VOL_SIX_MONTHS_ACHIEVEMENT;
  }
  if (goalId === "sadaqah-fidya") {
    if (period === "monthly") return FIDYA_MONTHLY_ACHIEVEMENT;
    if (period === "threeMonths") return FIDYA_THREE_MONTHS_ACHIEVEMENT;
    return FIDYA_SIX_MONTHS_ACHIEVEMENT;
  }
  if (goalId === "sadaqah-kafarah") {
    const sub = kaffarahSubType || "All";
    if (sub === "Meals") {
      if (period === "monthly") return KAFFARAH_MEALS_MONTHLY;
      if (period === "threeMonths") return KAFFARAH_MEALS_3M;
      return KAFFARAH_MEALS_6M;
    }
    if (sub === "Clothing Items") {
      if (period === "monthly") return KAFFARAH_CLOTHING_MONTHLY;
      if (period === "threeMonths") return KAFFARAH_CLOTHING_3M;
      return KAFFARAH_CLOTHING_6M;
    }
    // All
    if (period === "monthly") return KAFFARAH_ALL_MONTHLY;
    if (period === "threeMonths") return KAFFARAH_ALL_3M;
    return KAFFARAH_ALL_6M;
  }
  // All other financial goals
  if (period === "monthly") return FIN_MONTHLY_ACHIEVEMENT;
  if (period === "threeMonths") return FIN_THREE_MONTHS_ACHIEVEMENT;
  return FIN_SIX_MONTHS_ACHIEVEMENT;
}
