import type {
  QuranAchievementsBucket,
  QuranAchievementsDelta,
  QuranAchievementsKeyInsight,
  QuranGoalAchievementsData,
} from "@/src/api/queries/useGetQuranGoalAchievements";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type {
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  formatPrayerAchievementsDateRange,
  formatSixMonthChartBarDateLabel,
} from "@/src/utils/prayerGoalAchievementsMap";
import type { InsightCardData } from "@/components/molecules/PrayerPastAchievements/insightCardsData";

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function minutesToHours(minutes: number): number {
  return Math.max(0, minutes) / 60;
}

/** Signed % delta for the badge (DOWN → negative). */
export function getQuranAchievementsSignedDelta(
  delta: QuranAchievementsDelta | undefined,
): number {
  if (delta == null) return 0;
  const pct = Math.abs(toFiniteNumber(delta.pct) ?? 0);
  const direction = String(delta.direction ?? "").toUpperCase();
  if (direction === "DOWN") return -pct;
  if (direction === "UP") return pct;
  return pct === 0 ? 0 : pct;
}

function computeYAxis(stackTotals: number[], apiYMax?: number | null) {
  const maxStack = Math.max(...stackTotals, 0);
  const fromApi = toFiniteNumber(apiYMax);
  const yMax = Math.max(
    fromApi != null && fromApi > 0 ? fromApi : 0,
    Math.max(1, Math.ceil(maxStack / 5) * 5 || 1),
  );
  const step = yMax <= 1 ? 1 : yMax <= 15 ? 5 : yMax <= 25 ? 5 : 10;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  if (yTicks[yTicks.length - 1] < yMax) yTicks.push(yMax);
  return { yMax, yTicks };
}

function bucketDateLabel(
  bucket: QuranAchievementsBucket,
  period: PastAchievementPeriod,
): string {
  const raw = (bucket.range || bucket.label || "").trim();
  if (!raw) {
    return formatPrayerAchievementsDateRange(bucket.start, bucket.end);
  }
  if (period === "sixMonths") {
    return formatSixMonthChartBarDateLabel(raw.replace(/\s*[–—]\s*/g, "—"));
  }
  return raw;
}

function mapBucketsToChart(
  buckets: QuranAchievementsBucket[],
  period: PastAchievementPeriod,
): QuranPastChartItem[] {
  const prefix = period === "monthly" ? "w" : "m";

  return buckets.map((bucket, index) => {
    const completedMinutes = Math.max(
      0,
      toFiniteNumber(bucket.completedMinutes) ?? 0,
    );
    const incompleteMinutes = Math.max(
      0,
      toFiniteNumber(bucket.incompleteMinutes) ?? 0,
    );
    const completedHours = minutesToHours(completedMinutes);
    const incompleteHours = minutesToHours(incompleteMinutes);
    const stackTotalHours = completedHours + incompleteHours;

    return {
      xLabel: `${prefix}${index + 1}`,
      dateLabel: bucketDateLabel(bucket, period),
      completedHours,
      incompleteHours,
      hours: completedHours,
      stackTotalHours,
      completedMinutes,
      incompleteMinutes,
      narrative: bucket.narrative ?? undefined,
      achievementPct: toFiniteNumber(bucket.achievementPct) ?? undefined,
    };
  });
}

export type MappedQuranHoursAchievements = QuranHoursPastAchievement & {
  narrative?: string | null;
  keyInsightsHeader?: string | null;
  keyInsights?: QuranAchievementsKeyInsight[] | null;
  completedMinutes: number;
  incompleteMinutes: number;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  periodStart: string;
  periodEnd: string;
};

export function createEmptyQuranHoursAchievement(): MappedQuranHoursAchievements {
  return {
    dateRangeLabel: "---",
    achievementPercent: 0,
    previousPeriodDeltaPercent: 0,
    chartData: [],
    goalHours: 0,
    periodGoalHours: 0,
    completedHours: 0,
    incompleteHours: 0,
    activeDays: 0,
    activeDaysPrevious: 0,
    longestStreak: 0,
    longestStreakPrevious: 0,
    yMax: 1,
    yTicks: [0, 1],
    pageCount: 1,
    activePageIndex: 0,
    narrative: null,
    keyInsightsHeader: null,
    keyInsights: null,
    completedMinutes: 0,
    incompleteMinutes: 0,
    canNavigateBack: false,
    canNavigateForward: false,
    periodStart: "",
    periodEnd: "",
  };
}

