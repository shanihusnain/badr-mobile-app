import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import {
  getJuzMemorisationLogsForFilter,
  type JuzMemorisationLogRecord,
} from "./quranMemorisationJuzData";
import {
  getJuzMemorisationGoals,
  getJuzMemorisationGoalsForFilter,
  type JuzMemorisationGoal,
  type MemorisationJuzFilterId,
} from "./quranMemorisationJuzGoals";
import { getJuzVerseCount } from "./quranMemorisationJuzVerse";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";
import type { MemorisationAnalyticsView } from "./quranMemorisationSurahPastAchievementData";

export type { MemorisationJuzFilterId, MemorisationAnalyticsView };

export type JuzMemorisationAnalyticsView = MemorisationAnalyticsView;

export type JuzMemorisationPastAchievementFilter = {
  id: MemorisationJuzFilterId;
  label: string;
  juzNumber: number;
};

export type MemorizationJuzAchievement = {
  id: string;
  juzNumber: number;
  memorizedAyahs: number;
  totalAyahs: number;
  totalTimeSpent: number;
  startAyah: string;
  endAyah: string;
};

export type JuzMemorisationPastAchievementRecord = {
  juzNumber: number;
  juzId: string;
  juzName: string;
  rangeLabel: string;
  memorizedAyahs: number;
  totalAyahs: number;
  status: "completed" | "incomplete";
  timeSpentMinutes: number;
  progressPercent: number;
};

type ChartPeriod = {
  xLabel: string;
  dateLabel: string;
  completed: number;
  incomplete: number;
  timeSpentMinutes: number;
};

type JuzUnitPeriodData = {
  juzNumber: number;
  juzId: string;
  juzName: string;
  rangeLabel: string;
  chartPeriods: ChartPeriod[];
  memorizedAyahs: number;
  totalAyahs: number;
  remainingAyahs: number;
  status: "completed" | "incomplete";
  totalTimeSpentMinutes: number;
};

export type JuzMemorisationPeriodSlice = {
  chartPeriods: ChartPeriod[];
  juzFilter: MemorisationJuzFilterId;
  targetJuzCount: number;
  completedJuzCount: number;
  memorizedAyahs: number;
  totalAyahs: number;
  remainingAyahs: number;
  totalTimeSpentMinutes: number;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  dateRangeLabel: string;
  pageCount: number;
  activePageIndex: number;
  juzRecords: JuzMemorisationPastAchievementRecord[];
  perJuz: Record<number, JuzUnitPeriodData>;
};

export type MemorisationJuzProgressRailRow = {
  juzId: string;
  juzNumber: number;
  juzName: string;
  rangeLabel: string;
  completedVerses: number;
  totalVerses: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
};

export const MEMORISATION_JUZ_SUMMARY_KEY =
  "progressLogging.achievementSummaryMemorisationJuz";

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

function parseRangeEnds(rangeLabel: string): { startAyah: string; endAyah: string } {
  const parts = rangeLabel.split("–").map((part) => part.trim());
  return {
    startAyah: parts[0] ?? rangeLabel,
    endAyah: parts[1] ?? rangeLabel,
  };
}

function formatLogDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function logTimeSpentMinutes(log: JuzMemorisationLogRecord): number {
  if (log.timeSpentMinutes > 0) return log.timeSpentMinutes;
  const fromFields = (log.hours ?? 0) * 60 + (log.minutes ?? 0);
  if (fromFields > 0) return fromFields;
  return Math.max(15, log.ayahsMemorizedToday * 8);
}

