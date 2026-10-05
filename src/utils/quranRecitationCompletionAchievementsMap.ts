import type {
  QuranAchievementsBucket,
  QuranGoalAchievementsData,
} from "@/src/api/queries/useGetQuranGoalAchievements";
import {
  completionJuzCountToVerses,
  TOTAL_QURAN_VERSES,
  type CompletionPastAchievementRecord,
  type CompletionPeriodSlice,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { QuranPastChartItem } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  createEmptyQuranHoursAchievement,
  getQuranAchievementsSignedDelta,
  type MappedQuranHoursAchievements,
} from "@/src/utils/quranHoursGoalAchievementsMap";
import {
  buildEmptyPastAchievementPeriodScaffold,
  buildPastAchievementSlotDateLabel,
  formatPrayerAchievementsDateRange,
  formatSixMonthChartBarDateLabel,
} from "@/src/utils/prayerGoalAchievementsMap";
import {
  getJuzRangeFromDetail,
  type QuranGoalDetail,
} from "@/src/utils/quranGoalMap";

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
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

function isPlaceholderSlotLabel(label: string): boolean {
  return /^[WwMm]\d+$/.test(label.trim());
}

function bucketDateLabel(
  bucket: QuranAchievementsBucket,
  period: PastAchievementPeriod,
  index: number,
  periodStart?: string | null,
): string {
  const raw = (bucket.range || bucket.label || "").trim();
  if (raw && !isPlaceholderSlotLabel(raw)) {
    if (period === "sixMonths") {
      return formatSixMonthChartBarDateLabel(raw.replace(/\s*[–—]\s*/g, "—"));
    }
    return raw;
  }

  const fromDates = formatPrayerAchievementsDateRange(
    bucket.start,
    bucket.end,
  );
  if (fromDates) {
    if (period === "threeMonths" || period === "sixMonths") {
      return buildPastAchievementSlotDateLabel(period, index, periodStart);
    }
    return fromDates;
  }

  return buildPastAchievementSlotDateLabel(period, index, periodStart);
}

/** RECITATION_COMPLETION buckets use completion counts (aggregate). */
function bucketCompletedUnits(bucket: QuranAchievementsBucket): number {
  return Math.max(
    0,
    toFiniteNumber(bucket.completedVerses) ??
      toFiniteNumber(bucket.completedAyahs) ??
      toFiniteNumber(bucket.completedMinutes) ??
      0,
  );
}

function bucketIncompleteUnits(bucket: QuranAchievementsBucket): number {
  return Math.max(
    0,
    toFiniteNumber(bucket.incompleteVerses) ??
      toFiniteNumber(bucket.incompleteAyahs) ??
      toFiniteNumber(bucket.incompleteMinutes) ??
      0,
  );
}

function bucketTimeSpentMinutes(bucket: QuranAchievementsBucket): number {
  return Math.max(0, toFiniteNumber(bucket.timeSpentMinutes) ?? 0);
}

function mapBucketsToChart(
  buckets: QuranAchievementsBucket[],
  period: PastAchievementPeriod,
  periodStart?: string | null,
): QuranPastChartItem[] {
  const prefix = period === "monthly" ? "w" : "m";

  return buckets.map((bucket, index) => {
    const completed = bucketCompletedUnits(bucket);
    const incomplete = bucketIncompleteUnits(bucket);
    return {
      xLabel: `${prefix}${index + 1}`,
      dateLabel: bucketDateLabel(bucket, period, index, periodStart),
      completedHours: completed,
      incompleteHours: incomplete,
      hours: completed,
      stackTotalHours: completed + incomplete,
      completedMinutes: completed,
      incompleteMinutes: incomplete,
      narrative: bucket.narrative ?? undefined,
      achievementPct: toFiniteNumber(bucket.achievementPct) ?? undefined,
    };
  });
}

export type MappedRecitationCompletionAchievements = {
  achievement: MappedQuranHoursAchievements;
  slice: CompletionPeriodSlice;
};

export function getRecitationCompletionTargetFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number {
  const fromGoal = toFiniteNumber(detail?.targetValue);
  if (fromGoal != null && fromGoal > 0) return Math.round(fromGoal);
  return 1;
}

export function createEmptyRecitationCompletionAchievements(
  period: PastAchievementPeriod = "monthly",
  targetCompletions: number = 1,
): MappedRecitationCompletionAchievements {
  const scaffold = buildEmptyPastAchievementPeriodScaffold(period);
  const achievement = {
    ...createEmptyQuranHoursAchievement(),
    dateRangeLabel: scaffold.dateRangeLabel,
    chartData: scaffold.chartData,
    pageCount: scaffold.chartData.length > 0 ? 1 : 0,
  };
  return {
    achievement,
    slice: {
      chartPeriods: scaffold.chartData.map((item) => ({
        xLabel: item.xLabel,
        dateLabel: item.dateLabel,
        completed: 0,
        incomplete: 0,
        timeSpentMinutes: 0,
      })),
      targetCompletions: Math.max(1, targetCompletions),
      completedCompletions: 0,
      achievementPercent: 0,
      previousPeriodDeltaPercent: 0,
      dateRangeLabel: scaffold.dateRangeLabel,
      pageCount: 1,
      activePageIndex: 0,
      completions: [],
    },
  };
}

