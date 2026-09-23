import type {
  QuranAchievementsBucket,
  QuranGoalAchievementsData,
} from "@/src/api/queries/useGetQuranGoalAchievements";
import type { JuzMemorisationCompactPastAchievement } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationJuzPastAchievementData";
import type {
  JuzMemorisationPastAchievementFilter,
  JuzMemorisationPastAchievementRecord,
  JuzMemorisationPeriodSlice,
  MemorisationJuzFilterId,
  MemorisationJuzProgressRailRow,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationJuzPastAchievementData";
import type { JuzMemorisationGoal } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationJuzGoals";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { QuranPastChartItem } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  createEmptyQuranHoursAchievement,
  getQuranAchievementsSignedDelta,
  type MappedQuranHoursAchievements,
} from "@/src/utils/quranHoursGoalAchievementsMap";
import {
  formatPrayerAchievementsDateRange,
  formatSixMonthChartBarDateLabel,
} from "@/src/utils/prayerGoalAchievementsMap";

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

function bucketDateLabel(
  bucket: QuranAchievementsBucket,
  period: PastAchievementPeriod,
  index: number,
): string {
  const raw = (bucket.range || bucket.label || "").trim();
  if (raw) {
    if (period === "sixMonths") {
      return formatSixMonthChartBarDateLabel(raw.replace(/\s*[–—]\s*/g, "—"));
    }
    return raw;
  }

  const fromDates = formatPrayerAchievementsDateRange(
    bucket.start,
    bucket.end,
  );
  if (fromDates) return fromDates;

  const prefix = period === "monthly" ? "W" : "M";
  return `${prefix}${index + 1}`;
}

function bucketCompletedAyahs(bucket: QuranAchievementsBucket): number {
  return Math.max(
    0,
    toFiniteNumber(bucket.completedVerses) ??
      toFiniteNumber(bucket.completedAyahs) ??
      toFiniteNumber(bucket.completedMinutes) ??
      0,
  );
}

