import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import { getJuzRecitationProgress } from "./quranRecitationJuzData";
import {
  getJuzRangeLabel,
  getJuzVerseCountFromMap,
  getJuzVerseMetadata,
} from "./quranJuzVerseMap";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";

export type JuzFilterId = "all" | number;

export type JuzAnalyticsView = "completedVsIncomplete" | "completedVsTimeSpent";

export type JuzPastStatus = "completed" | "incomplete";

export type JuzPastAchievementFilter = {
  id: JuzFilterId;
  label: string;
};

export type JuzPastAchievementRecord = {
  juzNumber: number;
  completedAyatCount: number;
  totalAyatCount: number;
  status: JuzPastStatus;
  timeSpentMinutes: number;
};

type ChartPeriod = {
  xLabel: string;
  dateLabel: string;
  completed: number;
  incomplete: number;
  timeSpentMinutes: number;
};

export type JuzUnitPeriodData = {
  juzNumber: number;
  chartPeriods: ChartPeriod[];
  completedAyatCount: number;
  totalAyatCount: number;
  status: JuzPastStatus;
  timeSpentMinutes: number;
};

export type JuzPeriodSlice = {
  chartPeriods: ChartPeriod[];
  targetJuzCount: number;
  completedJuzCount: number;
  juzRange: { startJuz: number; endJuz: number };
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  dateRangeLabel: string;
  pageCount: number;
  activePageIndex: number;
  juzRecords: JuzPastAchievementRecord[];
  perJuz: Record<number, JuzUnitPeriodData>;
};

const CYCLE_WEEK_LABELS = [
  { xLabel: "w1", dateLabel: "Nov 1–7" },
  { xLabel: "w2", dateLabel: "Nov 8–14" },
  { xLabel: "w3", dateLabel: "Nov 15–21" },
  { xLabel: "w4", dateLabel: "Nov 22–28" },
];

const MOTIVATIONAL_SUMMARY_KEY = "progressLogging.achievementSummaryRecitationJuz";

function emptyChartPeriods(): ChartPeriod[] {
  return CYCLE_WEEK_LABELS.map((week) => ({
    ...week,
    completed: 0,
    incomplete: 0,
    timeSpentMinutes: 0,
  }));
}

function buildJuzUnit(
  juzNumber: number,
  input: Partial<
    Pick<
      JuzUnitPeriodData,
      "chartPeriods" | "completedAyatCount" | "timeSpentMinutes" | "status"
    >
  > = {},
): JuzUnitPeriodData {
  const totalAyatCount = getJuzVerseCountFromMap(juzNumber);
  const completedAyatCount = input.completedAyatCount ?? 0;
  const status: JuzPastStatus =
    input.status ??
    (completedAyatCount >= totalAyatCount ? "completed" : "incomplete");

  return {
    juzNumber,
    chartPeriods: input.chartPeriods ?? emptyChartPeriods(),
    completedAyatCount,
    totalAyatCount,
    status,
    timeSpentMinutes: input.timeSpentMinutes ?? 0,
  };
}

function unitToRecord(unit: JuzUnitPeriodData): JuzPastAchievementRecord {
  return {
    juzNumber: unit.juzNumber,
    completedAyatCount: unit.completedAyatCount,
    totalAyatCount: unit.totalAyatCount,
    status: unit.status,
    timeSpentMinutes: unit.timeSpentMinutes,
  };
}

/** Merge multiple partial logs for the same juz into one row. */
export function mergeJuzPastRecords(
  records: JuzPastAchievementRecord[],
): JuzPastAchievementRecord[] {
  const merged = new Map<number, JuzPastAchievementRecord>();

  records.forEach((record) => {
    const existing = merged.get(record.juzNumber);
    if (!existing) {
      merged.set(record.juzNumber, { ...record });
      return;
    }

    const completedAyatCount = Math.max(
      existing.completedAyatCount,
      record.completedAyatCount,
    );
    const totalAyatCount = existing.totalAyatCount;
    merged.set(record.juzNumber, {
      juzNumber: record.juzNumber,
      completedAyatCount,
      totalAyatCount,
      status:
        completedAyatCount >= totalAyatCount ? "completed" : "incomplete",
      timeSpentMinutes: existing.timeSpentMinutes + record.timeSpentMinutes,
    });
  });

  return [...merged.values()].sort((a, b) => a.juzNumber - b.juzNumber);
}

