import moment from "moment-hijri";
import type { PrayerGoalAchievementsData } from "@/src/api/queries/useGetPrayerGoalAchievements";
import type { PrayerPastAchievement } from "@/src/screens/private/goalprogressloggingscreen/prayerPastAchievementData";

function computeYAxis(stackTotals: number[]) {
  const maxStack = Math.max(...stackTotals, 0);
  const yMax = Math.max(10, Math.ceil(maxStack / 5) * 5);
  const step = yMax <= 15 ? 5 : yMax <= 25 ? 5 : 10;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

export function formatPrayerAchievementsDateRange(
  periodStart: string,
  periodEnd: string,
): string {
  const start = moment(periodStart, "YYYY-MM-DD");
  const end = moment(periodEnd, "YYYY-MM-DD");
  if (!start.isValid() || !end.isValid()) return "";

  const year = end.format("YY");
  if (start.month() === end.month() && start.year() === end.year()) {
    return `${start.format("MMM D")} — ${end.format("D")}, ${year}`;
  }
  if (start.year() === end.year()) {
    return `${start.format("MMM D")} — ${end.format("MMM D")}, ${year}`;
  }
  return `${start.format("MMM D, YY")} — ${end.format("MMM D, YY")}`;
}

/** Shift a period window by one full window length (back = -1, forward = +1). */
export function shiftPrayerAchievementsPeriodStart(
  periodStart: string,
  periodEnd: string,
  direction: -1 | 1,
): string {
  const start = moment(periodStart, "YYYY-MM-DD");
  const end = moment(periodEnd, "YYYY-MM-DD");
  const days = Math.max(end.diff(start, "days") + 1, 1);
  return start.add(direction * days, "days").format("YYYY-MM-DD");
}

export function mapPrayerGoalAchievementsToUi(
  data: PrayerGoalAchievementsData,
): PrayerPastAchievement {
  const timeByLabel = new Map(
    (data.timeData ?? []).map((item) => [item.weekLabel, item.minutesSpent]),
  );

  const chartData = (data.chartData ?? []).map((item, index) => {
    const completed = item.completed ?? 0;
    const incomplete = item.incomplete ?? 0;
    const timeSpentMinutes = timeByLabel.get(item.weekLabel) ?? 0;
    const stackTotalPrayers = completed + incomplete;

    return {
      xLabel: `w${index + 1}`,
      dateLabel: item.weekLabel,
      completedHours: completed,
      incompleteHours: incomplete,
      hours: completed,
      stackTotalHours: stackTotalPrayers,
      completedPrayers: completed,
      incompletePrayers: incomplete,
      timeSpentMinutes,
      stackTotalPrayers,
    } as PrayerPastAchievement["chartData"][number];
  });

  const barCount = Math.max(chartData.length, 1);
  const { yMax, yTicks } = computeYAxis(
    chartData.map((item) => item.stackTotalHours),
  );

  return {
    dateRangeLabel: formatPrayerAchievementsDateRange(
      data.periodStart,
      data.periodEnd,
    ),
    achievementPercent: data.achievementPct ?? 0,
    previousPeriodDeltaPercent: data.delta ?? 0,
    chartData,
    goalPrayers: data.goal ?? 0,
    periodGoalPrayers: (data.goal ?? 0) / barCount,
    completedPrayers: data.completedCount ?? 0,
    incompletePrayers: data.incompleteCount ?? 0,
    totalTimeSpentMinutes: data.totalMinutesSpent ?? 0,
    yMax,
    yTicks,
    pageCount: chartData.length,
    activePageIndex: Math.max(chartData.length - 1, 0),
  };
}
