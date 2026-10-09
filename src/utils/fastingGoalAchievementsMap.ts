import type {
  FastingAchievementsBucket,
  FastingAchievementsCalendarDay,
  FastingAchievementsKeyInsight,
  FastingGoalAchievementsData,
} from "@/src/api/queries/useGetFastingGoalAchievements";
import type { InsightCardData } from "@/components/molecules/PrayerPastAchievements/insightCardsData";
import type {
  MissedRamadanPeriodSlice,
} from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsPastAchievementData";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { formatPrayerAchievementsDateRange } from "@/src/utils/prayerGoalAchievementsMap";

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizeDate(date: string | null | undefined): string {
  return String(date ?? "").slice(0, 10);
}

function getCurrentMonthStart(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}-01`;
}

function getMonthEndFromStart(monthStart: string): string {
  const date = new Date(`${monthStart}T12:00:00`);
  date.setMonth(date.getMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
}

function isValidIsoDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function getSignedDelta(
  delta: FastingGoalAchievementsData["delta"],
): number {
  if (delta == null) return 0;
  const pct = toFiniteNumber(delta.pct) ?? 0;
  const direction = String(delta.direction ?? "").toUpperCase();
  if (direction === "DOWN") return -Math.abs(pct);
  if (direction === "UP") return Math.abs(pct);
  return pct;
}

function computeYAxis(chartData: QuranPastChartItem[]) {
  const maxStack = Math.max(
    ...chartData.map((item) => item.stackTotalHours),
    0,
  );
  const yMax = Math.max(3, Math.ceil(maxStack));
  const step = yMax <= 3 ? 1 : yMax <= 9 ? 3 : Math.ceil(yMax / 3);
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

function bucketHasNumericData(bucket: FastingAchievementsBucket): boolean {
  return (
    toFiniteNumber(bucket.completed) != null ||
    toFiniteNumber(bucket.incomplete) != null ||
    toFiniteNumber(bucket.minutes) != null ||
    toFiniteNumber(bucket.goal) != null ||
    Boolean(bucket.hasData) ||
    Boolean(normalizeDate(bucket.start)) ||
    Boolean(bucket.label?.trim())
  );
}

function mapBucketsToChartPeriods(
  buckets: FastingAchievementsBucket[],
): MissedRamadanPeriodSlice["chartPeriods"] {
  return buckets.map((bucket, index) => {
    const start = normalizeDate(bucket.start);
    const end = normalizeDate(bucket.end);
    const label = bucket.label?.trim() || `W${index + 1}`;
    const completed = Math.max(0, toFiniteNumber(bucket.completed) ?? 0);
    const incomplete = Math.max(0, toFiniteNumber(bucket.incomplete) ?? 0);
    const timeSpentMinutes = Math.max(0, toFiniteNumber(bucket.minutes) ?? 0);
    const dateLabel =
      start && end
        ? formatPrayerAchievementsDateRange(start, end)
        : label;

    return {
      xLabel: label,
      dateLabel,
      startDate: start,
      endDate: end,
      completed,
      incomplete,
      timeSpentMinutes,
    };
  });
}

function classifyCalendarMarker(marker: string | null | undefined): {
  completed?: boolean;
  skipped?: boolean;
  upcoming?: boolean;
  incompletePlanned?: boolean;
} {
  const m = String(marker ?? "")
    .trim()
    .toUpperCase();
  if (
    m === "COMPLETED" ||
    m === "LOGGED" ||
    m === "DONE" ||
    m === "ACHIEVED" ||
    m === "COVERED_EARLY" ||
    m === "MADE_UP"
  ) {
    return { completed: true };
  }
  if (m === "MISSED" || m === "SKIPPED") {
    return { skipped: true, incompletePlanned: true };
  }
  if (m === "UPCOMING" || m === "PLANNED" || m === "DUE") {
    return { upcoming: true, incompletePlanned: true };
  }
  return {};
}

function mapCalendarDates(calendar: FastingAchievementsCalendarDay[] | null | undefined) {
  const completedDates: string[] = [];
  const skippedDates: string[] = [];
  const upcomingDates: string[] = [];
  const incompletePlannedDates: string[] = [];

  for (const day of calendar ?? []) {
    const date = normalizeDate(day.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const kind = classifyCalendarMarker(day.marker);
    if (kind.completed) completedDates.push(date);
    if (kind.skipped) skippedDates.push(date);
    if (kind.upcoming) upcomingDates.push(date);
    if (kind.incompletePlanned) incompletePlannedDates.push(date);
  }

  return {
    completedDates,
    skippedDates,
    upcomingDates,
    incompletePlannedDates,
  };
}

export type MappedMissedRamadanAchievements = {
  slice: MissedRamadanPeriodSlice;
  achievement: QuranHoursPastAchievement;
  locked: boolean;
  keyInsightsHeader: string | null;
  keyInsights: FastingAchievementsKeyInsight[];
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  periodStart: string | null;
  periodEnd: string | null;
  narrative: string | null;
  totalTimeSpentMinutes: number;
};

/** Empty scaffold while achievements API is loading or locked. */
export function createEmptyMissedRamadanAchievements(
  period: PastAchievementPeriod,
): MappedMissedRamadanAchievements {
  const bucketCount =
    period === "monthly" ? 4 : period === "threeMonths" ? 3 : 6;
  const monthStart = getCurrentMonthStart();
  const monthEnd = getMonthEndFromStart(monthStart);
  const chartPeriods = Array.from({ length: bucketCount }, (_, index) => ({
    xLabel: period === "monthly" ? `W${index + 1}` : `M${index + 1}`,
    dateLabel: "",
    startDate: period === "monthly" ? monthStart : "",
    endDate: period === "monthly" ? monthEnd : "",
    completed: 0,
    incomplete: 0,
    timeSpentMinutes: 0,
  }));
  const chartData: QuranPastChartItem[] = chartPeriods.map((p) => ({
    xLabel: p.xLabel,
    dateLabel: p.dateLabel,
    completedHours: 0,
    incompleteHours: 0,
    hours: 0,
    stackTotalHours: 0,
  }));
  const slice: MissedRamadanPeriodSlice = {
    chartPeriods,
    targetFasts: 0,
    completedFasts: 0,
    incompleteFasts: 0,
    achievementPercent: 0,
    previousPeriodDeltaPercent: 0,
    dateRangeLabel:
      period === "monthly"
        ? formatPrayerAchievementsDateRange(monthStart, monthEnd)
        : "",
    periodStartDate: period === "monthly" ? monthStart : "",
    periodEndDate: period === "monthly" ? monthEnd : "",
    pageCount: chartPeriods.length,
    activePageIndex: 0,
    completedDates: [],
    incompletePlannedDates: [],
    skippedDates: [],
    upcomingDates: [],
    calendarMonthDate: monthStart,
  };
  return {
    slice,
    achievement: {
      dateRangeLabel: "",
      achievementPercent: 0,
      previousPeriodDeltaPercent: 0,
      goalHours: 0,
      periodGoalHours: 0,
      completedHours: 0,
      incompleteHours: 0,
      activeDays: 0,
      activeDaysPrevious: 0,
      longestStreak: 0,
      longestStreakPrevious: 0,
      pageCount: chartPeriods.length,
      activePageIndex: 0,
      chartData,
      yMax: 3,
      yTicks: [0, 1, 2, 3],
    },
    locked: false,
    keyInsightsHeader: null,
    keyInsights: [],
    canNavigateBack: false,
    canNavigateForward: false,
    periodStart: null,
    periodEnd: null,
    narrative: null,
    totalTimeSpentMinutes: 0,
  };
}

export function mapFastingGoalAchievementsToMissedRamadan(
  data: FastingGoalAchievementsData,
  period: PastAchievementPeriod,
): MappedMissedRamadanAchievements {
  const locked = Boolean(data.locked);
  const rawBuckets = Array.isArray(data.chart?.buckets)
    ? data.chart!.buckets!
    : [];
  const buckets = rawBuckets.filter(bucketHasNumericData);
  const chartPeriods =
    buckets.length > 0
      ? mapBucketsToChartPeriods(buckets)
      : rawBuckets.length > 0
        ? mapBucketsToChartPeriods(rawBuckets)
        : [];

  const calendarDates = mapCalendarDates(data.calendar);
  const completedFromTotals = toFiniteNumber(data.totals?.completed);
  const incompleteFromTotals = toFiniteNumber(data.totals?.incomplete);
  const completedFasts =
    completedFromTotals ??
    chartPeriods.reduce((sum, p) => sum + p.completed, 0);
  const incompleteFasts =
    incompleteFromTotals ??
    chartPeriods.reduce((sum, p) => sum + p.incomplete, 0);
  const goalValue = Math.max(0, toFiniteNumber(data.goal?.value) ?? 0);
  const targetFasts =
    goalValue > 0
      ? goalValue
      : Math.max(completedFasts + incompleteFasts, 0);

  const achievementPercent = Math.round(
    toFiniteNumber(data.achievementPct) ??
      (targetFasts > 0 ? (completedFasts / targetFasts) * 100 : 0),
  );
  const previousPeriodDeltaPercent = getSignedDelta(data.delta);

  let periodStartDate = normalizeDate(data.periodStart);
  let periodEndDate = normalizeDate(data.periodEnd);
  // Locked / empty API payloads omit period dates — fall back so monthly
  // calendar + legend still mount (same as Mon/Thu month grid).
  if (!isValidIsoDate(periodStartDate) || !isValidIsoDate(periodEndDate)) {
    const fromBucketStart = normalizeDate(chartPeriods[0]?.startDate);
    const fromBucketEnd = normalizeDate(
      chartPeriods[chartPeriods.length - 1]?.endDate,
    );
    if (isValidIsoDate(fromBucketStart) && isValidIsoDate(fromBucketEnd)) {
      periodStartDate = fromBucketStart;
      periodEndDate = fromBucketEnd;
    } else if (period === "monthly") {
      periodStartDate = getCurrentMonthStart();
      periodEndDate = getMonthEndFromStart(periodStartDate);
    }
  }

  const dateRangeLabel =
    data.periodLabel?.trim() ||
    (isValidIsoDate(periodStartDate) && isValidIsoDate(periodEndDate)
      ? formatPrayerAchievementsDateRange(periodStartDate, periodEndDate)
      : "");

  const totalTimeSpentMinutes = Math.max(
    0,
    toFiniteNumber(data.timeSpent?.totalMinutes) ??
      chartPeriods.reduce((sum, p) => sum + p.timeSpentMinutes, 0),
  );

  const calendarMonthDate = isValidIsoDate(periodStartDate)
    ? `${periodStartDate.slice(0, 8)}01`
    : getCurrentMonthStart();

  const slice: MissedRamadanPeriodSlice = {
    chartPeriods,
    targetFasts,
    completedFasts: Math.max(0, completedFasts),
    incompleteFasts: Math.max(0, incompleteFasts),
    achievementPercent,
    previousPeriodDeltaPercent,
    dateRangeLabel,
    periodStartDate,
    periodEndDate,
    pageCount: Math.max(chartPeriods.length, 1),
    activePageIndex: Math.max(chartPeriods.length - 1, 0),
    completedDates: calendarDates.completedDates,
    incompletePlannedDates: calendarDates.incompletePlannedDates,
    skippedDates: calendarDates.skippedDates,
    upcomingDates: calendarDates.upcomingDates,
    calendarMonthDate,
  };

  const chartData: QuranPastChartItem[] = chartPeriods.map((p) => {
    const stackTotalHours = p.completed + p.incomplete;
    return {
      xLabel: p.xLabel,
      dateLabel: p.dateLabel,
      completedHours: p.completed,
      incompleteHours: p.incomplete,
      hours: p.completed,
      stackTotalHours,
    };
  });
  const yAxis = computeYAxis(chartData);

  const achievement: QuranHoursPastAchievement = {
    dateRangeLabel,
    achievementPercent,
    previousPeriodDeltaPercent,
    goalHours: targetFasts,
    periodGoalHours:
      chartPeriods.length > 0 ? targetFasts / chartPeriods.length : targetFasts,
    completedHours: Math.max(0, completedFasts),
    incompleteHours: Math.max(0, incompleteFasts),
    activeDays: 0,
    activeDaysPrevious: 0,
    longestStreak: 0,
    longestStreakPrevious: 0,
    pageCount: slice.pageCount,
    activePageIndex: slice.activePageIndex,
    chartData,
    ...yAxis,
  };

  return {
    slice,
    achievement,
    locked,
    keyInsightsHeader: data.keyInsightsHeader?.trim() || null,
    keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : [],
    canNavigateBack: Boolean(
      data.canNavigateBack ?? data.hasPrevious ?? false,
    ),
    canNavigateForward: Boolean(
      data.canNavigateForward ?? data.hasNext ?? false,
    ),
    periodStart: periodStartDate || null,
    periodEnd: periodEndDate || null,
    narrative: data.narrative?.trim() || null,
    totalTimeSpentMinutes,
  };
}

const FASTING_INSIGHT_META: Record<
  string,
  {
    iconFamily: InsightCardData["iconFamily"];
    iconName: string;
    fallbackTitle: string;
  }
> = {
  GOAL_TRACKED: {
    iconFamily: "Ionicons",
    iconName: "calendar-outline",
    fallbackTitle: "GOAL TRACKED",
  },
  LONGEST_STREAK: {
    iconFamily: "Ionicons",
    iconName: "flash",
    fallbackTitle: "LONGEST STREAK",
  },
  MONTHLY_AVERAGE: {
    iconFamily: "MaterialCommunityIcons",
    iconName: "scale-balance",
    fallbackTitle: "MONTHLY AVERAGE",
  },
  WEEKLY_AVERAGE: {
    iconFamily: "MaterialCommunityIcons",
    iconName: "scale-balance",
    fallbackTitle: "WEEKLY AVERAGE",
  },
  TIME_SPENT: {
    iconFamily: "Ionicons",
    iconName: "time-outline",
    fallbackTitle: "TIME SPENT",
  },
  TOTAL_COMPLETED: {
    iconFamily: "Ionicons",
    iconName: "checkmark-circle-outline",
    fallbackTitle: "TOTAL COMPLETED",
  },
};

function isInsightNoDataValue(value: unknown): boolean {
  if (value == null) return true;
  const raw = String(value).trim();
  if (!raw) return true;
  const normalized = raw.replace(/\s+/g, " ");
  return (
    normalized === "--" ||
    normalized === "—" ||
    normalized === "–" ||
    normalized === "- -" ||
    normalized === "– –" ||
    normalized === "— —"
  );
}

function formatInsightDuration(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  return `${Math.floor(safe / 60)}h ${safe % 60}m`;
}

/**
 * Maps fasting achievements `keyInsights[]` into InsightCard rows.
 */
export function mapFastingApiKeyInsightsToCards(
  data: FastingGoalAchievementsData | null | undefined,
  options: {
    period: PastAchievementPeriod;
    noDataLabel: string;
    isLoading?: boolean;
  },
): InsightCardData[] {
  const { period, noDataLabel, isLoading = false } = options;
  const insights = data?.keyInsights;
  const forceNoData = Boolean(data?.locked) || isLoading;

  if (!Array.isArray(insights) || insights.length === 0) {
    return [];
  }

  return insights
    .filter((insight) => {
      const key = String(insight.key ?? "").toUpperCase();
      if (period === "monthly" && key === "GOAL_TRACKED") return false;
      return true;
    })
    .map((insight) => {
      const key = String(insight.key ?? "").toUpperCase();
      const meta = FASTING_INSIGHT_META[key] ?? {
        iconFamily: "Ionicons" as const,
        iconName: "analytics-outline",
        fallbackTitle: key || "INSIGHT",
      };
      const title = insight.label?.trim() || meta.fallbackTitle;
      const unit = insight.unit?.trim() || undefined;
      const previousLabel = insight.previousLabel?.trim() || undefined;
      const direction = String(insight.direction ?? "").toUpperCase();
      const noData = forceNoData || isInsightNoDataValue(insight.value);

      if (noData) {
        return {
          iconFamily: meta.iconFamily,
          iconName: meta.iconName,
          title,
          value: "--",
          noData: true,
          footerText: previousLabel || noDataLabel,
          footerNeutral: true,
        } satisfies InsightCardData;
      }

      const numericValue = toFiniteNumber(insight.value);
      const displayValue =
        key === "TIME_SPENT" &&
        numericValue != null &&
        !String(insight.value).match(/[hm]/i)
          ? formatInsightDuration(numericValue)
          : String(insight.value);

      const card: InsightCardData = {
        iconFamily: meta.iconFamily,
        iconName: meta.iconName,
        title,
        value: displayValue,
        subValue: unit,
      };

      if (direction === "UP" || direction === "DOWN") {
        if (previousLabel) {
          card.trendValue = previousLabel;
          card.trendDirection = direction === "UP" ? "up" : "down";
        }
      } else if (previousLabel) {
        card.footerText = previousLabel;
        card.footerNeutral = true;
      }

      return card;
    });
}

export function shiftFastingAchievementsPeriodStart(
  periodStart: string | null | undefined,
  periodEnd: string | null | undefined,
  direction: -1 | 1,
): string | null {
  const start = normalizeDate(periodStart);
  const end = normalizeDate(periodEnd);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end)
  ) {
    return null;
  }
  const startMs = Date.parse(`${start}T12:00:00`);
  const endMs = Date.parse(`${end}T12:00:00`);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  const spanDays = Math.max(
    1,
    Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1,
  );
  const next = new Date(startMs);
  next.setDate(next.getDate() + direction * spanDays);
  return next.toISOString().slice(0, 10);
}
