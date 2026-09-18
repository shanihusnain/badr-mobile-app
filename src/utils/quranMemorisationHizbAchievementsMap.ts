import type {
  QuranAchievementsBucket,
  QuranGoalAchievementsData,
} from "@/src/api/queries/useGetQuranGoalAchievements";
import type { HizbMemorisationPastAchievement } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementData";
import type {
  MemorisationHizbPastAchievementFilter,
  MemorisationHizbPeriodSlice,
  MemorisationHizbProgressRailRow,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementSliceData";
import type { HizbMemorisationGoal } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbGoals";
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

  return buckets.map((bucket, index) => {
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
}

export type MappedMemorisationHizbAchievements = {
  achievement: MappedQuranHoursAchievements;
  compact: HizbMemorisationPastAchievement;
  slice: MemorisationHizbPeriodSlice;
  progressRailRows: MemorisationHizbProgressRailRow[];
};

export function createEmptyMemorisationHizbAchievements(
  hizbId: string = "all",
  hizbName: string = "All Hizbs",
): MappedMemorisationHizbAchievements {
  const achievement = createEmptyQuranHoursAchievement();
  return {
    achievement,
    compact: {
      hizbId,
      hizbName,
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
      hizbRecords: [],
      perHizb: {},
    },
    progressRailRows: [],
  };
}

export function buildMemorisationHizbAchievementFilters(
  goals: HizbMemorisationGoal[],
): MemorisationHizbPastAchievementFilter[] {
  return [
    { id: "all", hizbName: "All" },
    ...goals.map((goal) => ({
      id: goal.id,
      hizbName: goal.hizbName,
    })),
  ];
}

export function mapMemorisationHizbAchievementsToUi(
  data: QuranGoalAchievementsData,
  period: PastAchievementPeriod,
  options?: {
    hizbId?: string;
    hizbName?: string;
    goals?: HizbMemorisationGoal[];
  },
): MappedMemorisationHizbAchievements {
  const hizbId = options?.hizbId ?? "all";
  const hizbName = options?.hizbName ?? "All Hizbs";
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

  const hizbRecords =
    hizbId === "all"
      ? goals.map((goal) => ({
          id: goal.id,
          hizbNumber: goal.itemNumber ?? (Number(goal.id) || 0),
          memorizedAyahs: goal.memorizedAyahs,
          totalAyahs: goal.totalAyahs,
          totalTimeSpent: 0,
          startAyah: goal.rangeLabel?.split("–")[0]?.trim() || "",
          endAyah: goal.rangeLabel?.split("–")[1]?.trim() || "",
        }))
      : goals
          .filter((goal) => goal.id === hizbId)
          .map((goal) => ({
            id: goal.id,
            hizbNumber: goal.itemNumber ?? (Number(goal.id) || 0),
            memorizedAyahs: memorizedAyahs || goal.memorizedAyahs,
            totalAyahs: totalAyahs || goal.totalAyahs,
            totalTimeSpent: 0,
            startAyah: goal.rangeLabel?.split("–")[0]?.trim() || "",
            endAyah: goal.rangeLabel?.split("–")[1]?.trim() || "",
          }));

  const slice: MemorisationHizbPeriodSlice = {
    chartPeriods,
    totalAyahs,
    memorizedAyahs,
    remainingAyahs,
    achievementPercent,
    previousPeriodDeltaPercent,
    dateRangeLabel,
    pageCount: 1,
    activePageIndex: 0,
    hizbRecords,
    perHizb: {},
  };

  const progressRailRows: MemorisationHizbProgressRailRow[] =
    hizbId === "all"
      ? goals.map((goal) => ({
          hizbId: goal.id,
          hizbNumber: goal.itemNumber ?? (Number(goal.id) || 0),
          hizbName: goal.hizbName,
          rangeLabel: goal.rangeLabel || "",
          completedVerses: goal.memorizedAyahs,
          totalVerses: goal.totalAyahs,
          isCompleted: goal.completed,
          timeSpentMinutes: 0,
        }))
      : [
          {
            hizbId,
            hizbNumber: Number(hizbId) || 0,
            hizbName,
            rangeLabel: "",
            completedVerses: memorizedAyahs,
            totalVerses: Math.max(totalAyahs, memorizedAyahs),
            isCompleted: totalAyahs > 0 && memorizedAyahs >= totalAyahs,
            timeSpentMinutes: chartPeriods.reduce(
              (sum, periodRow) => sum + periodRow.timeSpentMinutes,
              0,
            ),
          },
        ];

  const compact: HizbMemorisationPastAchievement = {
    hizbId,
    hizbName,
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
