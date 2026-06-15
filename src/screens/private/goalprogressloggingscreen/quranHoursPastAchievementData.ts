import { QuranHoursGoalId } from "./types";
import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";

export type PastAchievementPeriod = "monthly" | "threeMonths" | "sixMonths";

export type QuranPastChartItem = {
  xLabel: string;
  dateLabel: string;
  completedHours: number;
  incompleteHours: number;
  /** Logged hours — shown on bar label when selected. */
  hours: number;
  /** Total stacked bar height (completed + incomplete toward period goal). */
  stackTotalHours: number;
};

export type QuranHoursPastAchievement = {
  dateRangeLabel: string;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  chartData: QuranPastChartItem[];
  goalHours: number;
  periodGoalHours: number;
  completedHours: number;
  incompleteHours: number;
  activeDays: number;
  activeDaysPrevious: number;
  longestStreak: number;
  longestStreakPrevious: number;
  yMax: number;
  yTicks: number[];
  pageCount: number;
  activePageIndex: number;
};

function buildPeriodBar(
  xLabel: string,
  dateLabel: string,
  completedHours: number,
  periodGoalHours: number,
): QuranPastChartItem {
  const incompleteHours = Math.max(0, periodGoalHours - completedHours);
  const stackTotalHours = completedHours + incompleteHours;

  return {
    xLabel,
    dateLabel,
    completedHours,
    incompleteHours,
    hours: completedHours,
    stackTotalHours,
  };
}

function buildPeriodChart(
  periods: Array<{ xLabel: string; dateLabel: string; completed: number }>,
  goalHours: number,
): QuranPastChartItem[] {
  const periodGoalHours = goalHours / periods.length;
  return periods.map((period) =>
    buildPeriodBar(
      period.xLabel,
      period.dateLabel,
      period.completed,
      periodGoalHours,
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

const MONTHLY_LISTENING_CHART = buildPeriodChart(
  [
    { xLabel: "w1", dateLabel: "Nov 1–7", completed: 8 },
    { xLabel: "w2", dateLabel: "Nov 8–14", completed: 12 },
    { xLabel: "w3", dateLabel: "Nov 15–21", completed: 9 },
    { xLabel: "w4", dateLabel: "Nov 22–28", completed: 9 },
  ],
  45,
);

const MONTHLY_Y = computeYAxis(MONTHLY_LISTENING_CHART);

const MONTHLY_LISTENING: QuranHoursPastAchievement = {
  dateRangeLabel: "Nov 1 — 28, 24",
  achievementPercent: 67,
  previousPeriodDeltaPercent: 33,
  goalHours: 45,
  periodGoalHours: 45 / 4,
  completedHours: 30,
  incompleteHours: 15,
  activeDays: 28,
  activeDaysPrevious: 25,
  longestStreak: 3,
  longestStreakPrevious: 3,
  yMax: MONTHLY_Y.yMax,
  yTicks: MONTHLY_Y.yTicks,
  pageCount: 4,
  activePageIndex: 1,
  chartData: MONTHLY_LISTENING_CHART,
};

const MONTHLY_TAJWEED_CHART = buildPeriodChart(
  [
    { xLabel: "w1", dateLabel: "Nov 1–7", completed: 6 },
    { xLabel: "w2", dateLabel: "Nov 8–14", completed: 7.5 },
    { xLabel: "w3", dateLabel: "Nov 15–21", completed: 5.5 },
    { xLabel: "w4", dateLabel: "Nov 22–28", completed: 9 },
  ],
  45,
);

const MONTHLY_TAJWEED: QuranHoursPastAchievement = {
  ...MONTHLY_LISTENING,
  chartData: MONTHLY_TAJWEED_CHART,
  ...computeYAxis(MONTHLY_TAJWEED_CHART),
};

const THREE_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Sep 1–30", completed: 24 },
    { xLabel: "m2", dateLabel: "Oct 1–31", completed: 28 },
    { xLabel: "m3", dateLabel: "Nov 1–30", completed: 34 },
  ],
  120,
);

const THREE_MONTHS_Y = computeYAxis(THREE_MONTHS_CHART);

const THREE_MONTHS_LISTENING: QuranHoursPastAchievement = {
  ...MONTHLY_LISTENING,
  dateRangeLabel: "Sep — Nov, 24",
  achievementPercent: 72,
  previousPeriodDeltaPercent: 18,
  goalHours: 120,
  periodGoalHours: 40,
  completedHours: 86,
  incompleteHours: 34,
  pageCount: 3,
  activePageIndex: 2,
  chartData: THREE_MONTHS_CHART,
  ...THREE_MONTHS_Y,
};

const SIX_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Jun 1–30", completed: 20 },
    { xLabel: "m2", dateLabel: "Jul 1–31", completed: 22 },
    { xLabel: "m3", dateLabel: "Aug 1–31", completed: 24 },
    { xLabel: "m4", dateLabel: "Sep 1–30", completed: 26 },
    { xLabel: "m5", dateLabel: "Oct 1–31", completed: 28 },
    { xLabel: "m6", dateLabel: "Nov 1–30", completed: 26 },
  ],
  180,
);

