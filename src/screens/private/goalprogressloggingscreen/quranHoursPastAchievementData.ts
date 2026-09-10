import { QuranHoursGoalId } from "./types";
import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import i18next from "i18next";

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

function deriveHoursTotals(
  chartData: QuranPastChartItem[],
  goalHours: number,
): Pick<
  QuranHoursPastAchievement,
  "completedHours" | "incompleteHours" | "achievementPercent"
> {
  const completedHours = chartData.reduce(
    (sum, item) => sum + item.completedHours,
    0,
  );
  const incompleteHours = Math.max(0, goalHours - completedHours);
  const achievementPercent =
    goalHours > 0 ? Math.round((completedHours / goalHours) * 100) : 0;

  return { completedHours, incompleteHours, achievementPercent };
}

function buildHoursPastAchievement(
  base: Omit<
    QuranHoursPastAchievement,
    "completedHours" | "incompleteHours" | "achievementPercent" | "yMax" | "yTicks"
  >,
): QuranHoursPastAchievement {
  const totals = deriveHoursTotals(base.chartData, base.goalHours);
  const yAxis = computeYAxis(base.chartData);
  return { ...base, ...totals, ...yAxis };
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

const MONTHLY_LISTENING: QuranHoursPastAchievement = buildHoursPastAchievement({
  dateRangeLabel: "Nov 1 — 28, 24",
  previousPeriodDeltaPercent: 33,
  chartData: MONTHLY_LISTENING_CHART,
  goalHours: 45,
  periodGoalHours: 45 / 4,
  activeDays: 28,
  activeDaysPrevious: 25,
  longestStreak: 3,
  longestStreakPrevious: 3,
  pageCount: 4,
  activePageIndex: 1,
});

const MONTHLY_TAJWEED_CHART = buildPeriodChart(
  [
    { xLabel: "w1", dateLabel: "Nov 1–7", completed: 6 },
    { xLabel: "w2", dateLabel: "Nov 8–14", completed: 7.5 },
    { xLabel: "w3", dateLabel: "Nov 15–21", completed: 5.5 },
    { xLabel: "w4", dateLabel: "Nov 22–28", completed: 9 },
  ],
  45,
);

const MONTHLY_TAJWEED: QuranHoursPastAchievement = buildHoursPastAchievement({
  dateRangeLabel: "Nov 1 — 28, 24",
  previousPeriodDeltaPercent: 28,
  chartData: MONTHLY_TAJWEED_CHART,
  goalHours: 45,
  periodGoalHours: 45 / 4,
  activeDays: 26,
  activeDaysPrevious: 22,
  longestStreak: 4,
  longestStreakPrevious: 2,
  pageCount: 4,
  activePageIndex: 1,
});

const THREE_MONTHS_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Sep 1–30", completed: 24 },
    { xLabel: "m2", dateLabel: "Oct 1–31", completed: 28 },
    { xLabel: "m3", dateLabel: "Nov 1–30", completed: 34 },
  ],
  120,
);

const THREE_MONTHS_LISTENING: QuranHoursPastAchievement = buildHoursPastAchievement({
  dateRangeLabel: "Sep — Nov, 24",
  previousPeriodDeltaPercent: 18,
  chartData: THREE_MONTHS_CHART,
  goalHours: 120,
  periodGoalHours: 40,
  activeDays: 82,
  activeDaysPrevious: 74,
  longestStreak: 5,
  longestStreakPrevious: 4,
  pageCount: 3,
  activePageIndex: 2,
});

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

const SIX_MONTHS_LISTENING: QuranHoursPastAchievement = buildHoursPastAchievement({
  dateRangeLabel: "Jun — Nov, 24",
  previousPeriodDeltaPercent: 12,
  chartData: SIX_MONTHS_CHART,
  goalHours: 180,
  periodGoalHours: 30,
  activeDays: 158,
  activeDaysPrevious: 142,
  longestStreak: 6,
  longestStreakPrevious: 5,
  pageCount: 6,
  activePageIndex: 5,
});

const THREE_MONTHS_TAJWEED_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Sep 1–30", completed: 18 },
    { xLabel: "m2", dateLabel: "Oct 1–31", completed: 22 },
    { xLabel: "m3", dateLabel: "Nov 1–30", completed: 26 },
  ],
  95,
);

const THREE_MONTHS_TAJWEED: QuranHoursPastAchievement = buildHoursPastAchievement({
  dateRangeLabel: "Sep — Nov, 24",
  previousPeriodDeltaPercent: 22,
  chartData: THREE_MONTHS_TAJWEED_CHART,
  goalHours: 95,
  periodGoalHours: 95 / 3,
  activeDays: 78,
  activeDaysPrevious: 68,
  longestStreak: 4,
  longestStreakPrevious: 3,
  pageCount: 3,
  activePageIndex: 2,
});

