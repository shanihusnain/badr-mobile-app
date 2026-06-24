import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";
import {
  getMissedRamadanFastGoalTarget,
  getMissedRamadanFastProgress,
  getTodayDateString,
  isMissedRamadanFastCompletedDate,
  isMissedRamadanFastExplicitlySkippedDate,
  isMissedRamadanFastPlannedDate,
  normalizeDateString,
  type MissedRamadanFastLogRecord,
} from "./missedRamadanFastsData";

export type MissedRamadanAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTime";

export type MissedRamadanPeriodSlice = {
  chartPeriods: Array<{
    xLabel: string;
    dateLabel: string;
    startDate: string;
    endDate: string;
    completed: number;
    incomplete: number;
    timeSpentMinutes: number;
  }>;
  targetFasts: number;
  completedFasts: number;
  incompleteFasts: number;
  achievementPercent: number;
  previousPeriodDeltaPercent: number;
  dateRangeLabel: string;
  periodStartDate: string;
  periodEndDate: string;
  pageCount: number;
  activePageIndex: number;
  completedDates: string[];
  incompletePlannedDates: string[];
  calendarMonthDate: string;
};

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getMonthStart(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

function getMonthEnd(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setMonth(date.getMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
}

function shiftMonth(dateStr: string, deltaMonths: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setMonth(date.getMonth() + deltaMonths, 1);
  return getMonthStart(date.toISOString().slice(0, 10));
}

function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateRangeLabel(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const year = endDate.getFullYear().toString().slice(-2);

  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${formatShortDate(start)} – ${endDate.getDate()}, ${year}`;
  }

  return `${formatShortDate(start)} — ${formatShortDate(end)}, ${year}`;
}

function formatMultiMonthRangeLabel(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const year = endDate.getFullYear().toString().slice(-2);
  return `${startMonth} — ${endMonth}, ${year}`;
}

function formatWeekLabel(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()}–${endDate.getDate()}`;
  }

  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

function formatMonthBucketLabel(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return startMonth;
  }

  return `${startMonth} ${startDate.getDate()} – ${endMonth} ${endDate.getDate()}`;
}

function parseFastTimeLabel(time: string): number | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return null;

  const parsedHour = Number.parseInt(match[1], 10);
  const parsedMinute = Number.parseInt(match[2], 10);
  const period = match[3].toLowerCase() as "am" | "pm";

  if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) return null;
  if (parsedHour < 1 || parsedHour > 12 || parsedMinute < 0 || parsedMinute > 59) {
    return null;
  }

  const hour24 =
    period === "am"
      ? parsedHour === 12
        ? 0
        : parsedHour
      : parsedHour === 12
        ? 12
        : parsedHour + 12;

  return hour24 * 60 + parsedMinute;
}

function getLogDurationMinutes(log: MissedRamadanFastLogRecord): number {
  if (!log.completed || !log.startTime || !log.endTime) return 0;

  const start = parseFastTimeLabel(log.startTime);
  const end = parseFastTimeLabel(log.endTime);
  if (start === null || end === null || end <= start) return 0;

  return end - start;
}

function getCompletedLogsInRange(
  start: string,
  end: string,
): MissedRamadanFastLogRecord[] {
  return getMissedRamadanFastProgress().logs.filter((log) => {
    if (!log.completed) return false;
    const date = normalizeDateString(log.date);
    return date >= start && date <= end;
  });
}

function countCompletedInRange(start: string, end: string): number {
  const dates = new Set<string>();
  for (const log of getCompletedLogsInRange(start, end)) {
    dates.add(normalizeDateString(log.date));
  }
  return dates.size;
}

function isIncompletePlannedDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  const today = getTodayDateString();

  if (normalizedDate > today) return false;
  if (isMissedRamadanFastCompletedDate(normalizedDate)) return false;

  return (
    isMissedRamadanFastPlannedDate(normalizedDate) ||
    isMissedRamadanFastExplicitlySkippedDate(normalizedDate)
  );
}

