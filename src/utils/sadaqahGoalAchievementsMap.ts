import type { InsightCardData } from "@/components/molecules/PrayerPastAchievements/insightCardsData";
import type {
  SadaqahAchievementsBucket,
  SadaqahGoalAchievementsData,
} from "@/src/api/queries/useGetSadaqahGoalAchievements";
import type {
  SadaqahPastAchievement,
  SadaqahPastChartItem,
} from "@/src/screens/private/goalprogressloggingscreen/sadaqahPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  buildEmptyPastAchievementPeriodScaffold,
  formatPrayerAchievementsDateRange,
} from "@/src/utils/prayerGoalAchievementsMap";

/** Empty x-axis shell while achievements load (same gate as prayer). */
export function createEmptySadaqahPastAchievement(
  period: PastAchievementPeriod = "monthly",
): SadaqahPastAchievement {
  const scaffold = buildEmptyPastAchievementPeriodScaffold(period);
  const chartData: SadaqahPastChartItem[] = scaffold.chartData.map((item) => ({
    ...item,
    completedAmount: 0,
    incompleteAmount: 0,
    stackTotalAmount: 0,
    completedHours: 0,
    incompleteHours: 0,
    hours: 0,
    stackTotalHours: 0,
    timeSpentMinutes: 0,
  })) as SadaqahPastChartItem[];

  return {
    dateRangeLabel: scaffold.dateRangeLabel,
    achievementPercent: 0,
    previousPeriodDeltaPercent: 0,
    chartData,
    goalAmount: 0,
    periodGoalAmount: 0,
    completedAmount: 0,
    incompleteAmount: 0,
    totalTimeSpentMinutes: 0,
    yMax: 1,
    yTicks: [0, 1],
    pageCount: Math.max(1, chartData.length),
    activePageIndex: 0,
  };
}

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

function getSignedDelta(delta: SadaqahGoalAchievementsData["delta"]): number {
  if (delta == null) return 0;
  const pct = toFiniteNumber(delta.pct) ?? 0;
  const direction = String(delta.direction ?? "").toUpperCase();
  if (direction === "DOWN") return -Math.abs(pct);
  if (direction === "UP") return Math.abs(pct);
  return pct;
}

