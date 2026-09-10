import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import {
  getMemorisationLogsForFilter,
  type SurahMemorisationLogRecord,
} from "./quranMemorisationSurahData";
import {
  getMemorisationGoalsForFilter,
  getSurahMemorisationGoals,
  type MemorisationSurahFilterId,
  type SurahMemorisationGoal,
} from "./quranMemorisationSurahGoals";
import { getSurahVerseCount } from "./quranSurahVerseMap";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";

export type { MemorisationSurahFilterId };

export type MemorisationAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTimeSpent";

export type MemorisationSurahPastAchievementFilter = {
  id: MemorisationSurahFilterId;
  surahName: string;
};

export type MemorizationSurahAchievement = {
  id: string;
  surahName: string;
  memorizedAyahs: number;
  totalAyahs: number;
  totalTimeSpent: number;
};

type ChartPeriod = {
  xLabel: string;
  dateLabel: string;
  completed: number;
  incomplete: number;
  timeSpentMinutes: number;
};

export type MemorisationSurahUnitPeriodData = {
  surahId: string;
  surahName: string;
  chartPeriods: ChartPeriod[];
  memorizedAyahs: number;
  totalAyahs: number;
  remainingAyahs: number;
  status: "completed" | "incomplete";
  totalTimeSpentMinutes: number;
};

export type MemorisationSurahPeriodSlice = {
  chartPeriods: ChartPeriod[];
  totalAyahs: number;
  memorizedAyahs: number;
  remainingAyahs: number;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  dateRangeLabel: string;
  pageCount: number;
  activePageIndex: number;
  surahRecords: MemorizationSurahAchievement[];
  perSurah: Record<string, MemorisationSurahUnitPeriodData>;
};

export type MemorisationProgressRailRow = {
  surahId: string;
  surahName: string;
  completedVerses: number;
  totalVerses: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
};

const MOTIVATIONAL_SUMMARY_KEY =
  "progressLogging.achievementSummaryMemorisationSurah";

const THREE_MONTH_LABELS = [
  { xLabel: "m1", dateLabel: "Sep 1–30" },
  { xLabel: "m2", dateLabel: "Oct 1–31" },
  { xLabel: "m3", dateLabel: "Nov 1–30" },
];

const SIX_MONTH_LABELS = [
  { xLabel: "m1", dateLabel: "Jun" },
  { xLabel: "m2", dateLabel: "Jul" },
  { xLabel: "m3", dateLabel: "Aug" },
  { xLabel: "m4", dateLabel: "Sep" },
  { xLabel: "m5", dateLabel: "Oct" },
  { xLabel: "m6", dateLabel: "Nov" },
];

function formatLogDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function logTimeSpentMinutes(log: SurahMemorisationLogRecord): number {
  const fromFields = (log.hours ?? 0) * 60 + (log.minutes ?? 0);
  if (fromFields > 0) return fromFields;
  return Math.max(15, log.ayahsMemorizedToday * 8);
}

function groupByProgressEvents(
  logs: SurahMemorisationLogRecord[],
  totalAyahs: number,
  monthFilter?: { year: number; month: number },
): ChartPeriod[] {
  let sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  if (monthFilter) {
    sorted = sorted.filter((log) => {
      const parsed = new Date(`${log.date}T00:00:00`);
      return (
        parsed.getFullYear() === monthFilter.year &&
        parsed.getMonth() === monthFilter.month
      );
    });
  }

  const priorMemorized = monthFilter
    ? logs
        .filter((log) => log.date < `${monthFilter.year}-${String(monthFilter.month + 1).padStart(2, "0")}-01`)
        .reduce((sum, log) => sum + log.ayahsMemorizedToday, 0)
    : 0;

  let cumulative = priorMemorized;

  if (sorted.length === 0) {
    const memorized = Math.min(cumulative, totalAyahs);
    return [
      {
        xLabel: "e1",
        dateLabel: "No activity",
        completed: memorized,
        incomplete: Math.max(0, totalAyahs - memorized),
        timeSpentMinutes: 0,
      },
    ];
  }

  return sorted.map((log, index) => {
    cumulative += log.ayahsMemorizedToday;
    const memorized = Math.min(cumulative, totalAyahs);
    return {
      xLabel: `e${index + 1}`,
      dateLabel: formatLogDate(log.date),
      completed: memorized,
      incomplete: Math.max(0, totalAyahs - memorized),
      timeSpentMinutes: logTimeSpentMinutes(log),
    };
  });
}