function countIncompleteInRange(start: string, end: string): number {
  const progress = getMissedRamadanFastProgress();
  const seen = new Set<string>();
  let count = 0;

  for (const date of progress.plannedDates) {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate < start || normalizedDate > end) continue;
    if (!isIncompletePlannedDate(normalizedDate)) continue;
    if (seen.has(normalizedDate)) continue;
    seen.add(normalizedDate);
    count += 1;
  }

  return count;
}

function countPlannedInRange(start: string, end: string): number {
  return getMissedRamadanFastProgress().plannedDates.filter((date) => {
    const normalizedDate = normalizeDateString(date);
    return normalizedDate >= start && normalizedDate <= end;
  }).length;
}

function getPeriodTargetFasts(start: string, end: string): number {
  const plannedInRange = countPlannedInRange(start, end);
  if (plannedInRange > 0) return plannedInRange;

  const goalTarget = getMissedRamadanFastGoalTarget();
  const rangeDays =
    Math.floor(
      (new Date(`${end}T12:00:00`).getTime() -
        new Date(`${start}T12:00:00`).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  if (rangeDays <= 31) return Math.max(1, goalTarget);
  if (rangeDays <= 95) return Math.max(1, goalTarget * 2);
  return Math.max(1, goalTarget * 4);
}

function sumTimeSpentMinutesInRange(start: string, end: string): number {
  return getCompletedLogsInRange(start, end).reduce(
    (sum, log) => sum + getLogDurationMinutes(log),
    0,
  );
}

function getCompletedDatesInRange(start: string, end: string): string[] {
  const dates = new Set<string>();
  for (const log of getCompletedLogsInRange(start, end)) {
    dates.add(normalizeDateString(log.date));
  }
  return Array.from(dates).sort();
}

function getIncompletePlannedDatesInRange(start: string, end: string): string[] {
  const progress = getMissedRamadanFastProgress();
  const dates = new Set<string>();

  for (const date of progress.plannedDates) {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate < start || normalizedDate > end) continue;
    if (!isIncompletePlannedDate(normalizedDate)) continue;
    dates.add(normalizedDate);
  }

  return Array.from(dates).sort();
}

function buildWeeklyPeriods(
  periodStart: string,
  periodEnd: string,
): MissedRamadanPeriodSlice["chartPeriods"] {
  const periods: MissedRamadanPeriodSlice["chartPeriods"] = [];
  let cursor = periodStart;

  for (let index = 0; index < 4; index += 1) {
    if (cursor > periodEnd) break;

    const weekEnd = addDays(cursor, 6);
    const endDate = weekEnd > periodEnd ? periodEnd : weekEnd;

    periods.push({
      xLabel: `w${index + 1}`,
      dateLabel: formatWeekLabel(cursor, endDate),
      startDate: cursor,
      endDate,
      completed: countCompletedInRange(cursor, endDate),
      incomplete: countIncompleteInRange(cursor, endDate),
      timeSpentMinutes: sumTimeSpentMinutesInRange(cursor, endDate),
    });

    cursor = addDays(endDate, 1);
  }

  while (periods.length < 4) {
    const index = periods.length;
    periods.push({
      xLabel: `w${index + 1}`,
      dateLabel: "",
      startDate: periodEnd,
      endDate: periodEnd,
      completed: 0,
      incomplete: 0,
      timeSpentMinutes: 0,
    });
  }

  return periods;
}

function buildMonthlyPeriods(
  monthCount: number,
  anchorDate: string,
): MissedRamadanPeriodSlice["chartPeriods"] {
  const periods: MissedRamadanPeriodSlice["chartPeriods"] = [];
  const endMonthStart = getMonthStart(anchorDate);

  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const monthStart = shiftMonth(endMonthStart, -index);
    const monthEnd = getMonthEnd(monthStart);

    periods.push({
      xLabel: `m${periods.length + 1}`,
      dateLabel: formatMonthBucketLabel(monthStart, monthEnd),
      startDate: monthStart,
      endDate: monthEnd,
      completed: countCompletedInRange(monthStart, monthEnd),
      incomplete: countIncompleteInRange(monthStart, monthEnd),
      timeSpentMinutes: sumTimeSpentMinutesInRange(monthStart, monthEnd),
    });
  }

  return periods;
}