const SIX_MONTHS_TAJWEED_CHART = buildPeriodChart(
  [
    { xLabel: "m1", dateLabel: "Jun 1–30", completed: 18 },
    { xLabel: "m2", dateLabel: "Jul 1–31", completed: 20 },
    { xLabel: "m3", dateLabel: "Aug 1–31", completed: 22 },
    { xLabel: "m4", dateLabel: "Sep 1–30", completed: 24 },
    { xLabel: "m5", dateLabel: "Oct 1–31", completed: 26 },
    { xLabel: "m6", dateLabel: "Nov 1–30", completed: 22 },
  ],
  140,
);

const SIX_MONTHS_TAJWEED: QuranHoursPastAchievement = buildHoursPastAchievement({
  dateRangeLabel: "Jun — Nov, 24",
  previousPeriodDeltaPercent: 15,
  chartData: SIX_MONTHS_TAJWEED_CHART,
  goalHours: 140,
  periodGoalHours: 140 / 6,
  activeDays: 152,
  activeDaysPrevious: 136,
  longestStreak: 5,
  longestStreakPrevious: 4,
  pageCount: 6,
  activePageIndex: 5,
});

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
    threeMonths: THREE_MONTHS_TAJWEED,
    sixMonths: SIX_MONTHS_TAJWEED,
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

export type HoursGoalAchievement = {
  id: string;
  label: string;
  completedMinutes: number;
  incompleteMinutes: number;
};

/** @deprecated Use HoursGoalAchievement */
export type ListeningAchievement = HoursGoalAchievement;

export type TajweedAchievement = HoursGoalAchievement;

export type HoursGoalAchievementSummary = {
  totalCompletedMinutes: number;
  totalIncompleteMinutes: number;
  goalTracked: string;
  totalActiveHours: number;
  achievements: HoursGoalAchievement[];
};

/** @deprecated Use HoursGoalAchievementSummary */
export type ListeningAchievementSummary = HoursGoalAchievementSummary;

export type TajweedAchievementSummary = HoursGoalAchievementSummary;

export function getHoursGoalTrackedMonths(
  period: PastAchievementPeriod,
  achievement: QuranHoursPastAchievement,
): number {
  const trackedPeriods = achievement.chartData.filter(
    (item) => item.completedHours > 0 || item.incompleteHours > 0,
  ).length;

  switch (period) {
    case "monthly":
      return Math.max(1, Math.ceil(trackedPeriods / 4));
    case "threeMonths":
      return Math.max(1, Math.min(3, trackedPeriods));
    case "sixMonths":
      return Math.max(1, Math.min(6, trackedPeriods));
  }
}

/** @deprecated Use getHoursGoalTrackedMonths */
export const getListeningGoalTrackedMonths = getHoursGoalTrackedMonths;

export function formatHoursGoalTracked(months: number): string {
  if (months === 1) {
    return i18next.t("progressLogging.listeningGoalTrackedOneMonth") || "1 month";
  }
  return (
    i18next.t("progressLogging.listeningGoalTrackedMonths", {
      count: months,
    }) || `${months} months`
  );
}

/** @deprecated Use formatHoursGoalTracked */
export const formatListeningGoalTracked = formatHoursGoalTracked;

export function getHoursGoalTotalActiveHours(
  totalCompletedMinutes: number,
): number {
  return Math.floor(totalCompletedMinutes / 60);
}

/** @deprecated Use getHoursGoalTotalActiveHours */
export const getListeningTotalActiveHours = getHoursGoalTotalActiveHours;

export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

/** Formats minutes as `Xh Ym`, e.g. 1800 → "30h 0m", 930 → "15h 30m". */
export function formatDuration(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function toHoursPastAchievementSummary(
  achievement: QuranHoursPastAchievement,
  period: PastAchievementPeriod = "monthly",
): HoursGoalAchievementSummary {
  const achievements: HoursGoalAchievement[] = achievement.chartData.map(
    (item, index) => ({
      id: `${item.xLabel}-${index}`,
      label: item.dateLabel,
      completedMinutes: hoursToMinutes(item.completedHours),
      incompleteMinutes: hoursToMinutes(item.incompleteHours),
    }),
  );

  const totalCompletedMinutes = hoursToMinutes(achievement.completedHours);
  const goalTrackedMonths = getHoursGoalTrackedMonths(period, achievement);

  return {
    totalCompletedMinutes,
    totalIncompleteMinutes: hoursToMinutes(achievement.incompleteHours),
    goalTracked: formatHoursGoalTracked(goalTrackedMonths),
    totalActiveHours: getHoursGoalTotalActiveHours(totalCompletedMinutes),
    achievements,
  };
}

/** @deprecated Use toHoursPastAchievementSummary */
export const toListeningPastAchievementSummary = toHoursPastAchievementSummary;

export function getHoursPastAchievementSummary(
  goalId: QuranHoursGoalId,
  period: PastAchievementPeriod,
): HoursGoalAchievementSummary {
  return toHoursPastAchievementSummary(
    getQuranHoursPastAchievement(goalId, period),
    period,
  );
}

/** @deprecated Use getHoursPastAchievementSummary */
export const getListeningPastAchievementSummary = getHoursPastAchievementSummary;

export function getTajweedPastAchievementSummary(
  period: PastAchievementPeriod,
): TajweedAchievementSummary {
  return getHoursPastAchievementSummary("quran-Tajweed", period);
}
