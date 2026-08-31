import moment from "moment-hijri";
import type {
  PrayerGoalAchievementsData,
  FiveDailyOnTimeVsQadhaItem,
  FiveDailyMosqueVsHomeItem,
  FiveDailyTimeSpentItem,
  PrayerAchievementsChartItem,
  PrayerAchievementsTimeItem,
  QiyamTimeData,
} from "@/src/api/queries/useGetPrayerGoalAchievements";
import type {
  PrayerAnalyticsView,
  PrayerPastAchievement,
} from "@/src/screens/private/goalprogressloggingscreen/prayerPastAchievementData";

export type QiyamAchievementsMapOptions = {
  qiyamCategoryKey?: "AFTER_ISHA" | "TAHAJJUD";
  qiyamTimeKey?: "all" | "afterIsha" | "tahajjud";
};

function isQiyamTimeData(
  timeData: PrayerGoalAchievementsData["timeData"],
): timeData is QiyamTimeData {
  return (
    !!timeData &&
    !Array.isArray(timeData) &&
    ("all" in timeData || "afterIsha" in timeData || "tahajjud" in timeData)
  );
}

function resolveQiyamTimeSeries(
  data: PrayerGoalAchievementsData,
  timeKey: QiyamAchievementsMapOptions["qiyamTimeKey"] = "all",
): PrayerAchievementsTimeItem[] {
  const timeData = data.timeData;
  if (!timeData) return [];
  if (Array.isArray(timeData)) return timeData;
  if (!isQiyamTimeData(timeData)) return [];
  if (timeKey === "afterIsha") return timeData.afterIsha ?? timeData.all ?? [];
  if (timeKey === "tahajjud") return timeData.tahajjud ?? timeData.all ?? [];
  return timeData.all ?? [];
}

function isQiyamAchievementsData(data: PrayerGoalAchievementsData): boolean {
  return data.completedByCategoryData != null;
}