function groupByMonth(
  monthlySnapshots: Array<{
    xLabel: string;
    dateLabel: string;
    memorizedAyahs: number;
    timeSpentMinutes: number;
  }>,
  totalAyahs: number,
): ChartPeriod[] {
  return monthlySnapshots.map((snapshot) => ({
    xLabel: snapshot.xLabel,
    dateLabel: snapshot.dateLabel,
    completed: snapshot.memorizedAyahs,
    incomplete: Math.max(0, totalAyahs - snapshot.memorizedAyahs),
    timeSpentMinutes: snapshot.timeSpentMinutes,
  }));
}

function buildSurahUnitFromLogs(
  goal: SurahMemorisationGoal,
  logs: SurahMemorisationLogRecord[],
): MemorisationSurahUnitPeriodData {
  const totalAyahs = goal.totalAyahs;
  const memorizedAyahs = goal.memorizedAyahs;
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const chartPeriods = groupByProgressEvents(logs, totalAyahs, {
    year: 2025,
    month: 10,
  });
  const totalTimeSpentMinutes = logs.reduce(
    (sum, log) => sum + logTimeSpentMinutes(log),
    0,
  );

  return {
    surahId: goal.id,
    surahName: goal.surahName,
    chartPeriods,
    memorizedAyahs,
    totalAyahs,
    remainingAyahs,
    status: memorizedAyahs >= totalAyahs ? "completed" : "incomplete",
    totalTimeSpentMinutes,
  };
}

function unitToRecord(unit: MemorisationSurahUnitPeriodData): MemorizationSurahAchievement {
  return {
    id: unit.surahId,
    surahName: unit.surahName,
    memorizedAyahs: unit.memorizedAyahs,
    totalAyahs: unit.totalAyahs,
    totalTimeSpent: unit.totalTimeSpentMinutes,
  };
}

function aggregateChartPeriods(units: MemorisationSurahUnitPeriodData[]): ChartPeriod[] {
  const periodCount = Math.max(
    ...units.map((unit) => unit.chartPeriods.length),
    1,
  );

  return Array.from({ length: periodCount }, (_, index) => {
    let completed = 0;
    let incomplete = 0;
    let timeSpentMinutes = 0;

    units.forEach((unit) => {
      const period = unit.chartPeriods[index] ?? unit.chartPeriods.at(-1);
      if (!period) return;
      completed += period.completed;
      incomplete += period.incomplete;
      timeSpentMinutes += period.timeSpentMinutes;
    });

    const first = units[0]?.chartPeriods[index] ?? units[0]?.chartPeriods[0];

    return {
      xLabel: first?.xLabel ?? `p${index + 1}`,
      dateLabel: first?.dateLabel ?? "",
      completed,
      incomplete,
      timeSpentMinutes,
    };
  });
}

function buildSliceFromUnits(
  units: MemorisationSurahUnitPeriodData[],
  meta: Omit<
    MemorisationSurahPeriodSlice,
    | "chartPeriods"
    | "totalAyahs"
    | "memorizedAyahs"
    | "remainingAyahs"
    | "achievementPercent"
    | "surahRecords"
    | "perSurah"
  >,
): MemorisationSurahPeriodSlice {
  const activeUnits = units.filter(
    (unit) => unit.memorizedAyahs > 0 || unit.totalTimeSpentMinutes > 0,
  );
  const totalAyahs = units.reduce((sum, unit) => sum + unit.totalAyahs, 0);
  const memorizedAyahs = units.reduce((sum, unit) => sum + unit.memorizedAyahs, 0);
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);

  return {
    ...meta,
    chartPeriods: aggregateChartPeriods(units),
    totalAyahs,
    memorizedAyahs,
    remainingAyahs,
    achievementPercent:
      totalAyahs > 0
        ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 100))
        : 0,
    surahRecords: activeUnits.map(unitToRecord),
    perSurah: Object.fromEntries(units.map((unit) => [unit.surahId, unit])),
  };
}