function resolveActivePageIndex(
  chartPeriods: MissedRamadanPeriodSlice["chartPeriods"],
): number {
  const today = getTodayDateString();

  for (let index = 0; index < chartPeriods.length; index += 1) {
    const period = chartPeriods[index];
    if (today >= period.startDate && today <= period.endDate) {
      return index;
    }
  }

  return Math.max(0, chartPeriods.length - 1);
}

function buildPeriodSlice(
  period: PastAchievementPeriod,
  periodStart: string,
  periodEnd: string,
  dateRangeLabel: string,
  chartPeriods: MissedRamadanPeriodSlice["chartPeriods"],
): MissedRamadanPeriodSlice {
  const targetFasts = getPeriodTargetFasts(periodStart, periodEnd);
  const completedFasts = countCompletedInRange(periodStart, periodEnd);
  const incompleteFasts = countIncompleteInRange(periodStart, periodEnd);
  const achievementPercent = Math.min(
    100,
    Math.round((completedFasts / Math.max(targetFasts, 1)) * 100),
  );

  const previousStart =
    period === "monthly"
      ? shiftMonth(periodStart, -1)
      : period === "threeMonths"
        ? shiftMonth(periodStart, -3)
        : shiftMonth(periodStart, -6);
  const previousEnd =
    period === "monthly"
      ? getMonthEnd(previousStart)
      : addDays(periodStart, -1);

  const previousTarget = getPeriodTargetFasts(previousStart, previousEnd);
  const previousCompleted = countCompletedInRange(previousStart, previousEnd);
  const previousPercent = Math.round(
    (previousCompleted / Math.max(previousTarget, 1)) * 100,
  );

  return {
    chartPeriods,
    targetFasts,
    completedFasts,
    incompleteFasts,
    achievementPercent,
    previousPeriodDeltaPercent: achievementPercent - previousPercent,
    dateRangeLabel,
    periodStartDate: periodStart,
    periodEndDate: periodEnd,
    pageCount: chartPeriods.length,
    activePageIndex: resolveActivePageIndex(chartPeriods),
    completedDates: getCompletedDatesInRange(periodStart, periodEnd),
    incompletePlannedDates: getIncompletePlannedDatesInRange(
      periodStart,
      periodEnd,
    ),
    calendarMonthDate: getMonthStart(periodStart),
  };
}

function buildMonthlySlice(anchorDate: string): MissedRamadanPeriodSlice {
  const periodStart = getMonthStart(anchorDate);
  const periodEnd = getMonthEnd(anchorDate);

  return buildPeriodSlice(
    "monthly",
    periodStart,
    periodEnd,
    formatDateRangeLabel(periodStart, periodEnd),
    buildWeeklyPeriods(periodStart, periodEnd),
  );
}

function buildThreeMonthSlice(anchorDate: string): MissedRamadanPeriodSlice {
  const periodEnd = getMonthEnd(anchorDate);
  const periodStart = shiftMonth(getMonthStart(anchorDate), -2);
  const chartPeriods = buildMonthlyPeriods(3, anchorDate);

  return buildPeriodSlice(
    "threeMonths",
    periodStart,
    periodEnd,
    formatMultiMonthRangeLabel(periodStart, periodEnd),
    chartPeriods,
  );
}

function buildSixMonthSlice(anchorDate: string): MissedRamadanPeriodSlice {
  const periodEnd = getMonthEnd(anchorDate);
  const periodStart = shiftMonth(getMonthStart(anchorDate), -5);
  const chartPeriods = buildMonthlyPeriods(6, anchorDate);

  return buildPeriodSlice(
    "sixMonths",
    periodStart,
    periodEnd,
    formatMultiMonthRangeLabel(periodStart, periodEnd),
    chartPeriods,
  );
}

