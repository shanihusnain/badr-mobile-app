import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import {
  getHizbMemorisationLogsForFilter,
  type HizbMemorisationLogRecord,
} from "./quranMemorisationHizbData";
import {
  getHizbMemorisationGoals,
  getHizbMemorisationGoalsForFilter,
  type HizbMemorisationGoal,
  type MemorisationHizbFilterId,
} from "./quranMemorisationHizbGoals";
import { getHizbVerseCount } from "./quranHizbVerseMap";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";
import type { MemorisationAnalyticsView } from "./quranMemorisationSurahPastAchievementData";

export type { MemorisationHizbFilterId, MemorisationAnalyticsView };

export type MemorisationHizbPastAchievementFilter = {
  id: MemorisationHizbFilterId;
  hizbName: string;
};

export type MemorizationHizbAchievement = {
  id: string;
  hizbNumber: number;
  memorizedAyahs: number;
  totalAyahs: number;
  totalTimeSpent: number;
  startAyah: string;
  endAyah: string;
};

type ChartPeriod = {
  xLabel: string;
  dateLabel: string;
  completed: number;
  incomplete: number;
  timeSpentMinutes: number;
};

export type MemorisationHizbUnitPeriodData = {
  hizbId: string;
  hizbNumber: number;
  hizbName: string;
  rangeLabel: string;
  chartPeriods: ChartPeriod[];
  memorizedAyahs: number;
  totalAyahs: number;
  remainingAyahs: number;
  status: "completed" | "incomplete";
  totalTimeSpentMinutes: number;
};

export type MemorisationHizbPeriodSlice = {
  chartPeriods: ChartPeriod[];
  totalAyahs: number;
  memorizedAyahs: number;
  remainingAyahs: number;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  dateRangeLabel: string;
  pageCount: number;
  activePageIndex: number;
  hizbRecords: MemorizationHizbAchievement[];
  perHizb: Record<string, MemorisationHizbUnitPeriodData>;
};

export type MemorisationHizbProgressRailRow = {
  hizbId: string;
  hizbNumber: number;
  hizbName: string;
  rangeLabel: string;
  completedVerses: number;
  totalVerses: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
};

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