export function mapQuranGoalAchievementsToUi(
  data: QuranGoalAchievementsData,
  period: PastAchievementPeriod,
): MappedQuranHoursAchievements {
  const buckets = data.chart?.buckets ?? [];
  const chartData = mapBucketsToChart(buckets, period);
  const goalHours = Math.max(0, toFiniteNumber(data.goal?.value) ?? 0);
  const completedMinutes = Math.max(
    0,
    toFiniteNumber(data.totals?.completedMinutes) ??
      chartData.reduce((sum, item) => sum + (item.completedMinutes ?? 0), 0),
  );
  const incompleteMinutes = Math.max(
    0,
    toFiniteNumber(data.totals?.incompleteMinutes) ??
      chartData.reduce((sum, item) => sum + (item.incompleteMinutes ?? 0), 0),
  );
  const completedHours = minutesToHours(completedMinutes);
  const incompleteHours = minutesToHours(incompleteMinutes);
  const periodGoalHours =
    chartData.length > 0 ? goalHours / chartData.length : goalHours;
  const yAxis = computeYAxis(
    chartData.map((item) => item.stackTotalHours),
    data.chart?.yAxisMax,
  );

  const dateRangeLabel =
    data.periodLabel?.trim() ||
    formatPrayerAchievementsDateRange(data.periodStart, data.periodEnd);

  return {
    dateRangeLabel,
    achievementPercent: Math.round(toFiniteNumber(data.achievementPct) ?? 0),
    previousPeriodDeltaPercent: getQuranAchievementsSignedDelta(data.delta),
    chartData,
    goalHours,
    periodGoalHours,
    completedHours,
    incompleteHours,
    activeDays: 0,
    activeDaysPrevious: 0,
    longestStreak: 0,
    longestStreakPrevious: 0,
    ...yAxis,
    pageCount: 1,
    activePageIndex: 0,
    narrative: data.narrative ?? null,
    keyInsightsHeader: data.keyInsightsHeader ?? null,
    keyInsights: data.keyInsights ?? null,
    completedMinutes,
    incompleteMinutes,
    canNavigateBack: data.canNavigateBack ?? data.hasPrevious ?? false,
    canNavigateForward: data.canNavigateForward ?? data.hasNext ?? false,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
  };
}

const QURAN_HOURS_INSIGHT_META: Record<
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
  COMPLETED_IN: {
    iconFamily: "Ionicons",
    iconName: "checkmark-circle-outline",
    fallbackTitle: "COMPLETED IN",
  },
  LONGEST_STREAK: {
    iconFamily: "Ionicons",
    iconName: "flash",
    fallbackTitle: "LONGEST STREAK",
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
  TOTAL_LISTENING_TIME: {
    iconFamily: "Ionicons",
    iconName: "time-outline",
    fallbackTitle: "TOTAL LISTENING TIME",
  },
  TIME_SPENT: {
    iconFamily: "Ionicons",
    iconName: "time-outline",
    fallbackTitle: "TIME SPENT",
  },
};

const DEFAULT_QURAN_HOURS_INSIGHT_KEYS = [
  "GOAL_TRACKED",
  "COMPLETED_IN",
  "LONGEST_STREAK",
  "BEST_DAY",
  "WEEKLY_AVERAGE",
  "MONTHLY_AVERAGE",
  "TIME_SPENT",
] as const;

const TIME_SPENT_INSIGHT_KEYS = new Set(["TIME_SPENT", "TOTAL_LISTENING_TIME"]);

function formatQuranInsightDuration(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  return `${Math.floor(safe / 60)}h ${safe % 60}m`;
}

function resolveTimeSpentMinutes(
  data: QuranGoalAchievementsData | null | undefined,
): number | null {
  if (!data) return null;
  const fromTotals = toFiniteNumber(data.totals?.timeSpentMinutes);
  if (fromTotals != null) return Math.max(0, fromTotals);

  const buckets = data.chart?.buckets;
  if (!Array.isArray(buckets) || buckets.length === 0) return null;

  let sum = 0;
  let sawAny = false;
  for (const bucket of buckets) {
    const minutes = toFiniteNumber(bucket.timeSpentMinutes);
    if (minutes == null) continue;
    sum += Math.max(0, minutes);
    sawAny = true;
  }
  return sawAny ? sum : null;
}