function groupByProgressEvents(
  logs: JuzMemorisationLogRecord[],
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

  const monthStart = monthFilter
    ? `${monthFilter.year}-${String(monthFilter.month + 1).padStart(2, "0")}-01`
    : null;

  const priorMemorized = monthStart
    ? logs
        .filter((log) => log.date < monthStart)
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

function buildJuzUnitFromLogs(
  goal: JuzMemorisationGoal,
  logs: JuzMemorisationLogRecord[],
): JuzUnitPeriodData {
  const juzLogs = logs.filter((log) => log.juzId === goal.id);
  const memorizedAyahs = goal.memorizedAyahs;
  const remainingAyahs = Math.max(0, goal.totalAyahs - memorizedAyahs);
  const chartPeriods = groupByProgressEvents(juzLogs, goal.totalAyahs, {
    year: 2025,
    month: 10,
  });

  return {
    juzNumber: goal.juzNumber,
    juzId: goal.id,
    juzName: goal.juzName,
    rangeLabel: goal.rangeLabel,
    chartPeriods,
    memorizedAyahs,
    totalAyahs: goal.totalAyahs,
    remainingAyahs,
    status: memorizedAyahs >= goal.totalAyahs ? "completed" : "incomplete",
    totalTimeSpentMinutes: juzLogs.reduce(
      (sum, log) => sum + logTimeSpentMinutes(log),
      0,
    ),
  };
}

function unitToRecord(unit: JuzUnitPeriodData): JuzMemorisationPastAchievementRecord {
  return {
    juzNumber: unit.juzNumber,
    juzId: unit.juzId,
    juzName: unit.juzName,
    rangeLabel: unit.rangeLabel,
    memorizedAyahs: unit.memorizedAyahs,
    totalAyahs: unit.totalAyahs,
    status: unit.status,
    timeSpentMinutes: unit.totalTimeSpentMinutes,
    progressPercent:
      unit.totalAyahs > 0
        ? Math.min(100, (unit.memorizedAyahs / unit.totalAyahs) * 100)
        : 0,
  };
}

function aggregateChartPeriods(units: JuzUnitPeriodData[]): ChartPeriod[] {
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

    const labelPeriod =
      units
        .map((unit) => unit.chartPeriods[index])
        .find((period) => period != null) ??
      units
        .map((unit) => unit.chartPeriods.at(-1))
        .find((period) => period != null);

    return {
      xLabel: labelPeriod?.xLabel ?? `p${index + 1}`,
      dateLabel: labelPeriod?.dateLabel ?? "",
      completed,
      incomplete,
      timeSpentMinutes,
    };
  });
}

function buildSliceFromUnits(
  units: JuzUnitPeriodData[],
  meta: {
    juzFilter: MemorisationJuzFilterId;
    previousPeriodDeltaPercent: number;
    dateRangeLabel: string;
    pageCount: number;
    activePageIndex: number;
  },
): JuzMemorisationPeriodSlice {
  const memorizedAyahs = units.reduce((sum, unit) => sum + unit.memorizedAyahs, 0);
  const totalAyahs = units.reduce((sum, unit) => sum + unit.totalAyahs, 0);
  const completedJuzCount = units.filter((unit) => unit.status === "completed").length;

  return {
    chartPeriods: aggregateChartPeriods(units),
    juzFilter: meta.juzFilter,
    targetJuzCount: units.length,
    completedJuzCount,
    memorizedAyahs,
    totalAyahs,
    remainingAyahs: Math.max(0, totalAyahs - memorizedAyahs),
    totalTimeSpentMinutes: units.reduce(
      (sum, unit) => sum + unit.totalTimeSpentMinutes,
      0,
    ),
    achievementPercent:
      totalAyahs > 0
        ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 100))
        : 0,
    previousPeriodDeltaPercent: meta.previousPeriodDeltaPercent,
    dateRangeLabel: meta.dateRangeLabel,
    pageCount: meta.pageCount,
    activePageIndex: meta.activePageIndex,
    juzRecords: units.map(unitToRecord),
    perJuz: Object.fromEntries(units.map((unit) => [unit.juzNumber, unit])),
  };
}

function buildMonthlyPerJuzData(): JuzUnitPeriodData[] {
  const goals = getJuzMemorisationGoals();
  const allLogs = getJuzMemorisationLogsForFilter("all");
  return goals.map((goal) => buildJuzUnitFromLogs(goal, allLogs));
}

function buildMonthlySlice(): JuzMemorisationPeriodSlice {
  const units = buildMonthlyPerJuzData();
  const periodCount = Math.max(
    ...units.map((unit) => unit.chartPeriods.length),
    1,
  );

  return buildSliceFromUnits(units, {
    juzFilter: "all",
    previousPeriodDeltaPercent: 12,
    dateRangeLabel: "Nov 1 — 30, 25",
    pageCount: periodCount,
    activePageIndex: Math.max(0, periodCount - 1),
  });
}

function scaleUnitToMonths(
  unit: JuzUnitPeriodData,
  labels: Array<{ xLabel: string; dateLabel: string }>,
  memorizedByMonth: number[],
  timeByMonth: number[],
): JuzUnitPeriodData {
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

  return { ...unit, chartPeriods };
}

function scaleJuzSlice(
  slice: JuzMemorisationPeriodSlice,
  period: PastAchievementPeriod,
): JuzMemorisationPeriodSlice {
  if (period === "monthly") return slice;

  const units = Object.values(slice.perJuz);

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
      juzFilter: slice.juzFilter,
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
    juzFilter: slice.juzFilter,
    previousPeriodDeltaPercent: 5,
    dateRangeLabel: "Jun — Nov, 25",
    pageCount: 6,
    activePageIndex: 5,
  });
}

