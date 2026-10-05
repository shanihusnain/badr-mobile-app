import type {
  QuranAchievementsBucket,
  QuranGoalAchievementsData,
} from "@/src/api/queries/useGetQuranGoalAchievements";
import type {
  JuzFilterId,
  JuzPastAchievementFilter,
  JuzPastAchievementRecord,
  JuzPeriodSlice,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationJuzPastAchievementData";
import { getJuzVerseCountFromMap } from "@/src/screens/private/goalprogressloggingscreen/quranJuzVerseMap";
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
import { getJuzRangeFromDetail, getSelectedJuzIdsFromDetail } from "@/src/utils/quranGoalMap";
import type { QuranGoalDetail } from "@/src/utils/quranGoalMap";

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

/** RECITATION_JUZ buckets are stated in juz (aggregate) or verses (item). */
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

export type MappedRecitationJuzAchievements = {
  achievement: MappedQuranHoursAchievements;
  slice: JuzPeriodSlice;
};

export function createEmptyRecitationJuzAchievements(
  period: PastAchievementPeriod = "monthly",
  juzRange: { startJuz: number; endJuz: number } = { startJuz: 1, endJuz: 1 },
): MappedRecitationJuzAchievements {
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
      targetJuzCount: Math.max(1, juzRange.endJuz - juzRange.startJuz + 1),
      completedJuzCount: 0,
      juzRange,
      achievementPercent: 0,
      previousPeriodDeltaPercent: 0,
      dateRangeLabel: scaffold.dateRangeLabel,
      pageCount: 1,
      activePageIndex: 0,
      juzRecords: [],
      perJuz: {},
    },
  };
}

export function buildRecitationJuzAchievementFilters(
  detail: QuranGoalDetail | null | undefined,
): JuzPastAchievementFilter[] {
  const ids = getSelectedJuzIdsFromDetail(detail).sort((a, b) => a - b);
  const range = getJuzRangeFromDetail(detail);
  const filters: JuzPastAchievementFilter[] = [{ id: "all", label: "All" }];

  if (ids.length > 0) {
    for (const juz of ids) {
      filters.push({ id: juz, label: `Juz ${juz}` });
    }
    return filters;
  }

  if (range) {
    for (let juz = range.start; juz <= range.end; juz += 1) {
      filters.push({ id: juz, label: `Juz ${juz}` });
    }
  }

  return filters;
}

export function getRecitationJuzRangeFromDetail(
  detail: QuranGoalDetail | null | undefined,
): { startJuz: number; endJuz: number } {
  const range = getJuzRangeFromDetail(detail);
  if (range) return { startJuz: range.start, endJuz: range.end };
  return { startJuz: 1, endJuz: 1 };
}

function buildJuzRecordsFromDetail(
  detail: QuranGoalDetail | null | undefined,
  juzFilter: JuzFilterId,
  completedUnits: number,
  totalUnits: number,
): JuzPastAchievementRecord[] {
  const ids = getSelectedJuzIdsFromDetail(detail).sort((a, b) => a - b);
  const range = getJuzRangeFromDetail(detail);
  const juzNumbers =
    ids.length > 0
      ? ids
      : range
        ? Array.from(
            { length: range.end - range.start + 1 },
            (_, i) => range.start + i,
          )
        : [];

  if (juzFilter !== "all") {
    const juzNumber = Number(juzFilter);
    const totalAyatCount = getJuzVerseCountFromMap(juzNumber);
    const completedAyatCount = Math.min(
      totalAyatCount,
      Math.round(
        totalUnits > 0 && totalAyatCount > 0
          ? (completedUnits / Math.max(totalUnits, 1)) * totalAyatCount
          : completedUnits,
      ),
    );
    return [
      {
        juzNumber,
        completedAyatCount,
        totalAyatCount,
        status:
          completedAyatCount >= totalAyatCount ? "completed" : "incomplete",
        timeSpentMinutes: 0,
      },
    ];
  }

  return juzNumbers.map((juzNumber) => {
    const totalAyatCount = getJuzVerseCountFromMap(juzNumber);
    return {
      juzNumber,
      completedAyatCount: 0,
      totalAyatCount,
      status: "incomplete" as const,
      timeSpentMinutes: 0,
    };
  });
}

export function mapRecitationJuzAchievementsToUi(
  data: QuranGoalAchievementsData,
  period: PastAchievementPeriod,
  options?: {
    juzFilter?: JuzFilterId;
    detail?: QuranGoalDetail | null;
  },
): MappedRecitationJuzAchievements {
  const juzFilter = options?.juzFilter ?? "all";
  const detail = options?.detail;
  const juzRange = getRecitationJuzRangeFromDetail(detail);
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
      completedUnits + incompleteUnits,
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

  // Keep x-axis slots when API returns empty buckets scaffolded into chartData.
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

  const achievementPercent = Math.round(
    toFiniteNumber(data.achievementPct) ??
      (goalUnits > 0 ? (completedUnits / goalUnits) * 100 : 0),
  );
  const previousPeriodDeltaPercent = getQuranAchievementsSignedDelta(
    data.delta,
  );

  const targetJuzCount = Math.max(
    1,
    juzFilter === "all"
      ? Math.round(goalUnits) || juzRange.endJuz - juzRange.startJuz + 1
      : 1,
  );
  const completedJuzCount = Math.min(
    targetJuzCount,
    Math.round(completedUnits),
  );

  const achievement: MappedQuranHoursAchievements = {
    dateRangeLabel,
    achievementPercent,
    previousPeriodDeltaPercent,
    chartData,
    goalHours: targetJuzCount,
    periodGoalHours:
      chartData.length > 0 ? targetJuzCount / chartData.length : targetJuzCount,
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

  const juzRecords = buildJuzRecordsFromDetail(
    detail,
    juzFilter,
    completedUnits,
    goalUnits || completedUnits + incompleteUnits,
  );

  // Prefer API time on the selected filter's record when drilling into one juz.
  if (juzFilter !== "all" && juzRecords[0]) {
    const totalTime = normalizedChartPeriods.reduce(
      (sum, row) => sum + (row.timeSpentMinutes || 0),
      0,
    );
    juzRecords[0] = {
      ...juzRecords[0],
      timeSpentMinutes: totalTime,
      completedAyatCount: Math.min(
        juzRecords[0].totalAyatCount,
        Math.round(completedUnits),
      ),
      status:
        juzRecords[0].totalAyatCount > 0 &&
        Math.round(completedUnits) >= juzRecords[0].totalAyatCount
          ? "completed"
          : "incomplete",
    };
  }

  const slice: JuzPeriodSlice = {
    chartPeriods: normalizedChartPeriods,
    targetJuzCount,
    completedJuzCount,
    juzRange,
    achievementPercent,
    previousPeriodDeltaPercent,
    dateRangeLabel,
    pageCount: 1,
    activePageIndex: 0,
    juzRecords,
    perJuz: {},
  };

  return { achievement, slice };
}
