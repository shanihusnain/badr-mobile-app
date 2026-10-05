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
  PastAchievementPeriod,
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
  periodStart: string | null | undefined,
  periodEnd: string | null | undefined,
): string {
  // API may send null/0 for empty periods — moment(0) becomes "Jan 1, 00".
  if (
    periodStart == null ||
    periodEnd == null ||
    periodStart === "" ||
    periodEnd === "" ||
    typeof periodStart === "number" ||
    typeof periodEnd === "number"
  ) {
    return "";
  }

  const start = moment(String(periodStart), "YYYY-MM-DD", true);
  const end = moment(String(periodEnd), "YYYY-MM-DD", true);
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

/**
 * Client-side date range + empty x-axis slots for M / 3M / 6M when the API
 * has not returned period dates or chart buckets yet.
 */
export function buildPastAchievementSlotDateLabel(
  period: "monthly" | "threeMonths" | "sixMonths",
  index: number,
  periodStart?: string | null,
): string {
  let anchor =
    periodStart != null && periodStart !== ""
      ? moment(String(periodStart), "YYYY-MM-DD", true)
      : null;

  if (!anchor?.isValid()) {
    if (period === "monthly") {
      anchor = moment().startOf("month");
    } else if (period === "threeMonths") {
      anchor = moment().subtract(2, "months").startOf("month");
    } else {
      anchor = moment().subtract(5, "months").startOf("month");
    }
  }

  if (period === "monthly") {
    const weekStart = anchor.clone().add(index, "weeks");
    const weekEnd = moment.min(
      weekStart.clone().add(6, "days"),
      anchor.clone().endOf("month"),
    );
    return `${weekStart.format("MMM D")}–${weekEnd.format("D")}`;
  }

  // 3M / 6M — month abbreviation only (Jul, Aug, …).
  return anchor.clone().add(index, "months").format("MMM");
}

export function buildEmptyPastAchievementPeriodScaffold(
  period: "monthly" | "threeMonths" | "sixMonths",
): {
  dateRangeLabel: string;
  chartData: Array<{
    xLabel: string;
    dateLabel: string;
    completedHours: number;
    incompleteHours: number;
    hours: number;
    stackTotalHours: number;
    completedMinutes: number;
    incompleteMinutes: number;
  }>;
} {
  const today = moment();

  if (period === "monthly") {
    const start = today.clone().startOf("month");
    const end = today.clone().endOf("month");
    const dateRangeLabel = formatPrayerAchievementsDateRange(
      start.format("YYYY-MM-DD"),
      end.format("YYYY-MM-DD"),
    );
    const chartData = [0, 1, 2, 3].map((index) => ({
      xLabel: `w${index + 1}`,
      dateLabel: buildPastAchievementSlotDateLabel(
        period,
        index,
        start.format("YYYY-MM-DD"),
      ),
      completedHours: 0,
      incompleteHours: 0,
      hours: 0,
      stackTotalHours: 0,
      completedMinutes: 0,
      incompleteMinutes: 0,
    }));
    return { dateRangeLabel, chartData };
  }

  if (period === "threeMonths") {
    const end = today.clone().endOf("month");
    const start = today.clone().subtract(2, "months").startOf("month");
    const dateRangeLabel = formatPrayerAchievementsDateRange(
      start.format("YYYY-MM-DD"),
      end.format("YYYY-MM-DD"),
    );
    const chartData = [0, 1, 2].map((index) => ({
      xLabel: `m${index + 1}`,
      dateLabel: buildPastAchievementSlotDateLabel(
        period,
        index,
        start.format("YYYY-MM-DD"),
      ),
      completedHours: 0,
      incompleteHours: 0,
      hours: 0,
      stackTotalHours: 0,
      completedMinutes: 0,
      incompleteMinutes: 0,
    }));
    return { dateRangeLabel, chartData };
  }

  const end = today.clone().endOf("month");
  const start = today.clone().subtract(5, "months").startOf("month");
  const dateRangeLabel = formatPrayerAchievementsDateRange(
    start.format("YYYY-MM-DD"),
    end.format("YYYY-MM-DD"),
  );
  const chartData = [0, 1, 2, 3, 4, 5].map((index) => ({
    xLabel: `m${index + 1}`,
    dateLabel: buildPastAchievementSlotDateLabel(
      period,
      index,
      start.format("YYYY-MM-DD"),
    ),
    completedHours: 0,
    incompleteHours: 0,
    hours: 0,
    stackTotalHours: 0,
    completedMinutes: 0,
    incompleteMinutes: 0,
  }));
  return { dateRangeLabel, chartData };
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

function resolveUiPeriod(
  period: string | null | undefined,
): PastAchievementPeriod {
  const raw = String(period ?? "").toUpperCase();
  if (raw === "3M" || raw === "THREEMONTHS") return "threeMonths";
  if (raw === "6M" || raw === "SIXMONTHS") return "sixMonths";
  return "monthly";
}

function scaffoldChartItems(period: PastAchievementPeriod) {
  return buildEmptyPastAchievementPeriodScaffold(period).chartData.map(
    (item) => ({
      ...item,
      completedPrayers: 0,
      incompletePrayers: 0,
      timeSpentMinutes: 0,
      stackTotalPrayers: 0,
    }),
  );
}

/** Empty prayer past-achievement shell with period dates + x-axis slots. */
export function createEmptyPrayerPastAchievement(
  period: PastAchievementPeriod = "monthly",
): PrayerPastAchievement {
  const scaffold = buildEmptyPastAchievementPeriodScaffold(period);
  return {
    dateRangeLabel: scaffold.dateRangeLabel,
    achievementPercent: 0,
    previousPeriodDeltaPercent: 0,
    chartData: scaffoldChartItems(period),
    goalPrayers: 0,
    periodGoalPrayers: 0,
    completedPrayers: 0,
    incompletePrayers: 0,
    totalTimeSpentMinutes: 0,
    summaryText: null,
    yMax: 1,
    yTicks: [0, 1],
    pageCount: 1,
    activePageIndex: 0,
  };
}

function withEmptyPeriodScaffold(
  achievement: PrayerPastAchievement,
  period: string | null | undefined,
): PrayerPastAchievement {
  const uiPeriod = resolveUiPeriod(period);
  const scaffold = buildEmptyPastAchievementPeriodScaffold(uiPeriod);
  const chartData =
    achievement.chartData.length > 0
      ? achievement.chartData
      : scaffoldChartItems(uiPeriod);
  const dateRangeLabel =
    achievement.dateRangeLabel?.trim() || scaffold.dateRangeLabel;

  return {
    ...achievement,
    chartData,
    dateRangeLabel,
    pageCount:
      achievement.chartData.length > 0
        ? achievement.pageCount
        : chartData.length > 0
          ? 1
          : 0,
    yMax: achievement.chartData.length > 0 ? achievement.yMax : 1,
    yTicks: achievement.chartData.length > 0 ? achievement.yTicks : [0, 1],
  };
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

  return withEmptyPeriodScaffold(
    {
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
    },
    data.period,
  );
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
