import { GoalId } from "../home/components/goalsData";
import { formatTotalTime } from "../home/timeSpentData";
import type { QuranPastChartItem } from "./quranHoursPastAchievementData";

export type PastAchievementPeriod = "monthly" | "threeMonths" | "sixMonths";

export type PrayerAnalyticsView = "completedVsIncomplete" | "completedVsTimeSpent" | "inMosqueVsOutOfMosque" | "completedByCategory";

export type PrayerPastChartItem = QuranPastChartItem & {
  completedDeltaPct?: number | null;
  /** Per-bucket copy from achievements API (five-daily). */
  bucketSummaryText?: string | null;
  /** Qiyam: nights count for line overlay and category stats. */
  nights?: number;
  lineValue?: number;
};

export type PrayerPastAchievement = {
  dateRangeLabel: string;
  achievementPercent: number;
  previousPeriodDeltaPercent: number | null;
  chartData: PrayerPastChartItem[];
  goalPrayers: number;
  periodGoalPrayers: number;
  completedPrayers: number;
  incompletePrayers: number;
  totalTimeSpentMinutes: number;
  /** Period-level summary from achievements API when present. */
  summaryText?: string | null;
  yMax: number;
  yTicks: number[];
  pageCount: number;
  activePageIndex: number;
};

function buildPeriodBar(
  xLabel: string,
  dateLabel: string,
  completedPrayers: number,
  periodGoalPrayers: number,
  timeSpentMinutes: number
): PrayerPastChartItem {
  const incompletePrayers = Math.max(0, periodGoalPrayers - completedPrayers);
  const stackTotalPrayers = completedPrayers + incompletePrayers;

  return {
    xLabel,
    dateLabel,
    completedHours: completedPrayers, // mapped for chart compatibility
    incompleteHours: incompletePrayers,
    hours: completedPrayers, // The value displayed on the bar
    stackTotalHours: stackTotalPrayers,
    // Store original prayer counts + time spent on the item for the view toggle
    completedPrayers,
    incompletePrayers,
    timeSpentMinutes,
    stackTotalPrayers,
  } as any; // Using any because we injected extra fields not in QuranPastChartItem
}

function buildPeriodChart(
  periods: Array<{ xLabel: string; dateLabel: string; completed: number; timeSpent: number }>,
  goalPrayers: number
): PrayerPastChartItem[] {
  const periodGoalPrayers = goalPrayers / periods.length;
  return periods.map((period) =>
    buildPeriodBar(
      period.xLabel,
      period.dateLabel,
      period.completed,
      periodGoalPrayers,
      period.timeSpent
    )
  );
}

function computeYAxis(chartData: PrayerPastChartItem[]) {
  const maxStack = Math.max(...chartData.map((item) => item.stackTotalHours), 0);
  const yMax = Math.max(10, Math.ceil(maxStack / 5) * 5);
  const step = yMax <= 15 ? 5 : yMax <= 25 ? 5 : 10;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step
  );
  return { yMax, yTicks };
}

export function applyPrayerAnalyticsView(
  achievement: PrayerPastAchievement,
  view: PrayerAnalyticsView
): PrayerPastAchievement {
  if (view === "completedVsIncomplete" || view === "inMosqueVsOutOfMosque" || view === "completedByCategory") {
    return achievement;
  }

  // When time spent view is active, the "incomplete" part of the bar represents time spent
  // and we scale the Y axis appropriately for minutes/hours.
  const chartData = achievement.chartData.map((item: any) => {
    const timeSpentHours = (item.timeSpentMinutes ?? 0) / 60;
    return {
      ...item,
      completedHours: item.completedHours + timeSpentHours,
      incompleteHours: 0,
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

export function formatPrayerCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatPrayerTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

const MONTHLY_CHART = buildPeriodChart(
  [
    { xLabel: "w1", dateLabel: "Nov 1–7", completed: 6, timeSpent: 30 },
    { xLabel: "w2", dateLabel: "Nov 8–14", completed: 4, timeSpent: 20 },
    { xLabel: "w3", dateLabel: "Nov 15–21", completed: 6, timeSpent: 30 },
    { xLabel: "w4", dateLabel: "Nov 22–28", completed: 2, timeSpent: 10 },
  ],
  22
);

const MONTHLY_Y = computeYAxis(MONTHLY_CHART);

const MONTHLY_ACHIEVEMENT: PrayerPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 82,
  previousPeriodDeltaPercent: -19,
  goalPrayers: 22,
  periodGoalPrayers: 22 / 4,
  completedPrayers: 18,
  incompletePrayers: 4,
  totalTimeSpentMinutes: 90,
  yMax: MONTHLY_Y.yMax,
  yTicks: MONTHLY_Y.yTicks,
  pageCount: 4,
  activePageIndex: 1,
  chartData: MONTHLY_CHART,
};

const THREE_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Sept 6—Oct 3", completed: 18, timeSpent: 90 },
    { xLabel: "m2", dateLabel: "Oct 4—31", completed: 20, timeSpent: 100 },
    { xLabel: "m3", dateLabel: "Nov 1—28", completed: 22, timeSpent: 110 },
  ],
  66
);

const THREE_MONTHS_Y = computeYAxis(THREE_MONTHS_CHART);

const THREE_MONTHS_ACHIEVEMENT: PrayerPastAchievement = {
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 90,
  previousPeriodDeltaPercent: 5,
  goalPrayers: 66,
  periodGoalPrayers: 66 / 3,
  completedPrayers: 60,
  incompletePrayers: 6,
  totalTimeSpentMinutes: 300,
  pageCount: 3,
  activePageIndex: 2,
  chartData: THREE_MONTHS_CHART,
  ...THREE_MONTHS_Y,
};

const SIX_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Jun 14—\nJul 11", completed: 15, timeSpent: 75 },
    { xLabel: "m2", dateLabel: "Jul 12—\nAug 8", completed: 18, timeSpent: 90 },
    { xLabel: "m3", dateLabel: "Aug 9—\nSep 5", completed: 20, timeSpent: 100 },
    { xLabel: "m4", dateLabel: "Sept 6—\nOct 3", completed: 18, timeSpent: 90 },
    { xLabel: "m5", dateLabel: "Oct 4—\n31", completed: 20, timeSpent: 100 },
    { xLabel: "m6", dateLabel: "Nov 1—\n28", completed: 22, timeSpent: 110 },
  ],
  132
);

const SIX_MONTHS_Y = computeYAxis(SIX_MONTHS_CHART);

const SIX_MONTHS_ACHIEVEMENT: PrayerPastAchievement = {
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 85,
  previousPeriodDeltaPercent: 12,
  goalPrayers: 132,
  periodGoalPrayers: 132 / 6,
  completedPrayers: 113,
  incompletePrayers: 19,
  totalTimeSpentMinutes: 565,
  pageCount: 6,
  activePageIndex: 5,
  chartData: SIX_MONTHS_CHART,
  ...SIX_MONTHS_Y,
};

// Generic fallback data for all prayers
export function getPrayerPastAchievement(
  goalId: GoalId,
  period: PastAchievementPeriod
): PrayerPastAchievement {
  // We can return the same mock data for all prayers for now,
  // or add custom ones in a dictionary later.
  if (period === "monthly") return MONTHLY_ACHIEVEMENT;
  if (period === "threeMonths") return THREE_MONTHS_ACHIEVEMENT;
  return SIX_MONTHS_ACHIEVEMENT;
}