function aggregateChartPeriods(units: JuzUnitPeriodData[]): ChartPeriod[] {
  const periodCount = units[0]?.chartPeriods.length ?? CYCLE_WEEK_LABELS.length;

  return Array.from({ length: periodCount }, (_, index) => ({
    xLabel: units[0]?.chartPeriods[index]?.xLabel ?? `p${index + 1}`,
    dateLabel: units[0]?.chartPeriods[index]?.dateLabel ?? "",
    completed: units.reduce(
      (sum, unit) => sum + (unit.chartPeriods[index]?.completed ?? 0),
      0,
    ),
    incomplete: units.reduce(
      (sum, unit) => sum + (unit.chartPeriods[index]?.incomplete ?? 0),
      0,
    ),
    timeSpentMinutes: units.reduce(
      (sum, unit) => sum + (unit.chartPeriods[index]?.timeSpentMinutes ?? 0),
      0,
    ),
  }));
}

function buildSliceFromUnits(
  units: JuzUnitPeriodData[],
  meta: Omit<
    JuzPeriodSlice,
    | "chartPeriods"
    | "targetJuzCount"
    | "completedJuzCount"
    | "achievementPercent"
    | "juzRecords"
    | "perJuz"
  > & { juzRange: { startJuz: number; endJuz: number } },
): JuzPeriodSlice {
  const activeUnits = units.filter(
    (unit) => unit.completedAyatCount > 0 || unit.timeSpentMinutes > 0,
  );
  const completedJuzCount = activeUnits.filter(
    (unit) => unit.status === "completed",
  ).length;
  const targetJuzCount = meta.juzRange.endJuz - meta.juzRange.startJuz + 1;

  return {
    ...meta,
    chartPeriods: aggregateChartPeriods(units),
    targetJuzCount,
    completedJuzCount,
    achievementPercent: Math.round(
      (completedJuzCount / Math.max(targetJuzCount, 1)) * 100,
    ),
    juzRecords: mergeJuzPastRecords(activeUnits.map(unitToRecord)),
    perJuz: Object.fromEntries(units.map((unit) => [unit.juzNumber, unit])),
  };
}