function buildMonthlyPerSurahData(): MemorisationSurahUnitPeriodData[] {
  const goals = getSurahMemorisationGoals();

  return goals.map((goal) => {
    const logs = getMemorisationLogsForFilter(goal.id);
    return buildSurahUnitFromLogs(goal, logs);
  });
}

function buildMonthlySlice(): MemorisationSurahPeriodSlice {
  const units = buildMonthlyPerSurahData();
  return buildSliceFromUnits(units, {
    previousPeriodDeltaPercent: 12,
    dateRangeLabel: "Nov 1 — 30, 25",
    pageCount: units[0]?.chartPeriods.length ?? 1,
    activePageIndex: Math.max(0, (units[0]?.chartPeriods.length ?? 1) - 1),
  });
}

function scaleUnitToMonths(
  unit: MemorisationSurahUnitPeriodData,
  labels: Array<{ xLabel: string; dateLabel: string }>,
  memorizedByMonth: number[],
  timeByMonth: number[],
): MemorisationSurahUnitPeriodData {
  const chartPeriods = labels.map((label, index) => {
    const memorized = Math.min(
      memorizedByMonth[index] ?? unit.memorizedAyahs,
      unit.totalAyahs,
    );
    return {
      xLabel: label.xLabel,
      dateLabel: label.dateLabel,
      completed: memorized,
      incomplete: Math.max(0, unit.totalAyahs - memorized),
      timeSpentMinutes: timeByMonth[index] ?? 0,
    };
  });

  return {
    ...unit,
    chartPeriods,
  };
}

function scaleMemorisationSlice(
  slice: MemorisationSurahPeriodSlice,
  period: PastAchievementPeriod,
): MemorisationSurahPeriodSlice {
  if (period === "monthly") return slice;

  const units = Object.values(slice.perSurah);

  if (period === "threeMonths") {
    const scaledUnits = units.map((unit) => {
      const step = Math.max(1, Math.round(unit.memorizedAyahs / 3));
      return scaleUnitToMonths(
        unit,
        THREE_MONTH_LABELS,
        [
          Math.min(step, unit.memorizedAyahs),
          Math.min(step * 2, unit.memorizedAyahs),
          unit.memorizedAyahs,
        ],
        [
          Math.round(unit.totalTimeSpentMinutes * 0.25),
          Math.round(unit.totalTimeSpentMinutes * 0.35),
          Math.round(unit.totalTimeSpentMinutes * 0.4),
        ],
      );
    });

    return buildSliceFromUnits(scaledUnits, {
      previousPeriodDeltaPercent: 8,
      dateRangeLabel: "Sep — Nov, 25",
      pageCount: 3,
      activePageIndex: 2,
    });
  }

  const scaledUnits = units.map((unit) => {
    const increments = SIX_MONTH_LABELS.map((_, index) =>
      Math.min(
        unit.memorizedAyahs,
        Math.round((unit.memorizedAyahs / 6) * (index + 1)),
      ),
    );
    const timeIncrements = SIX_MONTH_LABELS.map((_, index) =>
      Math.round((unit.totalTimeSpentMinutes / 6) * (index + 1)),
    );

    return scaleUnitToMonths(unit, SIX_MONTH_LABELS, increments, timeIncrements);
  });

  return buildSliceFromUnits(scaledUnits, {
    previousPeriodDeltaPercent: 5,
    dateRangeLabel: "Jun — Nov, 25",
    pageCount: 6,
    activePageIndex: 5,
  });
}