function bucketIncompleteAyahs(bucket: QuranAchievementsBucket): number {
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

function mapBucketsToAyahChart(
  buckets: QuranAchievementsBucket[],
  period: PastAchievementPeriod,
): QuranPastChartItem[] {
  const prefix = period === "monthly" ? "w" : "m";

  const mapped = buckets.map((bucket, index) => {
    const completedAyahs = bucketCompletedAyahs(bucket);
    const incompleteAyahs = bucketIncompleteAyahs(bucket);
    const stackTotalHours = completedAyahs + incompleteAyahs;

    return {
      xLabel: `${prefix}${index + 1}`,
      dateLabel: bucketDateLabel(bucket, period, index),
      completedHours: completedAyahs,
      incompleteHours: incompleteAyahs,
      hours: completedAyahs,
      stackTotalHours,
      completedMinutes: completedAyahs,
      incompleteMinutes: incompleteAyahs,
      narrative: bucket.narrative ?? undefined,
      achievementPct: toFiniteNumber(bucket.achievementPct) ?? undefined,
    };
  });

  const hasLoggedProgress = mapped.some(
    (item) => (item.completedHours ?? 0) > 0,
  );
  const hasTimeSpent = buckets.some(
    (bucket) => bucketTimeSpentMinutes(bucket) > 0,
  );
  if (!hasLoggedProgress && !hasTimeSpent) {
    return [];
  }

  return mapped;
}

export type MappedMemorisationJuzAchievements = {
  achievement: MappedQuranHoursAchievements;
  compact: JuzMemorisationCompactPastAchievement;
  slice: JuzMemorisationPeriodSlice;
  progressRailRows: MemorisationJuzProgressRailRow[];
};

export function createEmptyMemorisationJuzAchievements(
  juzId: string = "all",
  juzName: string = "All Juzs",
): MappedMemorisationJuzAchievements {
  const achievement = createEmptyQuranHoursAchievement();
  return {
    achievement,
    compact: {
      juzId,
      juzName,
      totalAyahs: 0,
      memorizedAyahs: 0,
      remainingAyahs: 0,
      progressPercent: 0,
      completed: false,
      chartData: [],
      yMax: 1,
      yTicks: [0, 1],
    },
    slice: {
      chartPeriods: [],
      juzFilter: juzId as MemorisationJuzFilterId,
      targetJuzCount: 0,
      completedJuzCount: 0,
      memorizedAyahs: 0,
      totalAyahs: 0,
      remainingAyahs: 0,
      totalTimeSpentMinutes: 0,
      achievementPercent: 0,
      previousPeriodDeltaPercent: 0,
      dateRangeLabel: "---",
      pageCount: 1,
      activePageIndex: 0,
      juzRecords: [],
      perJuz: {},
    },
    progressRailRows: [],
  };
}

export function buildMemorisationJuzAchievementFilters(
  goals: JuzMemorisationGoal[],
): JuzMemorisationPastAchievementFilter[] {
  return [
    { id: "all", label: "All", juzNumber: 0 },
    ...goals.map((goal) => ({
      id: goal.id,
      label: goal.juzName || goal.displayName || `Juz ${goal.juzNumber}`,
      juzNumber: goal.juzNumber || goal.itemNumber || 0,
    })),
  ];
}

export function mapMemorisationJuzAchievementsToUi(
  data: QuranGoalAchievementsData,
  period: PastAchievementPeriod,
  options?: {
    juzId?: string;
    juzName?: string;
    goals?: JuzMemorisationGoal[];
  },
): MappedMemorisationJuzAchievements {
  const juzId = options?.juzId ?? "all";
  const juzName = options?.juzName ?? "All Juzs";
  const goals = options?.goals ?? [];
  const buckets = data.chart?.buckets ?? [];
  const chartData = mapBucketsToAyahChart(buckets, period);

  const memorizedAyahs = Math.max(
    0,
    toFiniteNumber(data.totals?.completedVerses) ??
      toFiniteNumber(data.totals?.completedAyahs) ??
      toFiniteNumber(data.totals?.completedMinutes) ??
      chartData.reduce((sum, item) => sum + item.completedHours, 0),
  );
  const remainingAyahs = Math.max(
    0,
    toFiniteNumber(data.totals?.incompleteVerses) ??
      toFiniteNumber(data.totals?.incompleteAyahs) ??
      toFiniteNumber(data.totals?.incompleteMinutes) ??
      chartData.reduce((sum, item) => sum + item.incompleteHours, 0),
  );
  const totalAyahs = Math.max(
    0,
    toFiniteNumber(data.goal?.value) ??
      toFiniteNumber(buckets[0]?.goalAyahs) ??
      memorizedAyahs + remainingAyahs,
  );

  const yAxis = computeYAxis(
    chartData.map((item) => item.stackTotalHours),
    data.chart?.yAxisMax,
  );

  const dateRangeLabel =
    data.periodLabel?.trim() ||
    formatPrayerAchievementsDateRange(data.periodStart, data.periodEnd) ||
    "---";

  const chartPeriods = buckets.map((bucket, index) => ({
    xLabel: chartData[index]?.xLabel ?? `b${index + 1}`,
    dateLabel:
      chartData[index]?.dateLabel ?? bucketDateLabel(bucket, period, index),
    completed: bucketCompletedAyahs(bucket),
    incomplete: bucketIncompleteAyahs(bucket),
    timeSpentMinutes: bucketTimeSpentMinutes(bucket),
  }));

  const achievementPercent = Math.round(
    toFiniteNumber(data.achievementPct) ??
      (totalAyahs > 0 ? (memorizedAyahs / totalAyahs) * 100 : 0),
  );
  const previousPeriodDeltaPercent = getQuranAchievementsSignedDelta(
    data.delta,
  );

  const achievement: MappedQuranHoursAchievements = {
    dateRangeLabel,
    achievementPercent,
    previousPeriodDeltaPercent,
    chartData,
    goalHours: totalAyahs,
    periodGoalHours:
      chartData.length > 0 ? totalAyahs / chartData.length : totalAyahs,
    completedHours: memorizedAyahs,
    incompleteHours: remainingAyahs,
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
    completedMinutes: memorizedAyahs,
    incompleteMinutes: remainingAyahs,
    canNavigateBack: data.canNavigateBack ?? data.hasPrevious ?? false,
    canNavigateForward: data.canNavigateForward ?? data.hasNext ?? false,
    periodStart: data.periodStart ?? "",
    periodEnd: data.periodEnd ?? "",
  };

  const juzRecords: JuzMemorisationPastAchievementRecord[] =
    juzId === "all"
      ? goals.map((goal) => {
          const total = goal.totalAyahs;
          const memorized = goal.memorizedAyahs;
          return {
            juzNumber: goal.juzNumber || goal.itemNumber || 0,
            juzId: goal.id,
            juzName: goal.juzName || goal.displayName || `Juz ${goal.juzNumber}`,
            rangeLabel: goal.rangeLabel || "",
            memorizedAyahs: memorized,
            totalAyahs: total,
            status: (total > 0 && memorized >= total ? "completed" : "incomplete") as
              | "completed"
              | "incomplete",
            timeSpentMinutes: 0,
            progressPercent:
              total > 0 ? Math.min(100, Math.round((memorized / total) * 100)) : 0,
          };
        })
      : goals
          .filter((goal) => goal.id === juzId)
          .map((goal) => {
            const total = totalAyahs || goal.totalAyahs;
            const memorized = memorizedAyahs || goal.memorizedAyahs;
            return {
              juzNumber: goal.juzNumber || goal.itemNumber || 0,
              juzId: goal.id,
              juzName: goal.juzName || juzName,
              rangeLabel: goal.rangeLabel || "",
              memorizedAyahs: memorized,
              totalAyahs: total,
              status: (total > 0 && memorized >= total ? "completed" : "incomplete") as
                | "completed"
                | "incomplete",
              timeSpentMinutes: 0,
              progressPercent:
                total > 0 ? Math.min(100, Math.round((memorized / total) * 100)) : 0,
            };
          });

  const totalTimeSpentMinutes = chartPeriods.reduce(
    (sum, row) => sum + (row.timeSpentMinutes || 0),
    0,
  );

  const slice: JuzMemorisationPeriodSlice = {
    chartPeriods,
    juzFilter: juzId as MemorisationJuzFilterId,
    targetJuzCount: juzId === "all" ? Math.max(1, goals.length) : 1,
    completedJuzCount:
      juzId === "all"
        ? goals.filter((goal) => goal.completed).length
        : totalAyahs > 0 && memorizedAyahs >= totalAyahs
          ? 1
          : 0,
    memorizedAyahs,
    totalAyahs,
    remainingAyahs,
    totalTimeSpentMinutes,
    achievementPercent,
    previousPeriodDeltaPercent,
    dateRangeLabel,
    pageCount: 1,
    activePageIndex: 0,
    juzRecords,
    perJuz: {},
  };

  const progressRailRows: MemorisationJuzProgressRailRow[] =
    juzId === "all"
      ? goals.map((goal) => ({
          juzId: goal.id,
          juzNumber: goal.juzNumber || goal.itemNumber || 0,
          juzName: goal.juzName || goal.displayName || `Juz ${goal.juzNumber}`,
          rangeLabel: goal.rangeLabel || "",
          completedVerses: goal.memorizedAyahs,
          totalVerses: goal.totalAyahs,
          isCompleted: goal.completed,
          timeSpentMinutes: 0,
        }))
      : [
          {
            juzId,
            juzNumber:
              goals.find((goal) => goal.id === juzId)?.juzNumber ||
              Number(String(juzId).replace(/^juz-/i, "")) ||
              0,
            juzName,
            rangeLabel: "",
            completedVerses: memorizedAyahs,
            totalVerses: Math.max(totalAyahs, memorizedAyahs),
            isCompleted: totalAyahs > 0 && memorizedAyahs >= totalAyahs,
            timeSpentMinutes: totalTimeSpentMinutes,
          },
        ];

  const compact: JuzMemorisationCompactPastAchievement = {
    juzId: juzId as MemorisationJuzFilterId,
    juzName,
    totalAyahs,
    memorizedAyahs,
    remainingAyahs,
    progressPercent: achievementPercent,
    completed: totalAyahs > 0 && memorizedAyahs >= totalAyahs,
    chartData,
    yMax: yAxis.yMax,
    yTicks: yAxis.yTicks,
  };

  return { achievement, compact, slice, progressRailRows };
}