function filterJuzPeriodSlice(
  slice: JuzMemorisationPeriodSlice,
  juzFilter: MemorisationJuzFilterId,
): JuzMemorisationPeriodSlice {
  if (juzFilter === "all") return slice;

  const goal = getJuzMemorisationGoals().find((item) => item.id === juzFilter);
  const unit = goal ? slice.perJuz[goal.juzNumber] : undefined;

  if (!unit) {
    const totalAyahs = goal ? goal.totalAyahs : getJuzVerseCount(juzFilter);
    return {
      ...slice,
      juzFilter,
      chartPeriods: slice.chartPeriods.map((period) => ({
        ...period,
        completed: 0,
        incomplete: totalAyahs,
        timeSpentMinutes: 0,
      })),
      targetJuzCount: 1,
      completedJuzCount: 0,
      memorizedAyahs: 0,
      totalAyahs,
      remainingAyahs: totalAyahs,
      totalTimeSpentMinutes: 0,
      achievementPercent: 0,
      juzRecords: [],
    };
  }

  return {
    ...slice,
    juzFilter,
    chartPeriods: unit.chartPeriods,
    targetJuzCount: 1,
    completedJuzCount: unit.status === "completed" ? 1 : 0,
    memorizedAyahs: unit.memorizedAyahs,
    totalAyahs: unit.totalAyahs,
    remainingAyahs: unit.remainingAyahs,
    totalTimeSpentMinutes: unit.totalTimeSpentMinutes,
    achievementPercent:
      unit.totalAyahs > 0
        ? Math.min(100, Math.round((unit.memorizedAyahs / unit.totalAyahs) * 100))
        : 0,
    juzRecords: [unitToRecord(unit)],
  };
}

let cachedMonthlySlice: JuzMemorisationPeriodSlice | null = null;

function getBaseMonthlySlice(): JuzMemorisationPeriodSlice {
  if (!cachedMonthlySlice) {
    cachedMonthlySlice = buildMonthlySlice();
  }
  return cachedMonthlySlice;
}

export function getJuzMemorisationPastAchievementFilters(): JuzMemorisationPastAchievementFilter[] {
  const goals = getJuzMemorisationGoals();
  return [
    { id: "all", label: "All", juzNumber: 0 },
    ...goals.map((goal) => ({
      id: goal.id,
      label: goal.juzName,
      juzNumber: goal.juzNumber,
    })),
  ];
}

export function getJuzMemorisationPastAchievementSlice(
  period: PastAchievementPeriod,
  juzFilter: MemorisationJuzFilterId = "all",
): JuzMemorisationPeriodSlice {
  const scaled = scaleJuzSlice(getBaseMonthlySlice(), period);
  return filterJuzPeriodSlice(scaled, juzFilter);
}

function buildChartFromSlice(slice: JuzMemorisationPeriodSlice): QuranPastChartItem[] {
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

function sliceToAchievement(slice: JuzMemorisationPeriodSlice): QuranHoursPastAchievement {
  const chartData = buildChartFromSlice(slice);
  const yAxis = computeYAxis(chartData);
  const pageCount = chartData.length;

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
    pageCount,
    activePageIndex: Math.min(
      Math.max(slice.activePageIndex, 0),
      Math.max(pageCount - 1, 0),
    ),
    chartData,
    ...yAxis,
  };
}

export function getJuzMemorisationPastAchievement(
  period: PastAchievementPeriod,
  juzFilter: MemorisationJuzFilterId = "all",
): QuranHoursPastAchievement {
  return sliceToAchievement(getJuzMemorisationPastAchievementSlice(period, juzFilter));
}

export function applyJuzMemorisationAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: JuzMemorisationPeriodSlice,
  view: JuzMemorisationAnalyticsView,
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