function filterMemorisationSlice(
  slice: MemorisationSurahPeriodSlice,
  surahFilter: MemorisationSurahFilterId,
): MemorisationSurahPeriodSlice {
  if (surahFilter === "all") return slice;

  const unit = slice.perSurah[surahFilter];
  if (!unit) {
    const totalAyahs = getSurahVerseCount(surahFilter);
    return {
      ...slice,
      chartPeriods: slice.chartPeriods.map((period) => ({
        ...period,
        completed: 0,
        incomplete: totalAyahs,
        timeSpentMinutes: 0,
      })),
      totalAyahs,
      memorizedAyahs: 0,
      remainingAyahs: totalAyahs,
      achievementPercent: 0,
      surahRecords: [],
    };
  }

  const record = unitToRecord(unit);
  return {
    ...slice,
    chartPeriods: unit.chartPeriods,
    totalAyahs: unit.totalAyahs,
    memorizedAyahs: unit.memorizedAyahs,
    remainingAyahs: unit.remainingAyahs,
    achievementPercent:
      unit.totalAyahs > 0
        ? Math.min(
            100,
            Math.round((unit.memorizedAyahs / unit.totalAyahs) * 100),
          )
        : 0,
    surahRecords:
      unit.memorizedAyahs > 0 || unit.totalTimeSpentMinutes > 0 ? [record] : [],
  };
}

let cachedMonthlySlice: MemorisationSurahPeriodSlice | null = null;

function getBaseMonthlySlice(): MemorisationSurahPeriodSlice {
  if (!cachedMonthlySlice) {
    cachedMonthlySlice = buildMonthlySlice();
  }
  return cachedMonthlySlice;
}

export function getMemorisationPastAchievementFilters(): MemorisationSurahPastAchievementFilter[] {
  const goals = getSurahMemorisationGoals();
  return [{ id: "all", surahName: "All" }, ...goals.map((goal) => ({
    id: goal.id,
    surahName: goal.surahName,
  }))];
}

export function getQuranMemorisationSurahPastAchievementSlice(
  period: PastAchievementPeriod,
  surahFilter: MemorisationSurahFilterId = "all",
): MemorisationSurahPeriodSlice {
  const scaled = scaleMemorisationSlice(getBaseMonthlySlice(), period);
  return filterMemorisationSlice(scaled, surahFilter);
}

function buildChartFromSlice(
  slice: MemorisationSurahPeriodSlice,
): QuranPastChartItem[] {
  return slice.chartPeriods.map((period) => ({
    xLabel: period.xLabel,
    dateLabel: period.dateLabel,
    completedHours: period.completed,
    incompleteHours: period.incomplete,
    hours: period.completed,
    stackTotalHours: period.completed + period.incomplete,
  }));
}

function computeYAxis(chartData: QuranPastChartItem[]) {
  const maxStack = Math.max(...chartData.map((item) => item.stackTotalHours), 0);
  const yMax = Math.max(10, Math.ceil(maxStack / 10) * 10);
  const step = yMax <= 20 ? 5 : yMax <= 50 ? 10 : 20;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

function sliceToAchievement(
  slice: MemorisationSurahPeriodSlice,
): QuranHoursPastAchievement {
  const chartData = buildChartFromSlice(slice);
  const yAxis = computeYAxis(chartData);

  return {
    dateRangeLabel: slice.dateRangeLabel,
    achievementPercent: slice.achievementPercent,
    previousPeriodDeltaPercent: slice.previousPeriodDeltaPercent,
    goalHours: slice.totalAyahs,
    periodGoalHours: slice.totalAyahs / Math.max(slice.chartPeriods.length, 1),
    completedHours: slice.memorizedAyahs,
    incompleteHours: slice.remainingAyahs,
    activeDays: 0,
    activeDaysPrevious: 0,
    longestStreak: 0,
    longestStreakPrevious: 0,
    pageCount: slice.pageCount,
    activePageIndex: slice.activePageIndex,
    chartData,
    ...yAxis,
  };
}

export function getQuranMemorisationSurahPastAchievement(
  period: PastAchievementPeriod,
  surahFilter: MemorisationSurahFilterId = "all",
): QuranHoursPastAchievement {
  return sliceToAchievement(
    getQuranMemorisationSurahPastAchievementSlice(period, surahFilter),
  );
}

export function applyMemorisationAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: MemorisationSurahPeriodSlice,
  view: MemorisationAnalyticsView,
): QuranHoursPastAchievement {
  if (view === "completedVsIncomplete") {
    return achievement;
  }

  const chartData = achievement.chartData.map((item, index) => {
    const timeSpentHours = (slice.chartPeriods[index]?.timeSpentMinutes ?? 0) / 60;
    return {
      ...item,
      incompleteHours: timeSpentHours,
      stackTotalHours: item.completedHours + timeSpentHours,
      hours: item.completedHours,
    };
  });

  return {
    ...achievement,
    chartData,
    ...computeYAxis(chartData),
  };
}