function computeYAxis(chartData: SadaqahPastChartItem[]) {
  const maxStack = Math.max(
    ...chartData.map((item) => item.stackTotalAmount),
    0,
  );
  const yMax = Math.max(10, Math.ceil(maxStack / 5) * 5);
  const step = yMax <= 15 ? 5 : yMax <= 25 ? 5 : yMax <= 100 ? 25 : 50;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

function bucketHasNumericData(bucket: SadaqahAchievementsBucket): boolean {
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

function mapBucketsToChartData(
  buckets: SadaqahAchievementsBucket[],
): SadaqahPastChartItem[] {
  return buckets.map((bucket, index) => {
    const start = normalizeDate(bucket.start);
    const end = normalizeDate(bucket.end);
    const label = bucket.label?.trim() || `W${index + 1}`;
    const completedAmount = Math.max(0, toFiniteNumber(bucket.completed) ?? 0);
    const incompleteAmount = Math.max(
      0,
      toFiniteNumber(bucket.incomplete) ?? 0,
    );
    const stackTotalAmount = completedAmount + incompleteAmount;
    const timeSpentMinutes = Math.max(0, toFiniteNumber(bucket.minutes) ?? 0);
    const dateLabel =
      start && end ? formatPrayerAchievementsDateRange(start, end) : label;

    return {
      xLabel: label,
      dateLabel,
      completedHours: completedAmount,
      incompleteHours: incompleteAmount,
      hours: completedAmount,
      stackTotalHours: stackTotalAmount,
      completedAmount,
      incompleteAmount,
      stackTotalAmount,
      timeSpentMinutes,
    } as SadaqahPastChartItem;
  });
}

export type MappedSadaqahAchievements = {
  achievement: SadaqahPastAchievement;
  currencyCode: string;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  periodStart: string | null;
  periodEnd: string | null;
  keyInsightsHeader: string | null;
  locked: boolean;
  narrative: string | null;
};

export function mapSadaqahGoalAchievementsToUi(
  data: SadaqahGoalAchievementsData,
  period: PastAchievementPeriod,
): MappedSadaqahAchievements {
  const locked = Boolean(data.locked);
  const rawBuckets = Array.isArray(data.chart?.buckets)
    ? data.chart!.buckets!
    : [];
  const buckets = rawBuckets.filter(bucketHasNumericData);
  // Locked / all-null shell buckets must not become dummy bars.
  const chartData =
    locked || buckets.length === 0
      ? []
      : mapBucketsToChartData(buckets);

  const completedFromTotals = toFiniteNumber(data.totals?.completed);
  const incompleteFromTotals = toFiniteNumber(data.totals?.incomplete);
  const completedAmount =
    completedFromTotals ??
    chartData.reduce((sum, item) => sum + item.completedAmount, 0);
  const incompleteAmount =
    incompleteFromTotals ??
    chartData.reduce((sum, item) => sum + item.incompleteAmount, 0);
  const goalAmount = Math.max(
    0,
    toFiniteNumber(data.goal?.value) ?? completedAmount + incompleteAmount,
  );
  const periodGoalAmount =
    chartData.length > 0 ? goalAmount / chartData.length : goalAmount;

  const achievementPercent = Math.round(
    toFiniteNumber(data.achievementPct) ??
      (goalAmount > 0 ? (completedAmount / goalAmount) * 100 : 0),
  );
  const previousPeriodDeltaPercent = getSignedDelta(data.delta);

  const periodStart = normalizeDate(data.periodStart) || null;
  const periodEnd = normalizeDate(data.periodEnd) || null;
  const dateRangeLabel =
    data.periodLabel?.trim() ||
    (periodStart && periodEnd
      ? formatPrayerAchievementsDateRange(periodStart, periodEnd)
      : period === "monthly"
        ? "This month"
        : period === "threeMonths"
          ? "Last 3 months"
          : "Last 6 months");

  const totalTimeSpentMinutes = Math.max(
    0,
    toFiniteNumber(data.timeSpent?.totalMinutes) ??
      chartData.reduce(
        (sum, item) => sum + (Number((item as any).timeSpentMinutes) || 0),
        0,
      ),
  );

  const yAxis = computeYAxis(chartData);

  return {
    achievement: {
      dateRangeLabel,
      achievementPercent,
      previousPeriodDeltaPercent,
      chartData,
      goalAmount,
      periodGoalAmount,
      completedAmount,
      incompleteAmount,
      totalTimeSpentMinutes,
      yMax: yAxis.yMax,
      yTicks: yAxis.yTicks,
      pageCount: Math.max(1, chartData.length),
      activePageIndex: 0,
    },
    currencyCode: (data.currencyCode || "USD").trim().toUpperCase(),
    canNavigateBack: Boolean(
      data.canNavigateBack ?? data.hasPrevious ?? false,
    ),
    canNavigateForward: Boolean(
      data.canNavigateForward ?? data.hasNext ?? false,
    ),
    periodStart,
    periodEnd,
    keyInsightsHeader: data.keyInsightsHeader?.trim() || null,
    locked,
    narrative: data.narrative?.trim() || null,
  };
}

const SADAQAH_INSIGHT_META: Record<
  string,
  {
    iconFamily: InsightCardData["iconFamily"];
    iconName: string;
    fallbackTitle: string;
  }
> = {
  COMPLETED_IN: {
    iconFamily: "Ionicons",
    iconName: "checkmark-circle-outline",
    fallbackTitle: "COMPLETED IN",
  },
  ACTIVE_DAYS: {
    iconFamily: "Ionicons",
    iconName: "checkmark-circle-outline",
    fallbackTitle: "COMPLETED IN",
  },
  LONGEST_STREAK: {
    iconFamily: "Ionicons",
    iconName: "flash",
    fallbackTitle: "LONGEST STREAK",
  },
  PERSONAL_BEST: {
    iconFamily: "Ionicons",
    iconName: "sparkles",
    fallbackTitle: "PERSONAL BEST",
  },
  BEST_DAY: {
    iconFamily: "Ionicons",
    iconName: "sparkles",
    fallbackTitle: "BEST DAY",
  },
  WEEKLY_AVERAGE: {
    iconFamily: "MaterialCommunityIcons",
    iconName: "scale-balance",
    fallbackTitle: "WEEKLY AVERAGE",
  },
  MONTHLY_AVERAGE: {
    iconFamily: "MaterialCommunityIcons",
    iconName: "scale-balance",
    fallbackTitle: "MONTHLY AVERAGE",
  },
  TIME_SPENT: {
    iconFamily: "Ionicons",
    iconName: "time-outline",
    fallbackTitle: "TIME SPENT",
  },
  GOAL_TRACKED: {
    iconFamily: "Ionicons",
    iconName: "calendar-outline",
    fallbackTitle: "GOAL TRACKED",
  },
};

/** Skeleton keys while achievements (and keyInsights) are still loading. */
const DEFAULT_SADAQAH_INSIGHT_KEYS = [
  "GOAL_TRACKED",
  "COMPLETED_IN",
  "LONGEST_STREAK",
  "BEST_DAY",
  "WEEKLY_AVERAGE",
  "MONTHLY_AVERAGE",
  "TIME_SPENT",
] as const;

function isInsightNoDataValue(value: unknown): boolean {
  if (value == null) return true;
  const raw = String(value).trim();
  if (!raw) return true;
  return raw === "--" || raw === "—" || raw.toLowerCase() === "n/a";
}

function formatInsightDuration(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function buildSadaqahInsightPlaceholderCards(
  period: PastAchievementPeriod,
  noDataLabel: string,
): InsightCardData[] {
  const keys =
    period === "monthly"
      ? DEFAULT_SADAQAH_INSIGHT_KEYS.filter(
          (key) => key !== "GOAL_TRACKED" && key !== "MONTHLY_AVERAGE",
        )
      : DEFAULT_SADAQAH_INSIGHT_KEYS.filter((key) => key !== "WEEKLY_AVERAGE");

  return keys.map((key) => {
    const meta = SADAQAH_INSIGHT_META[key];
    return {
      iconFamily: meta.iconFamily,
      iconName: meta.iconName,
      title: meta.fallbackTitle,
      value: "--",
      noData: true,
      footerText: noDataLabel,
      footerNeutral: true,
    } satisfies InsightCardData;
  });
}

export function mapSadaqahApiKeyInsightsToCards(
  data: SadaqahGoalAchievementsData | null | undefined,
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
    // Match Quran hours: keep insight row visible with -- placeholders while loading.
    return isLoading
      ? buildSadaqahInsightPlaceholderCards(period, noDataLabel)
      : [];
  }

  return insights
    .filter((insight) => {
      const key = String(insight.key ?? "").toUpperCase();
      if (period === "monthly" && key === "GOAL_TRACKED") return false;
      return true;
    })
    .map((insight) => {
      const key = String(insight.key ?? "").toUpperCase();
      const meta = SADAQAH_INSIGHT_META[key] ?? {
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

export function shiftSadaqahAchievementsPeriodStart(
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