function buildCompletionRecordsFromDetail(
  detail: QuranGoalDetail | null | undefined,
): CompletionPastAchievementRecord[] {
  const range = getJuzRangeFromDetail(detail);
  const startJuz = range?.start ?? 1;
  const endJuz = range?.end ?? 30;
  const totalJuzCount = Math.max(1, endJuz - startJuz + 1);

  return (detail?.items ?? []).map((item, index) => {
    const completedJuzCount = Math.max(
      0,
      toFiniteNumber(item.completedCount) ?? 0,
    );
    const status =
      item.status === "completed" || item.status === "achieved"
        ? ("completed" as const)
        : ("incomplete" as const);
    const cappedCompleted = Math.min(totalJuzCount, completedJuzCount);
    return {
      completionNumber: index + 1,
      startJuz,
      endJuz,
      completedJuzCount: cappedCompleted,
      totalJuzCount,
      completedVerses: completionJuzCountToVerses(
        cappedCompleted,
        totalJuzCount,
      ),
      totalVerses: TOTAL_QURAN_VERSES,
      status,
      timeSpentMinutes: 0,
    };
  });
}

export function mapRecitationCompletionAchievementsToUi(
  data: QuranGoalAchievementsData,
  period: PastAchievementPeriod,
  options?: {
    detail?: QuranGoalDetail | null;
  },
): MappedRecitationCompletionAchievements {
  const detail = options?.detail;
  const buckets = data.chart?.buckets ?? [];
  let chartData = mapBucketsToChart(buckets, period, data.periodStart);
  if (chartData.length === 0) {
    chartData = buildEmptyPastAchievementPeriodScaffold(period).chartData;
  }

  const completedUnits = Math.max(
    0,
    toFiniteNumber(data.totals?.completedVerses) ??
      toFiniteNumber(data.totals?.completedAyahs) ??
      toFiniteNumber(data.totals?.completedMinutes) ??
      chartData.reduce((sum, item) => sum + item.completedHours, 0),
  );
  const incompleteUnits = Math.max(
    0,
    toFiniteNumber(data.totals?.incompleteVerses) ??
      toFiniteNumber(data.totals?.incompleteAyahs) ??
      toFiniteNumber(data.totals?.incompleteMinutes) ??
      chartData.reduce((sum, item) => sum + item.incompleteHours, 0),
  );
  const goalUnits = Math.max(
    0,
    toFiniteNumber(data.goal?.value) ??
      toFiniteNumber(buckets[0]?.goalAyahs) ??
      toFiniteNumber(buckets[0]?.goalMinutes) ??
      getRecitationCompletionTargetFromDetail(detail),
  );

  const yAxis = computeYAxis(
    chartData.map((item) => item.stackTotalHours),
    data.chart?.yAxisMax,
  );

  const dateRangeLabel =
    data.periodLabel?.trim() ||
    formatPrayerAchievementsDateRange(data.periodStart, data.periodEnd) ||
    formatPrayerAchievementsDateRange(
      buckets[0]?.start,
      buckets[buckets.length - 1]?.end,
    ) ||
    buildEmptyPastAchievementPeriodScaffold(period).dateRangeLabel;

  const chartPeriods = (buckets.length > 0 ? buckets : []).map(
    (bucket, index) => ({
      xLabel: chartData[index]?.xLabel ?? `b${index + 1}`,
      dateLabel:
        chartData[index]?.dateLabel ??
        bucketDateLabel(bucket, period, index, data.periodStart),
      completed: bucketCompletedUnits(bucket),
      incomplete: bucketIncompleteUnits(bucket),
      timeSpentMinutes: bucketTimeSpentMinutes(bucket),
    }),
  );

  const normalizedChartPeriods =
    chartPeriods.length > 0
      ? chartPeriods
      : chartData.map((item) => ({
          xLabel: item.xLabel,
          dateLabel: item.dateLabel,
          completed: item.completedHours,
          incomplete: item.incompleteHours,
          timeSpentMinutes: 0,
        }));

  const targetCompletions = Math.max(1, Math.round(goalUnits) || 1);
  const completedCompletions = Math.min(
    targetCompletions,
    Math.round(completedUnits),
  );

  const achievementPercent = Math.round(
    toFiniteNumber(data.achievementPct) ??
      (targetCompletions > 0
        ? (completedCompletions / targetCompletions) * 100
        : 0),
  );
  const previousPeriodDeltaPercent = getQuranAchievementsSignedDelta(
    data.delta,
  );

  const achievement: MappedQuranHoursAchievements = {
    dateRangeLabel,
    achievementPercent,
    previousPeriodDeltaPercent,
    chartData,
    goalHours: targetCompletions,
    periodGoalHours:
      chartData.length > 0 ? targetCompletions / chartData.length : targetCompletions,
    completedHours: completedUnits,
    incompleteHours: incompleteUnits,
    activeDays: 0,
    activeDaysPrevious: 0,
    longestStreak: 0,
    longestStreakPrevious: 0,
    ...yAxis,
    pageCount: chartData.length > 0 ? 1 : 0,
    activePageIndex: 0,
    narrative: data.narrative ?? null,
    keyInsightsHeader: data.keyInsightsHeader ?? null,
    keyInsights: data.keyInsights ?? null,
    completedMinutes: completedUnits,
    incompleteMinutes: incompleteUnits,
    canNavigateBack: data.canNavigateBack ?? data.hasPrevious ?? false,
    canNavigateForward: data.canNavigateForward ?? data.hasNext ?? false,
    periodStart: data.periodStart ?? "",
    periodEnd: data.periodEnd ?? "",
  };

  const completionsFromDetail = buildCompletionRecordsFromDetail(detail);

  const slice: CompletionPeriodSlice = {
    chartPeriods: normalizedChartPeriods,
    targetCompletions,
    completedCompletions,
    achievementPercent,
    previousPeriodDeltaPercent,
    dateRangeLabel,
    pageCount: 1,
    activePageIndex: 0,
    completions: completionsFromDetail,
  };

  return { achievement, slice };
}