function buildTimeSpentInsightFallback(
  data: QuranGoalAchievementsData | null | undefined,
  noDataLabel: string,
  forceNoData = false,
): InsightCardData {
  const minutes = resolveTimeSpentMinutes(data);
  const hasValue = minutes != null && !forceNoData;
  return mapSingleQuranInsightToCard(
    {
      key: "TIME_SPENT",
      label: QURAN_HOURS_INSIGHT_META.TIME_SPENT.fallbackTitle,
      value: hasValue ? formatQuranInsightDuration(minutes) : "– –",
      unit: "",
      previousLabel: noDataLabel,
      direction: "NEUTRAL",
    },
    noDataLabel,
    !hasValue,
  );
}

function isQuranInsightNoDataValue(value: unknown): boolean {
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
    normalized === "— —" ||
    normalized.includes("–") ||
    normalized.includes("—")
  );
}

function mapSingleQuranInsightToCard(
  insight: QuranAchievementsKeyInsight,
  noDataLabel: string,
  forceNoData = false,
): InsightCardData {
  const key = String(insight.key ?? "").toUpperCase();
  const meta = QURAN_HOURS_INSIGHT_META[key] ?? {
    iconFamily: "Ionicons" as const,
    iconName: "analytics-outline",
    fallbackTitle: key || "INSIGHT",
  };
  const title = insight.label?.trim() || meta.fallbackTitle;
  const unit = insight.unit?.trim() || undefined;
  const previousLabel = insight.previousLabel?.trim() || undefined;
  const direction = String(insight.direction ?? "").toUpperCase();
  const noData = forceNoData || isQuranInsightNoDataValue(insight.value);

  if (noData) {
    return {
      iconFamily: meta.iconFamily,
      iconName: meta.iconName,
      title,
      value: "--",
      noData: true,
      footerText: previousLabel || noDataLabel,
      footerNeutral: true,
    };
  }

  const numericValue = toFiniteNumber(insight.value);
  const displayValue =
    TIME_SPENT_INSIGHT_KEYS.has(key) &&
    numericValue != null &&
    !String(insight.value).match(/[hm]/i)
      ? formatQuranInsightDuration(numericValue)
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
}

/**
 * Maps LISTENING / TAJWEED / memorisation achievements `keyInsights[]` into
 * InsightCard rows (same UI contract as prayer past achievements).
 * Always includes a TIME SPENT card (from keyInsights or totals fallback).
 */
export function mapQuranApiKeyInsightsToCards(
  data: QuranGoalAchievementsData | null | undefined,
  options: {
    period: PastAchievementPeriod;
    noDataLabel: string;
    isLoading?: boolean;
  },
): InsightCardData[] {
  const { period, noDataLabel, isLoading = false } = options;
  const insights = data?.keyInsights;

  if (Array.isArray(insights) && insights.length > 0 && !isLoading) {
    const cards = insights
      .filter((insight) => {
        const key = String(insight.key ?? "").toUpperCase();
        // Match prayer: hide GOAL TRACKED on the monthly window.
        if (period === "monthly" && key === "GOAL_TRACKED") return false;
        return true;
      })
      .map((insight) => mapSingleQuranInsightToCard(insight, noDataLabel));

    const hasTimeSpent = insights.some((insight) =>
      TIME_SPENT_INSIGHT_KEYS.has(String(insight.key ?? "").toUpperCase()),
    );
    if (!hasTimeSpent) {
      cards.push(buildTimeSpentInsightFallback(data, noDataLabel));
    }
    return cards;
  }

  const placeholderKeys =
    period === "monthly"
      ? DEFAULT_QURAN_HOURS_INSIGHT_KEYS.filter(
          (key) => key !== "GOAL_TRACKED" && key !== "MONTHLY_AVERAGE",
        )
      : DEFAULT_QURAN_HOURS_INSIGHT_KEYS.filter(
          (key) => key !== "WEEKLY_AVERAGE",
        );

  return placeholderKeys.map((key) =>
    mapSingleQuranInsightToCard(
      {
        key,
        label: QURAN_HOURS_INSIGHT_META[key]?.fallbackTitle ?? key,
        value: "– –",
        unit: "",
        previousLabel: noDataLabel,
        direction: "NEUTRAL",
      },
      noDataLabel,
      true,
    ),
  );
}