export function getMemorisationTimeSpentByPeriod(
  slice: MemorisationSurahPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalMemorisationTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatMemorisationAyahCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatMemorisationTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatMemorisationTimeSpentChip(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getMemorisationGoalTrackedMonths(
  period: PastAchievementPeriod,
): number {
  switch (period) {
    case "monthly":
      return 1;
    case "threeMonths":
      return 3;
    case "sixMonths":
      return 6;
  }
}

export function getTotalMemorizedVerses(
  slice: MemorisationSurahPeriodSlice,
): number {
  return slice.memorizedAyahs;
}

function getVersesForPeriod(
  unit: MemorisationSurahUnitPeriodData,
  selectedBarIndex: number,
): Pick<MemorisationProgressRailRow, "completedVerses" | "totalVerses" | "isCompleted"> {
  const period = unit.chartPeriods[selectedBarIndex];
  if (!period) {
    return {
      completedVerses: unit.memorizedAyahs,
      totalVerses: unit.totalAyahs,
      isCompleted: unit.status === "completed",
    };
  }

  return {
    completedVerses: period.completed,
    totalVerses: unit.totalAyahs,
    isCompleted: period.completed >= unit.totalAyahs,
  };
}

function buildProgressRailRowForUnit(
  unit: MemorisationSurahUnitPeriodData,
  selectedBarIndex: number | null,
): MemorisationProgressRailRow {
  const progress =
    selectedBarIndex !== null
      ? getVersesForPeriod(unit, selectedBarIndex)
      : {
          completedVerses: unit.memorizedAyahs,
          totalVerses: unit.totalAyahs,
          isCompleted: unit.status === "completed",
        };

  return {
    surahId: unit.surahId,
    surahName: unit.surahName,
    ...progress,
    timeSpentMinutes:
      selectedBarIndex !== null
        ? (unit.chartPeriods[selectedBarIndex]?.timeSpentMinutes ?? 0)
        : unit.totalTimeSpentMinutes,
  };
}

function buildEmptyProgressRailRow(
  surahId: string,
  surahName: string,
): MemorisationProgressRailRow {
  const totalVerses = getSurahVerseCount(surahId);
  return {
    surahId,
    surahName,
    completedVerses: 0,
    totalVerses,
    isCompleted: false,
    timeSpentMinutes: 0,
  };
}

export function getMemorisationProgressRailRows(
  allSlice: MemorisationSurahPeriodSlice,
  filteredSlice: MemorisationSurahPeriodSlice,
  surahFilter: MemorisationSurahFilterId,
  selectedBarIndex: number | null,
): MemorisationProgressRailRow[] {
  if (surahFilter === "all") {
    return getSurahMemorisationGoals().map((goal) => {
      const unit = allSlice.perSurah[goal.id];
      return unit
        ? buildProgressRailRowForUnit(unit, selectedBarIndex)
        : buildEmptyProgressRailRow(goal.id, goal.surahName);
    });
  }

  const unit =
    filteredSlice.perSurah[surahFilter] ?? allSlice.perSurah[surahFilter];
  if (!unit) {
    const goal = getMemorisationGoalsForFilter(surahFilter)[0];
    if (!goal) return [];
    return [buildEmptyProgressRailRow(goal.id, goal.surahName)];
  }

  return [buildProgressRailRowForUnit(unit, selectedBarIndex)];
}

export function hasMemorisationPastAchievementLogs(
  slice: MemorisationSurahPeriodSlice,
): boolean {
  return slice.chartPeriods.some(
    (period) => period.completed > 0 || period.timeSpentMinutes > 0,
  );
}

export { MOTIVATIONAL_SUMMARY_KEY, groupByMonth, groupByProgressEvents };