function buildMonthlyPerJuzData(
  range: { startJuz: number; endJuz: number },
): JuzUnitPeriodData[] {
  const units: JuzUnitPeriodData[] = [];

  for (let juz = range.startJuz; juz <= range.endJuz; juz += 1) {
    if (juz === 1) {
      units.push(
        buildJuzUnit(1, {
          completedAyatCount: getJuzVerseCountFromMap(1),
          status: "completed",
          timeSpentMinutes: 95,
          chartPeriods: [
            { ...CYCLE_WEEK_LABELS[0], completed: 1, incomplete: 0, timeSpentMinutes: 95 },
            { ...CYCLE_WEEK_LABELS[1], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
            { ...CYCLE_WEEK_LABELS[2], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
            { ...CYCLE_WEEK_LABELS[3], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
          ],
        }),
      );
      continue;
    }

    if (juz === 2) {
      units.push(
        buildJuzUnit(2, {
          completedAyatCount: getJuzVerseCountFromMap(2),
          status: "completed",
          timeSpentMinutes: 88,
          chartPeriods: [
            { ...CYCLE_WEEK_LABELS[0], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
            { ...CYCLE_WEEK_LABELS[1], completed: 1, incomplete: 0, timeSpentMinutes: 88 },
            { ...CYCLE_WEEK_LABELS[2], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
            { ...CYCLE_WEEK_LABELS[3], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
          ],
        }),
      );
      continue;
    }

    if (juz === 3) {
      units.push(
        buildJuzUnit(3, {
          completedAyatCount: 45,
          status: "incomplete",
          timeSpentMinutes: 42,
          chartPeriods: [
            { ...CYCLE_WEEK_LABELS[0], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
            { ...CYCLE_WEEK_LABELS[1], completed: 0, incomplete: 1, timeSpentMinutes: 20 },
            { ...CYCLE_WEEK_LABELS[2], completed: 0, incomplete: 0, timeSpentMinutes: 22 },
            { ...CYCLE_WEEK_LABELS[3], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
          ],
        }),
      );
      continue;
    }

    if (juz === 5) {
      units.push(
        buildJuzUnit(5, {
          completedAyatCount: 65,
          status: "incomplete",
          timeSpentMinutes: 55,
          chartPeriods: [
            { ...CYCLE_WEEK_LABELS[0], completed: 0, incomplete: 0, timeSpentMinutes: 0 },
            { ...CYCLE_WEEK_LABELS[1], completed: 0, incomplete: 1, timeSpentMinutes: 15 },
            { ...CYCLE_WEEK_LABELS[2], completed: 0, incomplete: 1, timeSpentMinutes: 25 },
            { ...CYCLE_WEEK_LABELS[3], completed: 0, incomplete: 0, timeSpentMinutes: 15 },
          ],
        }),
      );
      continue;
    }

    units.push(buildJuzUnit(juz));
  }

  return units;
}

function buildMonthlySlice(range: {
  startJuz: number;
  endJuz: number;
}): JuzPeriodSlice {
  const units = buildMonthlyPerJuzData(range);
  return buildSliceFromUnits(units, {
    juzRange: range,
    previousPeriodDeltaPercent: 10,
    dateRangeLabel: "Nov 1 — 28, 24",
    pageCount: 4,
    activePageIndex: 2,
  });
}

function scaleJuzSlice(
  slice: JuzPeriodSlice,
  period: PastAchievementPeriod,
): JuzPeriodSlice {
  if (period === "monthly") return slice;

  if (period === "threeMonths") {
    const scaledUnits = Object.values(slice.perJuz).map((unit) => ({
      ...unit,
      chartPeriods: [
        {
          xLabel: "m1",
          dateLabel: "Sep 1–30",
          completed: unit.chartPeriods[0]?.completed ?? 0,
          incomplete: unit.chartPeriods[0]?.incomplete ?? 0,
          timeSpentMinutes: (unit.chartPeriods[0]?.timeSpentMinutes ?? 0) * 3,
        },
        {
          xLabel: "m2",
          dateLabel: "Oct 1–31",
          completed: unit.chartPeriods[1]?.completed ?? 0,
          incomplete: unit.chartPeriods[1]?.incomplete ?? 0,
          timeSpentMinutes: (unit.chartPeriods[1]?.timeSpentMinutes ?? 0) * 3,
        },
        {
          xLabel: "m3",
          dateLabel: "Nov 1–30",
          completed: unit.chartPeriods.reduce((sum, p) => sum + p.completed, 0),
          incomplete: unit.chartPeriods.reduce((sum, p) => sum + p.incomplete, 0),
          timeSpentMinutes: unit.chartPeriods.reduce(
            (sum, p) => sum + p.timeSpentMinutes,
            0,
          ),
        },
      ],
    }));

    return buildSliceFromUnits(scaledUnits, {
      juzRange: slice.juzRange,
      previousPeriodDeltaPercent: 6,
      dateRangeLabel: "Sep — Nov, 24",
      pageCount: 3,
      activePageIndex: 2,
    });
  }

  const scaledUnits = Object.values(slice.perJuz).map((unit) => ({
    ...unit,
    chartPeriods: [
      { xLabel: "m1", dateLabel: "Jun", completed: unit.chartPeriods[0]?.completed ?? 0, incomplete: unit.chartPeriods[0]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[0]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m2", dateLabel: "Jul", completed: unit.chartPeriods[1]?.completed ?? 0, incomplete: unit.chartPeriods[1]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[1]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m3", dateLabel: "Aug", completed: unit.chartPeriods[2]?.completed ?? 0, incomplete: unit.chartPeriods[2]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[2]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m4", dateLabel: "Sep", completed: unit.chartPeriods[3]?.completed ?? 0, incomplete: unit.chartPeriods[3]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[3]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m5", dateLabel: "Oct", completed: unit.chartPeriods[1]?.completed ?? 0, incomplete: unit.chartPeriods[1]?.incomplete ?? 0, timeSpentMinutes: (unit.chartPeriods[1]?.timeSpentMinutes ?? 0) * 2 },
      { xLabel: "m6", dateLabel: "Nov", completed: unit.chartPeriods.reduce((sum, p) => sum + p.completed, 0), incomplete: unit.chartPeriods.reduce((sum, p) => sum + p.incomplete, 0), timeSpentMinutes: unit.chartPeriods.reduce((sum, p) => sum + p.timeSpentMinutes, 0) },
    ],
  }));

  return buildSliceFromUnits(scaledUnits, {
    juzRange: slice.juzRange,
    previousPeriodDeltaPercent: -5,
    dateRangeLabel: "Jun — Nov, 24",
    pageCount: 6,
    activePageIndex: 4,
  });
}

function filterJuzPeriodSlice(
  slice: JuzPeriodSlice,
  juzFilter: JuzFilterId,
): JuzPeriodSlice {
  if (juzFilter === "all") return slice;

  const unit = slice.perJuz[juzFilter];
  if (!unit) {
    return {
      ...slice,
      chartPeriods: slice.chartPeriods.map((period) => ({
        ...period,
        completed: 0,
        incomplete: 0,
        timeSpentMinutes: 0,
      })),
      targetJuzCount: 1,
      completedJuzCount: 0,
      achievementPercent: 0,
      juzRecords: [],
    };
  }

  const record = unitToRecord(unit);
  return {
    ...slice,
    chartPeriods: unit.chartPeriods,
    targetJuzCount: 1,
    completedJuzCount: unit.status === "completed" ? 1 : 0,
    achievementPercent: Math.round(
      (unit.completedAyatCount / Math.max(unit.totalAyatCount, 1)) * 100,
    ),
    juzRecords:
      unit.completedAyatCount > 0 || unit.timeSpentMinutes > 0 ? [record] : [],
  };
}

function getConfiguredJuzRange() {
  return getJuzRecitationProgress().targetJuzRange;
}

let cachedMonthlySlice: JuzPeriodSlice | null = null;

function getBaseMonthlySlice(): JuzPeriodSlice {
  if (!cachedMonthlySlice) {
    cachedMonthlySlice = buildMonthlySlice(getConfiguredJuzRange());
  }
  return cachedMonthlySlice;
}

export function getJuzPastAchievementFilters(): JuzPastAchievementFilter[] {
  const { startJuz, endJuz } = getConfiguredJuzRange();
  const filters: JuzPastAchievementFilter[] = [{ id: "all", label: "All" }];

  for (let juz = startJuz; juz <= endJuz; juz += 1) {
    filters.push({ id: juz, label: `Juz ${juz}` });
  }

  return filters;
}

export function getQuranJuzPastAchievementSlice(
  period: PastAchievementPeriod,
  juzFilter: JuzFilterId = "all",
): JuzPeriodSlice {
  const scaled = scaleJuzSlice(getBaseMonthlySlice(), period);
  return filterJuzPeriodSlice(scaled, juzFilter);
}

function buildPeriodBar(
  xLabel: string,
  dateLabel: string,
  completed: number,
  periodGoal: number,
): QuranPastChartItem {
  const incompleteHours = Math.max(0, periodGoal - completed);
  return {
    xLabel,
    dateLabel,
    completedHours: completed,
    incompleteHours,
    hours: completed,
    stackTotalHours: completed + incompleteHours,
  };
}

function buildChartFromSlice(slice: JuzPeriodSlice): QuranPastChartItem[] {
  const periodGoal = Math.max(slice.targetJuzCount / slice.chartPeriods.length, 1);
  return slice.chartPeriods.map((period) =>
    buildPeriodBar(
      period.xLabel,
      period.dateLabel,
      period.completed,
      periodGoal,
    ),
  );
}

function computeYAxis(chartData: QuranPastChartItem[]) {
  const maxStack = Math.max(...chartData.map((item) => item.stackTotalHours), 0);
  const yMax = Math.max(4, Math.ceil(maxStack));
  const step = yMax <= 4 ? 1 : yMax <= 8 ? 2 : 4;
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );
  return { yMax, yTicks };
}

function sliceToAchievement(slice: JuzPeriodSlice): QuranHoursPastAchievement {
  const chartData = buildChartFromSlice(slice);
  const yAxis = computeYAxis(chartData);

  return {
    dateRangeLabel: slice.dateRangeLabel,
    achievementPercent: slice.achievementPercent,
    previousPeriodDeltaPercent: slice.previousPeriodDeltaPercent,
    goalHours: slice.targetJuzCount,
    periodGoalHours: slice.targetJuzCount / slice.chartPeriods.length,
    completedHours: chartData.reduce((sum, item) => sum + item.completedHours, 0),
    incompleteHours: chartData.reduce(
      (sum, item) => sum + item.incompleteHours,
      0,
    ),
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

export function getQuranJuzPastAchievement(
  period: PastAchievementPeriod,
  juzFilter: JuzFilterId = "all",
): QuranHoursPastAchievement {
  return sliceToAchievement(getQuranJuzPastAchievementSlice(period, juzFilter));
}

export function applyJuzAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: JuzPeriodSlice,
  view: JuzAnalyticsView,
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

export function getJuzTimeSpentByPeriod(slice: JuzPeriodSlice): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalJuzTimeSpentMinutes(timeSpentByPeriod: number[]): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatJuzCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatJuzTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function getJuzAyatProgressPercent(
  completedAyatCount: number,
  totalAyatCount: number,
): number {
  if (totalAyatCount <= 0) return 0;
  return Math.min(100, (completedAyatCount / totalAyatCount) * 100);
}

export type JuzAchievement = {
  id: string;
  juzNumber: number;
  completedVerses: number;
  totalVerses: number;
  completedSessions: number;
  incompleteSessions: number;
  totalTimeSpent: number;
  startAyah: string;
  endAyah: string;
};

export type JuzAchievementSummary = {
  achievements: JuzAchievement[];
};

export type JuzProgressRailRow = {
  juzNumber: number | null;
  title: string;
  rangeLabel: string;
  completedVerses: number;
  totalVerses: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
};

function countSessions(
  chartPeriods: ChartPeriod[],
  type: "completed" | "incomplete",
): number {
  return chartPeriods.filter((period) =>
    type === "completed" ? period.completed > 0 : period.incomplete > 0,
  ).length;
}

export function getJuzAchievements(slice: JuzPeriodSlice): JuzAchievement[] {
  return slice.juzRecords.map((record) => {
    const metadata = getJuzVerseMetadata(record.juzNumber);
    const unit = slice.perJuz[record.juzNumber];

    return {
      id: `juz-${record.juzNumber}`,
      juzNumber: record.juzNumber,
      completedVerses: record.completedAyatCount,
      totalVerses: record.totalAyatCount,
      completedSessions: unit ? countSessions(unit.chartPeriods, "completed") : 0,
      incompleteSessions: unit ? countSessions(unit.chartPeriods, "incomplete") : 0,
      totalTimeSpent: record.timeSpentMinutes,
      startAyah: metadata.startLabel,
      endAyah: metadata.endLabel,
    };
  });
}

function getJuzVersesForPeriod(
  unit: JuzUnitPeriodData,
  periodIndex: number,
): Pick<JuzProgressRailRow, "completedVerses" | "totalVerses" | "isCompleted"> {
  const period = unit.chartPeriods[periodIndex];
  const totalVerses = unit.totalAyatCount;

  if (!period || (period.completed === 0 && period.incomplete === 0)) {
    return { completedVerses: 0, totalVerses, isCompleted: false };
  }

  if (period.completed > 0) {
    return {
      completedVerses: totalVerses,
      totalVerses,
      isCompleted: true,
    };
  }

  const activePeriodCount = unit.chartPeriods.filter(
    (item) => item.completed > 0 || item.incomplete > 0,
  ).length;
  const completedVerses = Math.min(
    totalVerses,
    Math.max(
      1,
      Math.round(unit.completedAyatCount / Math.max(activePeriodCount, 1)),
    ),
  );

  return {
    completedVerses,
    totalVerses,
    isCompleted: completedVerses >= totalVerses,
  };
}

function buildJuzProgressRailRowForUnit(
  unit: JuzUnitPeriodData,
  selectedBarIndex: number | null,
): JuzProgressRailRow {
  const juzNumber = unit.juzNumber;
  const title = `Juz ${juzNumber}`;
  const rangeLabel = getJuzRangeLabel(juzNumber);

  if (selectedBarIndex !== null) {
    const periodProgress = getJuzVersesForPeriod(unit, selectedBarIndex);
    return {
      juzNumber,
      title,
      rangeLabel,
      ...periodProgress,
      timeSpentMinutes:
        unit.chartPeriods[selectedBarIndex]?.timeSpentMinutes ?? 0,
    };
  }

  return {
    juzNumber,
    title,
    rangeLabel,
    completedVerses: unit.completedAyatCount,
    totalVerses: unit.totalAyatCount,
    isCompleted: unit.status === "completed",
    timeSpentMinutes: unit.timeSpentMinutes,
  };
}

function buildEmptyJuzProgressRailRow(juzNumber: number): JuzProgressRailRow {
  const totalVerses = getJuzVerseCountFromMap(juzNumber);
  return {
    juzNumber,
    title: `Juz ${juzNumber}`,
    rangeLabel: getJuzRangeLabel(juzNumber),
    completedVerses: 0,
    totalVerses,
    isCompleted: false,
    timeSpentMinutes: 0,
  };
}

export function getJuzProgressRailRows(
  allSlice: JuzPeriodSlice,
  filteredSlice: JuzPeriodSlice,
  juzFilter: JuzFilterId,
  selectedBarIndex: number | null,
): JuzProgressRailRow[] {
  if (juzFilter === "all") {
    const rows: JuzProgressRailRow[] = [];

    for (
      let juz = allSlice.juzRange.startJuz;
      juz <= allSlice.juzRange.endJuz;
      juz += 1
    ) {
      const unit = allSlice.perJuz[juz];
      rows.push(
        unit
          ? buildJuzProgressRailRowForUnit(unit, selectedBarIndex)
          : buildEmptyJuzProgressRailRow(juz),
      );
    }

    return rows;
  }

  const unit = filteredSlice.perJuz[juzFilter] ?? allSlice.perJuz[juzFilter];
  if (!unit) {
    return [];
  }

  return [buildJuzProgressRailRowForUnit(unit, selectedBarIndex)];
}

/** @deprecated Use getJuzProgressRailRows */
export function getJuzProgressRailRow(
  allSlice: JuzPeriodSlice,
  filteredSlice: JuzPeriodSlice,
  juzFilter: JuzFilterId,
  selectedBarIndex: number | null,
): JuzProgressRailRow | null {
  const rows = getJuzProgressRailRows(
    allSlice,
    filteredSlice,
    juzFilter,
    selectedBarIndex,
  );
  return rows[0] ?? null;
}

export function formatJuzTimeSpentChip(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export { MOTIVATIONAL_SUMMARY_KEY };