function buildPeriodBar(
  period: MissedRamadanPeriodSlice["chartPeriods"][number],
): QuranPastChartItem {
  const stackTotalHours = Math.max(
    period.completed + period.incomplete,
    period.completed,
    1,
  );

  return {
    xLabel: period.xLabel,
    dateLabel: period.dateLabel,
    completedHours: period.completed,
    incompleteHours: period.incomplete,
    hours: period.completed,
    stackTotalHours,
  };
}

function computeYAxis(chartData: QuranPastChartItem[]) {
  const maxStack = Math.max(
    ...chartData.map((item) => item.stackTotalHours),
    0,
  );
  const yMax = Math.max(3, Math.ceil(maxStack));
  const step = yMax <= 3 ? 1 : yMax <= 9 ? 3 : Math.ceil(yMax / 3);
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );

  return { yMax, yTicks };
}

function computeTimeYAxis(chartData: QuranPastChartItem[]) {
  const maxStack = Math.max(
    ...chartData.map((item) => item.stackTotalHours),
    0,
  );
  const yMax = Math.max(3, Math.ceil(maxStack));
  const step = yMax <= 6 ? 3 : yMax <= 12 ? 3 : Math.ceil(yMax / 4);
  const yTicks = Array.from(
    { length: Math.floor(yMax / step) + 1 },
    (_, index) => index * step,
  );

  return { yMax, yTicks };
}

function sliceToAchievement(
  slice: MissedRamadanPeriodSlice,
): QuranHoursPastAchievement {
  const chartData = slice.chartPeriods.map(buildPeriodBar);
  const yAxis = computeYAxis(chartData);

  return {
    dateRangeLabel: slice.dateRangeLabel,
    achievementPercent: slice.achievementPercent,
    previousPeriodDeltaPercent: slice.previousPeriodDeltaPercent,
    goalHours: slice.targetFasts,
    periodGoalHours: slice.targetFasts / Math.max(slice.chartPeriods.length, 1),
    completedHours: slice.completedFasts,
    incompleteHours: slice.incompleteFasts,
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

export function getMissedRamadanFastsPastAchievementSlice(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): MissedRamadanPeriodSlice {
  if (period === "monthly") return buildMonthlySlice(anchorDate);
  if (period === "threeMonths") return buildThreeMonthSlice(anchorDate);
  return buildSixMonthSlice(anchorDate);
}

export function getMissedRamadanFastsPastAchievement(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): QuranHoursPastAchievement {
  return sliceToAchievement(
    getMissedRamadanFastsPastAchievementSlice(period, anchorDate),
  );
}

export function applyMissedRamadanAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: MissedRamadanPeriodSlice,
  view: MissedRamadanAnalyticsView,
): QuranHoursPastAchievement {
  if (view === "completedVsIncomplete") {
    return achievement;
  }

  const chartData = achievement.chartData.map((item, index) => {
    const timeSpentHours =
      (slice.chartPeriods[index]?.timeSpentMinutes ?? 0) / 60;

    return {
      ...item,
      incompleteHours: timeSpentHours,
      stackTotalHours: item.completedHours + timeSpentHours,
      hours: timeSpentHours,
    };
  });

  return {
    ...achievement,
    chartData,
    ...computeTimeYAxis(chartData),
  };
}

export function getMissedRamadanTimeSpentByPeriod(
  slice: MissedRamadanPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalMissedRamadanTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatMissedRamadanFastCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatMissedRamadanFastTimeLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatMissedRamadanChartHoursLabel(hours: number): string {
  if (hours <= 0) return "0h";
  return formatTotalTime(hours);
}

/** @deprecated Use getMissedRamadanFastsPastAchievement(period) instead. */
export type MissedRamadanFastsPastAchievement = MissedRamadanPeriodSlice &
  QuranHoursPastAchievement;
