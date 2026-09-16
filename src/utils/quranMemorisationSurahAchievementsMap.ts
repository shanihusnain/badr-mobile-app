import type {
  QuranAchievementsBucket,
  QuranGoalAchievementsData,
} from "@/src/api/queries/useGetQuranGoalAchievements";
import type { MemorisationPastAchievement } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationPastAchievementData";
import type {
  MemorisationProgressRailRow,
  MemorisationSurahPastAchievementFilter,
  MemorisationSurahPeriodSlice,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import type { SurahMemorisationGoal } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahGoals";
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

  // Empty API buckets (null dates) — stable placeholder, never moment(0).
  const prefix = period === "monthly" ? "W" : "M";
  return `${prefix}${index + 1}`;
}

/** Ayah/verse units — never convert minutes→hours. */
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

  return buckets.map((bucket, index) => {
    const completedAyahs = bucketCompletedAyahs(bucket);
    const incompleteAyahs = bucketIncompleteAyahs(bucket);
    const stackTotalHours = completedAyahs + incompleteAyahs;

    return {
      xLabel: `${prefix}${index + 1}`,
      dateLabel: bucketDateLabel(bucket, period, index),
      // Chart reuses "hours" fields as ayah counts for memorisation UI.
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
}

export type MappedMemorisationSurahAchievements = {
  achievement: MappedQuranHoursAchievements;
  compact: MemorisationPastAchievement;
  slice: MemorisationSurahPeriodSlice;
  progressRailRows: MemorisationProgressRailRow[];
};

export function createEmptyMemorisationSurahAchievements(
  surahId: string = "all",
  surahName: string = "All Surahs",
): MappedMemorisationSurahAchievements {
  const achievement = createEmptyQuranHoursAchievement();
  return {
    achievement,
    compact: {
      surahId,
      surahName,
      totalAyahs: 0,
      memorizedAyahs: 0,
      remainingAyahs: 0,
      progressPercent: 0,
      completed: false,
      chartData: [],
      yMax: 1,
      yTicks: [0, 1],
      logHistory: [],
    },
    slice: {
      chartPeriods: [],
      totalAyahs: 0,
      memorizedAyahs: 0,
      remainingAyahs: 0,
      achievementPercent: 0,
      previousPeriodDeltaPercent: 0,
      dateRangeLabel: "---",
      pageCount: 1,
      activePageIndex: 0,
      surahRecords: [],
      perSurah: {},
    },
    progressRailRows: [],
  };
}

export function buildMemorisationSurahAchievementFilters(
  goals: SurahMemorisationGoal[],
): MemorisationSurahPastAchievementFilter[] {
  return [
    { id: "all", surahName: "All" },
    ...goals.map((goal) => ({
      id: goal.id,
      surahName: goal.surahName,
    })),
  ];
}

export function mapMemorisationSurahAchievementsToUi(
  data: QuranGoalAchievementsData,
  period: PastAchievementPeriod,
  options?: {
    surahId?: string;
    surahName?: string;
    goals?: SurahMemorisationGoal[];
  },
): MappedMemorisationSurahAchievements {
  const surahId = options?.surahId ?? "all";
  const surahName = options?.surahName ?? "All Surahs";
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
    pageCount: 1,
    activePageIndex: 0,
    narrative: data.narrative ?? null,
    keyInsightsHeader: data.keyInsightsHeader ?? null,
    keyInsights: data.keyInsights ?? null,
    completedMinutes: memorizedAyahs,
    incompleteMinutes: remainingAyahs,
    canNavigateBack: data.canNavigateBack ?? data.hasPrevious ?? false,
    canNavigateForward: data.canNavigateForward ?? data.hasNext ?? false,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
  };

  const surahRecords =
    surahId === "all"
      ? goals.map((goal) => ({
          id: goal.id,
          surahName: goal.surahName,
          memorizedAyahs: goal.memorizedAyahs,
          totalAyahs: goal.totalAyahs,
          totalTimeSpent: 0,
        }))
      : goals
          .filter((goal) => goal.id === surahId)
          .map((goal) => ({
            id: goal.id,
            surahName: goal.surahName,
            memorizedAyahs: memorizedAyahs || goal.memorizedAyahs,
            totalAyahs: totalAyahs || goal.totalAyahs,
            totalTimeSpent: 0,
          }));

  const slice: MemorisationSurahPeriodSlice = {
    chartPeriods,
    totalAyahs,
    memorizedAyahs,
    remainingAyahs,
    achievementPercent,
    previousPeriodDeltaPercent,
    dateRangeLabel,
    pageCount: 1,
    activePageIndex: 0,
    surahRecords,
    perSurah: {},
  };

  const progressRailRows: MemorisationProgressRailRow[] =
    surahId === "all"
      ? goals.map((goal) => ({
          surahId: goal.id,
          surahName: goal.surahName,
          completedVerses: goal.memorizedAyahs,
          totalVerses: goal.totalAyahs,
          isCompleted: goal.completed,
          timeSpentMinutes: 0,
        }))
      : [
          {
            surahId,
            surahName,
            completedVerses: memorizedAyahs,
            totalVerses: Math.max(totalAyahs, memorizedAyahs),
            isCompleted: totalAyahs > 0 && memorizedAyahs >= totalAyahs,
            timeSpentMinutes: chartPeriods.reduce(
              (sum, period) => sum + period.timeSpentMinutes,
              0,
            ),
          },
        ];

  const compact: MemorisationPastAchievement = {
    surahId,
    surahName,
    totalAyahs,
    memorizedAyahs,
    remainingAyahs,
    progressPercent: achievementPercent,
    completed: totalAyahs > 0 && memorizedAyahs >= totalAyahs,
    chartData,
    yMax: yAxis.yMax,
    yTicks: yAxis.yTicks,
    logHistory: [],
  };

  return { achievement, compact, slice, progressRailRows };
}