function computeYAxis(stackTotals: number[], lineValues: number[] = []) {
  const maxStack = Math.max(...stackTotals, 0);
  const maxLine = Math.max(...lineValues, 0);
  const maxVal = Math.max(maxStack, maxLine);
  const yMax = Math.max(10, Math.ceil(maxVal / 5) * 5);
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

/** Two-line x-axis labels for 6M bars, e.g. "Jun 14—" / "Jul 11" or "Nov 1—" / "28". */
export function formatSixMonthChartBarDateLabel(weekLabel: string): string {
  const raw = weekLabel.trim().replace(/\r\n/g, "\n");
  if (!raw || raw.includes("\n")) return raw;

  const parts = raw.split(/\s*[—–−-]\s*/).filter(Boolean);
  if (parts.length < 2) return raw;

  return `${parts[0].trim()}—\n${parts.slice(1).join("—").trim()}`;
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

function weekDateLabel(
  weekLabel: string,
  period: string,
): string {
  return period === "6M" || period === "sixMonths"
    ? formatSixMonthChartBarDateLabel(weekLabel)
    : weekLabel;
}

function finalizeAchievement(
  data: PrayerGoalAchievementsData,
  chartData: PrayerPastAchievement["chartData"],
  completedPrayers: number,
  incompletePrayers: number,
  summaryText?: string | null,
): PrayerPastAchievement {
  const barCount = Math.max(chartData.length, 1);
  const lineValues = chartData.map(
    (item) => (item as { lineValue?: number }).lineValue ?? 0,
  );
  const { yMax, yTicks } = computeYAxis(
    chartData.map((item) => item.stackTotalHours),
    lineValues,
  );

  return {
    dateRangeLabel: formatPrayerAchievementsDateRange(
      data.periodStart,
      data.periodEnd,
    ),
    achievementPercent: data.achievementPct ?? 0,
    previousPeriodDeltaPercent: data.delta ?? null,
    chartData,
    goalPrayers: data.goal ?? 0,
    periodGoalPrayers: (data.goal ?? 0) / barCount,
    completedPrayers,
    incompletePrayers,
    totalTimeSpentMinutes: data.totalMinutesSpent ?? 0,
    summaryText: summaryText ?? null,
    yMax,
    yTicks,
    pageCount: chartData.length,
    activePageIndex: Math.max(chartData.length - 1, 0),
  };
}

function mapOnTimeVsQadha(
  data: PrayerGoalAchievementsData,
  items: FiveDailyOnTimeVsQadhaItem[],
): PrayerPastAchievement {
  const chartData = items.map((item, index) => {
    const onTime = item.onTime ?? 0;
    const qadha = item.qadha ?? 0;
    const stack = onTime + qadha;
    return {
      xLabel: `w${index + 1}`,
      dateLabel: weekDateLabel(item.weekLabel, data.period),
      completedHours: onTime,
      incompleteHours: qadha,
      hours: onTime,
      stackTotalHours: stack,
      completedPrayers: onTime,
      incompletePrayers: qadha,
      timeSpentMinutes: 0,
      stackTotalPrayers: stack,
      completedDeltaPct: item.completedDeltaPct ?? null,
      bucketSummaryText: item.bucketSummaryText ?? null,
    } as PrayerPastAchievement["chartData"][number];
  });

  return finalizeAchievement(
    data,
    chartData,
    data.completedCount ?? 0,
    data.qadhaCount ?? data.incompleteCount ?? 0,
    data.summaryText,
  );
}

function mapMosqueVsHome(
  data: PrayerGoalAchievementsData,
  items: FiveDailyMosqueVsHomeItem[],
): PrayerPastAchievement {
  const chartData = items.map((item, index) => {
    const mosque = item.mosque ?? 0;
    const home = item.home ?? 0;
    const stack = mosque + home;
    return {
      xLabel: `w${index + 1}`,
      dateLabel: weekDateLabel(item.weekLabel, data.period),
      completedHours: mosque,
      incompleteHours: home,
      hours: mosque,
      stackTotalHours: stack,
      completedPrayers: mosque,
      incompletePrayers: home,
      timeSpentMinutes: 0,
      stackTotalPrayers: stack,
      completedDeltaPct: null,
      bucketSummaryText: item.bucketSummaryText ?? null,
    } as PrayerPastAchievement["chartData"][number];
  });

  return finalizeAchievement(
    data,
    chartData,
    data.mosqueCount ?? 0,
    data.homeCount ?? 0,
    data.mosqueSummaryText,
  );
}

function mapTimeSpentView(
  data: PrayerGoalAchievementsData,
  items: FiveDailyTimeSpentItem[],
): PrayerPastAchievement {
  const chartData = items.map((item, index) => {
    const onTime = item.onTime ?? 0;
    const qadha = item.qadha ?? 0;
    const completed = onTime + qadha;
    const minutes = item.minutesSpent ?? 0;
    return {
      xLabel: `w${index + 1}`,
      dateLabel: weekDateLabel(item.weekLabel, data.period),
      completedHours: completed,
      incompleteHours: 0,
      hours: completed,
      stackTotalHours: completed,
      completedPrayers: completed,
      incompletePrayers: 0,
      timeSpentMinutes: minutes,
      stackTotalPrayers: completed,
      completedDeltaPct: null,
      timeSpentDeltaPct: item.timeSpentDeltaPct ?? null,
      bucketSummaryText: item.bucketTimeSpentSummaryText ?? null,
    } as PrayerPastAchievement["chartData"][number];
  });

  const completedTotal =
    (data.completedCount ?? 0) + (data.qadhaCount ?? 0);

  return finalizeAchievement(
    data,
    chartData,
    completedTotal,
    0,
    data.timeSpentSummaryText,
  );
}

function mapQiyamChartBuckets(
  data: PrayerGoalAchievementsData,
  items: PrayerAchievementsChartItem[],
  timeSeries: PrayerAchievementsTimeItem[],
  completedTotal: number,
  incompleteTotal: number,
  summaryText?: string | null,
): PrayerPastAchievement {
  const timeByLabel = new Map(timeSeries.map((item) => [item.weekLabel, item]));

  const chartData = items.map((item, index) => {
    const completed = item.completed ?? 0;
    const incomplete = item.incomplete ?? 0;
    const nights = item.nights ?? 0;
    const timeItem = timeByLabel.get(item.weekLabel);
    const timeSpentMinutes = timeItem?.minutesSpent ?? 0;
    const stackTotalPrayers = completed + incomplete;

    return {
      xLabel: `w${index + 1}`,
      dateLabel: weekDateLabel(item.weekLabel, data.period),
      completedHours: completed,
      incompleteHours: incomplete,
      hours: completed,
      stackTotalHours: stackTotalPrayers,
      completedPrayers: completed,
      incompletePrayers: incomplete,
      nights,
      lineValue: nights,
      timeSpentMinutes,
      stackTotalPrayers,
      completedDeltaPct: item.completedDeltaPct ?? null,
      timeSpentDeltaPct: timeItem?.timeSpentDeltaPct ?? null,
      bucketSummaryText: item.bucketSummaryText ?? null,
    } as PrayerPastAchievement["chartData"][number];
  });

  return finalizeAchievement(
    data,
    chartData,
    completedTotal,
    incompleteTotal,
    summaryText,
  );
}

function mapQiyamCategoryView(
  data: PrayerGoalAchievementsData,
  categoryKey: "AFTER_ISHA" | "TAHAJJUD",
): PrayerPastAchievement {
  const category = data.completedByCategoryData?.[categoryKey];
  if (!category) {
    return mapQiyamChartBuckets(
      data,
      data.chartData ?? [],
      resolveQiyamTimeSeries(data),
      data.completedCount ?? 0,
      data.incompleteCount ?? 0,
      data.summaryText,
    );
  }

  return mapQiyamChartBuckets(
    data,
    category.chartData ?? [],
    [],
    category.completed ?? 0,
    category.nights ?? 0,
    category.summaryText,
  );
}

function mapQiyamTimeSpentView(
  data: PrayerGoalAchievementsData,
  timeKey: QiyamAchievementsMapOptions["qiyamTimeKey"] = "all",
): PrayerPastAchievement {
  const timeSeries = resolveQiyamTimeSeries(data, timeKey);
  const chartItems = data.chartData ?? [];

  const chartData = chartItems.map((item, index) => {
    const completed = item.completed ?? 0;
    const incomplete = item.incomplete ?? 0;
    const nights = item.nights ?? 0;
    const timeItem = timeSeries.find((t) => t.weekLabel === item.weekLabel);
    const minutes = timeItem?.minutesSpent ?? 0;
    const stack = completed + incomplete;

    return {
      xLabel: `w${index + 1}`,
      dateLabel: weekDateLabel(item.weekLabel, data.period),
      completedHours: completed,
      incompleteHours: incomplete,
      hours: completed,
      stackTotalHours: stack,
      completedPrayers: completed,
      incompletePrayers: incomplete,
      nights,
      lineValue: nights,
      timeSpentMinutes: minutes,
      stackTotalPrayers: stack,
      completedDeltaPct: item.completedDeltaPct ?? null,
      timeSpentDeltaPct: timeItem?.timeSpentDeltaPct ?? null,
      bucketSummaryText:
        timeItem?.bucketTimeSpentSummaryText ?? item.bucketSummaryText ?? null,
    } as PrayerPastAchievement["chartData"][number];
  });

  return finalizeAchievement(
    data,
    chartData,
    data.completedCount ?? 0,
    data.incompleteCount ?? 0,
    data.timeSpentSummaryText,
  );
}

function mapQiyamAchievements(
  data: PrayerGoalAchievementsData,
  analyticsView: PrayerAnalyticsView,
  options?: QiyamAchievementsMapOptions,
): PrayerPastAchievement {
  if (analyticsView === "completedByCategory" && options?.qiyamCategoryKey) {
    return mapQiyamCategoryView(data, options.qiyamCategoryKey);
  }
  if (analyticsView === "completedVsTimeSpent") {
    return mapQiyamTimeSpentView(data, options?.qiyamTimeKey ?? "all");
  }

  return mapQiyamChartBuckets(
    data,
    data.chartData ?? [],
    resolveQiyamTimeSeries(data, options?.qiyamTimeKey ?? "all"),
    data.completedCount ?? 0,
    data.incompleteCount ?? 0,
    data.summaryText,
  );
}

function mapLegacyChartData(
  data: PrayerGoalAchievementsData,
): PrayerPastAchievement {
  const timeData = data.timeData;
  const timeSeries = Array.isArray(timeData)
    ? timeData
    : isQiyamTimeData(timeData)
      ? timeData.all ?? []
      : [];

  const timeByLabel = new Map(timeSeries.map((item) => [item.weekLabel, item]));

  const chartData = (data.chartData ?? []).map((item, index) => {
    const completed = item.completed ?? 0;
    const incomplete = item.incomplete ?? 0;
    const timeItem = timeByLabel.get(item.weekLabel);
    const timeSpentMinutes = timeItem?.minutesSpent ?? 0;
    const stackTotalPrayers = completed + incomplete;

    return {
      xLabel: `w${index + 1}`,
      dateLabel: weekDateLabel(item.weekLabel, data.period),
      completedHours: completed,
      incompleteHours: incomplete,
      hours: completed,
      stackTotalHours: stackTotalPrayers,
      completedPrayers: completed,
      incompletePrayers: incomplete,
      timeSpentMinutes,
      stackTotalPrayers,
      completedDeltaPct: item.completedDeltaPct ?? null,
      timeSpentDeltaPct: timeItem?.timeSpentDeltaPct ?? null,
      bucketSummaryText: item.bucketSummaryText ?? null,
    } as PrayerPastAchievement["chartData"][number];
  });

  return finalizeAchievement(
    data,
    chartData,
    data.completedCount ?? 0,
    data.incompleteCount ?? 0,
    data.summaryText,
  );
}

/**
 * Maps achievements API → UI chart/stats.
 * When `chartViews` is present (five-daily), picks the series for `analyticsView`.
 */
export function mapPrayerGoalAchievementsToUi(
  data: PrayerGoalAchievementsData,
  analyticsView: PrayerAnalyticsView = "completedVsIncomplete",
  options?: QiyamAchievementsMapOptions,
): PrayerPastAchievement {
  if (isQiyamAchievementsData(data)) {
    return mapQiyamAchievements(data, analyticsView, options);
  }

  const views = data.chartViews;
  if (views) {
    if (
      analyticsView === "inMosqueVsOutOfMosque" &&
      views.inMosqueVsHome?.length
    ) {
      return mapMosqueVsHome(data, views.inMosqueVsHome);
    }
    if (analyticsView === "completedVsTimeSpent" && views.timeSpent?.length) {
      return mapTimeSpentView(data, views.timeSpent);
    }
    if (views.onTimeVsQadha?.length) {
      return mapOnTimeVsQadha(data, views.onTimeVsQadha);
    }
  }

  return mapLegacyChartData(data);
}