const SIX_MONTHS_Y = computeYAxis(SIX_MONTHS_CHART);

const SIX_MONTHS_LISTENING: QuranHoursPastAchievement = {
  ...MONTHLY_LISTENING,
  dateRangeLabel: "Jun — Nov, 24",
  achievementPercent: 81,
  previousPeriodDeltaPercent: 12,
  goalHours: 180,
  periodGoalHours: 30,
  completedHours: 146,
  incompleteHours: 34,
  pageCount: 6,
  activePageIndex: 5,
  chartData: SIX_MONTHS_CHART,
  ...SIX_MONTHS_Y,
};

const DATA: Record<
  QuranHoursGoalId,
  Record<PastAchievementPeriod, QuranHoursPastAchievement>
> = {
  "quran-listening": {
    monthly: MONTHLY_LISTENING,
    threeMonths: THREE_MONTHS_LISTENING,
    sixMonths: SIX_MONTHS_LISTENING,
  },
  "quran-Tajweed": {
    monthly: MONTHLY_TAJWEED,
    threeMonths: {
      ...THREE_MONTHS_LISTENING,
      goalHours: 95,
      periodGoalHours: 95 / 3,
      chartData: buildPeriodChart(
        [
          { xLabel: "m1", dateLabel: "Sep 1–30", completed: 18 },
          { xLabel: "m2", dateLabel: "Oct 1–31", completed: 22 },
          { xLabel: "m3", dateLabel: "Nov 1–30", completed: 26 },
        ],
        95,
      ),
    },
    sixMonths: {
      ...SIX_MONTHS_LISTENING,
      goalHours: 140,
      periodGoalHours: 140 / 6,
      chartData: buildPeriodChart(
        [
          { xLabel: "m1", dateLabel: "Jun 1–30", completed: 18 },
          { xLabel: "m2", dateLabel: "Jul 1–31", completed: 20 },
          { xLabel: "m3", dateLabel: "Aug 1–31", completed: 22 },
          { xLabel: "m4", dateLabel: "Sep 1–30", completed: 24 },
          { xLabel: "m5", dateLabel: "Oct 1–31", completed: 26 },
          { xLabel: "m6", dateLabel: "Nov 1–30", completed: 22 },
        ],
        140,
      ),
    },
  },
};

export function getQuranHoursPastAchievement(
  goalId: QuranHoursGoalId,
  period: PastAchievementPeriod,
): QuranHoursPastAchievement {
  const achievement = DATA[goalId][period];
  const yAxis = computeYAxis(achievement.chartData);
  return { ...achievement, ...yAxis };
}

export function formatGoalHoursLabel(hours: number): string {
  return formatTotalTime(hours);
}