function parseHizbNumber(hizbId: string): number {
  const parsed = Number(hizbId.replace(/^hizb-/, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

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

function logTimeSpentMinutes(log: HizbMemorisationLogRecord): number {
  const fromFields = (log.hours ?? 0) * 60 + (log.minutes ?? 0);
  if (fromFields > 0) return fromFields;
  return Math.max(15, log.ayahsMemorizedToday * 8);
}

function groupByProgressEvents(
  logs: HizbMemorisationLogRecord[],
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

function buildHizbUnitFromLogs(
  goal: HizbMemorisationGoal,
  logs: HizbMemorisationLogRecord[],
): MemorisationHizbUnitPeriodData {
  const totalAyahs = goal.totalAyahs;
  const memorizedAyahs = goal.memorizedAyahs;
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const hizbLogs = logs.filter((log) => log.hizbId === goal.id);
  const chartPeriods = groupByProgressEvents(hizbLogs, totalAyahs, {
    year: 2025,
    month: 10,
  });
  const totalTimeSpentMinutes = hizbLogs.reduce(
    (sum, log) => sum + logTimeSpentMinutes(log),
    0,
  );

  return {
    hizbId: goal.id,
    hizbNumber: parseHizbNumber(goal.id),
    hizbName: goal.hizbName,
    rangeLabel: goal.rangeLabel,
    chartPeriods,
    memorizedAyahs,
    totalAyahs,
    remainingAyahs,
    status: memorizedAyahs >= totalAyahs ? "completed" : "incomplete",
    totalTimeSpentMinutes,
  };
}

function unitToRecord(unit: MemorisationHizbUnitPeriodData): MemorizationHizbAchievement {
  const { startAyah, endAyah } = parseRangeEnds(unit.rangeLabel);
  return {
    id: unit.hizbId,
    hizbNumber: unit.hizbNumber,
    memorizedAyahs: unit.memorizedAyahs,
    totalAyahs: unit.totalAyahs,
    totalTimeSpent: unit.totalTimeSpentMinutes,
    startAyah,
    endAyah,
  };
}

function aggregateChartPeriods(units: MemorisationHizbUnitPeriodData[]): ChartPeriod[] {
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
  units: MemorisationHizbUnitPeriodData[],
  meta: Omit<
    MemorisationHizbPeriodSlice,
    | "chartPeriods"
    | "totalAyahs"
    | "memorizedAyahs"
    | "remainingAyahs"
    | "achievementPercent"
    | "hizbRecords"
    | "perHizb"
  >,
): MemorisationHizbPeriodSlice {
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
    hizbRecords: activeUnits.map(unitToRecord),
    perHizb: Object.fromEntries(units.map((unit) => [unit.hizbId, unit])),
  };
}

function buildMonthlyPerHizbData(): MemorisationHizbUnitPeriodData[] {
  const goals = getHizbMemorisationGoals();
  const allLogs = getHizbMemorisationLogsForFilter("all");

  return goals.map((goal) => buildHizbUnitFromLogs(goal, allLogs));
}

function buildMonthlySlice(): MemorisationHizbPeriodSlice {
  const units = buildMonthlyPerHizbData();
  return buildSliceFromUnits(units, {
    previousPeriodDeltaPercent: 10,
    dateRangeLabel: "Nov 1 — 30, 25",
    pageCount: units[0]?.chartPeriods.length ?? 1,
    activePageIndex: Math.max(0, (units[0]?.chartPeriods.length ?? 1) - 1),
  });
}

function scaleUnitToMonths(
  unit: MemorisationHizbUnitPeriodData,
  labels: Array<{ xLabel: string; dateLabel: string }>,
  memorizedByMonth: number[],
  timeByMonth: number[],
): MemorisationHizbUnitPeriodData {
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

function scaleMemorisationHizbSlice(
  slice: MemorisationHizbPeriodSlice,
  period: PastAchievementPeriod,
): MemorisationHizbPeriodSlice {
  if (period === "monthly") return slice;

  const units = Object.values(slice.perHizb);

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
      previousPeriodDeltaPercent: 7,
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
    previousPeriodDeltaPercent: 4,
    dateRangeLabel: "Jun — Nov, 25",
    pageCount: 6,
    activePageIndex: 5,
  });
}

function filterMemorisationHizbSlice(
  slice: MemorisationHizbPeriodSlice,
  hizbFilter: MemorisationHizbFilterId,
): MemorisationHizbPeriodSlice {
  if (hizbFilter === "all") return slice;

  const unit = slice.perHizb[hizbFilter];
  if (!unit) {
    const totalAyahs = getHizbVerseCount(hizbFilter);
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
      hizbRecords: [],
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
    hizbRecords:
      unit.memorizedAyahs > 0 || unit.totalTimeSpentMinutes > 0 ? [record] : [],
  };
}

let cachedMonthlySlice: MemorisationHizbPeriodSlice | null = null;

function getBaseMonthlySlice(): MemorisationHizbPeriodSlice {
  if (!cachedMonthlySlice) {
    cachedMonthlySlice = buildMonthlySlice();
  }
  return cachedMonthlySlice;
}

export function getMemorisationHizbPastAchievementFilters(): MemorisationHizbPastAchievementFilter[] {
  const goals = getHizbMemorisationGoals();
  return [
    { id: "all", hizbName: "All" },
    ...goals.map((goal) => ({
      id: goal.id,
      hizbName: goal.hizbName,
    })),
  ];
}

export function getQuranMemorisationHizbPastAchievementSlice(
  period: PastAchievementPeriod,
  hizbFilter: MemorisationHizbFilterId = "all",
): MemorisationHizbPeriodSlice {
  const scaled = scaleMemorisationHizbSlice(getBaseMonthlySlice(), period);
  return filterMemorisationHizbSlice(scaled, hizbFilter);
}

function buildChartFromSlice(
  slice: MemorisationHizbPeriodSlice,
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
  slice: MemorisationHizbPeriodSlice,
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

export function getQuranMemorisationHizbPastAchievement(
  period: PastAchievementPeriod,
  hizbFilter: MemorisationHizbFilterId = "all",
): QuranHoursPastAchievement {
  return sliceToAchievement(
    getQuranMemorisationHizbPastAchievementSlice(period, hizbFilter),
  );
}

export function applyMemorisationHizbAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: MemorisationHizbPeriodSlice,
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

export function getMemorisationHizbTimeSpentByPeriod(
  slice: MemorisationHizbPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalMemorisationHizbTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatMemorisationHizbAyahCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatMemorisationHizbTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatMemorisationHizbTimeSpentChip(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getMemorisationHizbGoalTrackedMonths(
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

export function getTotalHizbMemorizedVerses(
  slice: MemorisationHizbPeriodSlice,
): number {
  return slice.memorizedAyahs;
}

function getVersesForPeriod(
  unit: MemorisationHizbUnitPeriodData,
  selectedBarIndex: number,
): Pick<
  MemorisationHizbProgressRailRow,
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
  unit: MemorisationHizbUnitPeriodData,
  selectedBarIndex: number | null,
): MemorisationHizbProgressRailRow {
  const progress =
    selectedBarIndex !== null
      ? getVersesForPeriod(unit, selectedBarIndex)
      : {
          completedVerses: unit.memorizedAyahs,
          totalVerses: unit.totalAyahs,
          isCompleted: unit.status === "completed",
        };

  return {
    hizbId: unit.hizbId,
    hizbNumber: unit.hizbNumber,
    hizbName: unit.hizbName,
    rangeLabel: unit.rangeLabel,
    ...progress,
    timeSpentMinutes:
      selectedBarIndex !== null
        ? (unit.chartPeriods[selectedBarIndex]?.timeSpentMinutes ?? 0)
        : unit.totalTimeSpentMinutes,
  };
}

function buildEmptyProgressRailRow(
  goal: HizbMemorisationGoal,
): MemorisationHizbProgressRailRow {
  return {
    hizbId: goal.id,
    hizbNumber: parseHizbNumber(goal.id),
    hizbName: goal.hizbName,
    rangeLabel: goal.rangeLabel,
    completedVerses: 0,
    totalVerses: goal.totalAyahs,
    isCompleted: false,
    timeSpentMinutes: 0,
  };
}

export function getMemorisationHizbProgressRailRows(
  allSlice: MemorisationHizbPeriodSlice,
  filteredSlice: MemorisationHizbPeriodSlice,
  hizbFilter: MemorisationHizbFilterId,
  selectedBarIndex: number | null,
): MemorisationHizbProgressRailRow[] {
  if (hizbFilter === "all") {
    return getHizbMemorisationGoals().map((goal) => {
      const unit = allSlice.perHizb[goal.id];
      return unit
        ? buildProgressRailRowForUnit(unit, selectedBarIndex)
        : buildEmptyProgressRailRow(goal);
    });
  }

  const unit =
    filteredSlice.perHizb[hizbFilter] ?? allSlice.perHizb[hizbFilter];
  if (!unit) {
    const goal = getHizbMemorisationGoalsForFilter(hizbFilter)[0];
    if (!goal) return [];
    return [buildEmptyProgressRailRow(goal)];
  }

  return [buildProgressRailRowForUnit(unit, selectedBarIndex)];
}

export function hasMemorisationHizbPastAchievementLogs(
  slice: MemorisationHizbPeriodSlice,
): boolean {
  return slice.chartPeriods.some(
    (period) => period.completed > 0 || period.timeSpentMinutes > 0,
  );
}