export function getJuzMemorisationTimeSpentByPeriod(
  slice: JuzMemorisationPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalJuzMemorisationTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatJuzMemorisationCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatJuzMemorisationTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatMemorisationJuzTimeSpentChip(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getJuzMemorisationAyahProgressPercent(
  memorizedAyahs: number,
  totalAyahs: number,
): number {
  if (totalAyahs <= 0) return 0;
  return Math.min(100, (memorizedAyahs / totalAyahs) * 100);
}

export function getMemorisationJuzGoalTrackedMonths(
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

export function getTotalJuzMemorizedVerses(slice: JuzMemorisationPeriodSlice): number {
  return slice.memorizedAyahs;
}

function getVersesForPeriod(
  unit: JuzUnitPeriodData,
  selectedBarIndex: number,
): Pick<
  MemorisationJuzProgressRailRow,
  "completedVerses" | "totalVerses" | "isCompleted"
> {
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
  unit: JuzUnitPeriodData,
  selectedBarIndex: number | null,
): MemorisationJuzProgressRailRow {
  const progress =
    selectedBarIndex !== null
      ? getVersesForPeriod(unit, selectedBarIndex)
      : {
          completedVerses: unit.memorizedAyahs,
          totalVerses: unit.totalAyahs,
          isCompleted: unit.status === "completed",
        };

  return {
    juzId: unit.juzId,
    juzNumber: unit.juzNumber,
    juzName: unit.juzName,
    rangeLabel: unit.rangeLabel,
    ...progress,
    timeSpentMinutes:
      selectedBarIndex !== null
        ? (unit.chartPeriods[selectedBarIndex]?.timeSpentMinutes ?? 0)
        : unit.totalTimeSpentMinutes,
  };
}

function buildEmptyProgressRailRow(goal: JuzMemorisationGoal): MemorisationJuzProgressRailRow {
  return {
    juzId: goal.id,
    juzNumber: goal.juzNumber,
    juzName: goal.juzName,
    rangeLabel: goal.rangeLabel,
    completedVerses: 0,
    totalVerses: goal.totalAyahs,
    isCompleted: false,
    timeSpentMinutes: 0,
  };
}

export function getMemorisationJuzProgressRailRows(
  allSlice: JuzMemorisationPeriodSlice,
  filteredSlice: JuzMemorisationPeriodSlice,
  juzFilter: MemorisationJuzFilterId,
  selectedBarIndex: number | null,
): MemorisationJuzProgressRailRow[] {
  if (juzFilter === "all") {
    return getJuzMemorisationGoals().map((goal) => {
      const unit = allSlice.perJuz[goal.juzNumber];
      return unit
        ? buildProgressRailRowForUnit(unit, selectedBarIndex)
        : buildEmptyProgressRailRow(goal);
    });
  }

  const goal = getJuzMemorisationGoalsForFilter(juzFilter)[0];
  const unit = goal ? filteredSlice.perJuz[goal.juzNumber] : undefined;
  if (!unit || !goal) {
    return goal ? [buildEmptyProgressRailRow(goal)] : [];
  }

  return [buildProgressRailRowForUnit(unit, selectedBarIndex)];
}

export function hasMemorisationJuzPastAchievementLogs(
  slice: JuzMemorisationPeriodSlice,
): boolean {
  return slice.chartPeriods.some(
    (period) => period.completed > 0 || period.timeSpentMinutes > 0,
  );
}

export function unitToMemorizationJuzAchievement(
  unit: JuzUnitPeriodData,
): MemorizationJuzAchievement {
  const { startAyah, endAyah } = parseRangeEnds(unit.rangeLabel);
  return {
    id: unit.juzId,
    juzNumber: unit.juzNumber,
    memorizedAyahs: unit.memorizedAyahs,
    totalAyahs: unit.totalAyahs,
    totalTimeSpent: unit.totalTimeSpentMinutes,
    startAyah,
    endAyah,
  };
}

export function invalidateJuzMemorisationPastAchievementCache(): void {
  cachedMonthlySlice = null;
}

export type JuzMemorisationCompactPastAchievement = {
  juzId: MemorisationJuzFilterId;
  juzName: string;
  totalAyahs: number;
  memorizedAyahs: number;
  remainingAyahs: number;
  progressPercent: number;
  completed: boolean;
  chartData: QuranPastChartItem[];
  yMax: number;
  yTicks: number[];
};

export function getJuzMemorisationCompactPastAchievement(
  juzFilter: MemorisationJuzFilterId = "all",
): JuzMemorisationCompactPastAchievement {
  const slice = getJuzMemorisationPastAchievementSlice("monthly", juzFilter);
  const achievement = sliceToAchievement(slice);
  const goals = getJuzMemorisationGoalsForFilter(juzFilter);
  const juzName =
    juzFilter === "all"
      ? "All Juz"
      : (goals[0]?.juzName ?? juzFilter);

  return {
    juzId: juzFilter,
    juzName,
    totalAyahs: slice.totalAyahs,
    memorizedAyahs: slice.memorizedAyahs,
    remainingAyahs: slice.remainingAyahs,
    progressPercent: slice.achievementPercent,
    completed:
      juzFilter === "all"
        ? goals.length > 0 && goals.every((goal) => goal.completed)
        : (goals[0]?.completed ?? false),
    chartData: achievement.chartData,
    yMax: achievement.yMax,
    yTicks: achievement.yTicks,
  };
}
