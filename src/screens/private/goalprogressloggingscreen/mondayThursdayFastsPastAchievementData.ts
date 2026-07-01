import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";
import {
  getMondayThursdayFastGoalTarget,
  getMondayThursdayFastProgress,
  getMondayThursdayFastStatus,
  getTodayDateString,
  isMondayThursdaySelectedGoalFast,
  normalizeDateString,
  type MondayThursdayFastLogRecord,
} from "./mondayThursdayFastsData";

export type MondayThursdayAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTime";

export type MondayThursdayPeriodSlice = {
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
  missedDates: string[];
  upcomingDates: string[];
  calendarMonthDate: string;
};

export type MondayThursdayAchievement = {
  id: string;
  date: string;
  isPlannedFast: boolean;
  completed: boolean;
  timeSpent: number;
  linkedPlannedFastId?: string;
};

export type MondayThursdaySummary = {
  totalCompleted: number;
  totalIncomplete: number;
  totalTimeSpent: number;
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

function getLogDurationMinutes(log: MondayThursdayFastLogRecord): number {
  if (!log.completed || !log.startTime || !log.endTime) return 0;

  const start = parseFastTimeLabel(log.startTime);
  const end = parseFastTimeLabel(log.endTime);
  if (start === null || end === null || end <= start) return 0;

  return end - start;
}

function getCompletedLogsInRange(
  start: string,
  end: string,
): MondayThursdayFastLogRecord[] {
  return getMondayThursdayFastProgress().logs.filter((log) => {
    if (!log.completed) return false;
    const date = normalizeDateString(log.date);
    return date >= start && date <= end;
  });
}

function countCompletedInRange(start: string, end: string): number {
  return getMondayThursdayFastProgress().selectedGoalFasts.filter((date) => {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate < start || normalizedDate > end) return false;
    return getMondayThursdayFastStatus(normalizedDate) === "completed";
  }).length;
}

function isMissedSelectedFastDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  return (
    isMondayThursdaySelectedGoalFast(normalizedDate) &&
    getMondayThursdayFastStatus(normalizedDate) === "missed"
  );
}

function countMissedInRange(start: string, end: string): number {
  const progress = getMondayThursdayFastProgress();
  const seen = new Set<string>();
  let count = 0;

  for (const date of progress.selectedGoalFasts) {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate < start || normalizedDate > end) continue;
    if (!isMissedSelectedFastDate(normalizedDate)) continue;
    if (seen.has(normalizedDate)) continue;
    seen.add(normalizedDate);
    count += 1;
  }

  return count;
}

function countSelectedInRange(start: string, end: string): number {
  return getMondayThursdayFastProgress().selectedGoalFasts.filter((date) => {
    const normalizedDate = normalizeDateString(date);
    return normalizedDate >= start && normalizedDate <= end;
  }).length;
}

function getPeriodTargetFasts(start: string, end: string): number {
  const plannedInRange = countSelectedInRange(start, end);
  if (plannedInRange > 0) return plannedInRange;

  const goalTarget = getMondayThursdayFastGoalTarget();
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
  const progress = getMondayThursdayFastProgress();
  const dates = new Set<string>();

  for (const date of progress.selectedGoalFasts) {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate < start || normalizedDate > end) continue;
    if (getMondayThursdayFastStatus(normalizedDate) === "completed") {
      dates.add(normalizedDate);
    }
  }

  for (const log of progress.logs) {
    if (!log.completed) continue;
    if (log.logType !== "completed_early" && log.logType !== "made_up_skipped") {
      continue;
    }

    const actualDate = normalizeDateString(log.date);
    if (actualDate < start || actualDate > end) continue;
    dates.add(actualDate);
  }

  return Array.from(dates).sort();
}

function getUpcomingDatesInRange(start: string, end: string): string[] {
  const today = getTodayDateString();
  const progress = getMondayThursdayFastProgress();
  const dates = new Set<string>();

  for (const date of progress.selectedGoalFasts) {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate < start || normalizedDate > end) continue;
    if (normalizedDate < today) continue;
    if (getMondayThursdayFastStatus(normalizedDate) === "planned") {
      dates.add(normalizedDate);
    }
  }

  return Array.from(dates).sort();
}

function getMissedDatesInRange(start: string, end: string): string[] {
  const progress = getMondayThursdayFastProgress();
  const dates = new Set<string>();

  for (const date of progress.selectedGoalFasts) {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate < start || normalizedDate > end) continue;
    if (!isMissedSelectedFastDate(normalizedDate)) continue;
    dates.add(normalizedDate);
  }

  return Array.from(dates).sort();
}

function buildWeeklyPeriods(
  periodStart: string,
  periodEnd: string,
): MondayThursdayPeriodSlice["chartPeriods"] {
  const periods: MondayThursdayPeriodSlice["chartPeriods"] = [];
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
      incomplete: countMissedInRange(cursor, endDate),
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
): MondayThursdayPeriodSlice["chartPeriods"] {
  const periods: MondayThursdayPeriodSlice["chartPeriods"] = [];
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
      incomplete: countMissedInRange(monthStart, monthEnd),
      timeSpentMinutes: sumTimeSpentMinutesInRange(monthStart, monthEnd),
    });
  }

  return periods;
}

function resolveActivePageIndex(
  chartPeriods: MondayThursdayPeriodSlice["chartPeriods"],
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
  chartPeriods: MondayThursdayPeriodSlice["chartPeriods"],
  calendarAnchorDate: string,
): MondayThursdayPeriodSlice {
  const targetFasts = getPeriodTargetFasts(periodStart, periodEnd);
  const completedFasts = countCompletedInRange(periodStart, periodEnd);
  const incompleteFasts = countMissedInRange(periodStart, periodEnd);
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

  const monthStart = getMonthStart(calendarAnchorDate);
  const monthEnd = getMonthEnd(calendarAnchorDate);

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
    completedDates: getCompletedDatesInRange(monthStart, monthEnd),
    missedDates: getMissedDatesInRange(monthStart, monthEnd),
    upcomingDates: getUpcomingDatesInRange(monthStart, monthEnd),
    calendarMonthDate: monthStart,
  };
}

function buildMonthlySlice(anchorDate: string): MondayThursdayPeriodSlice {
  const periodStart = getMonthStart(anchorDate);
  const periodEnd = getMonthEnd(anchorDate);

  return buildPeriodSlice(
    "monthly",
    periodStart,
    periodEnd,
    formatDateRangeLabel(periodStart, periodEnd),
    buildWeeklyPeriods(periodStart, periodEnd),
    anchorDate,
  );
}

function buildThreeMonthSlice(anchorDate: string): MondayThursdayPeriodSlice {
  const periodEnd = getMonthEnd(anchorDate);
  const periodStart = shiftMonth(getMonthStart(anchorDate), -2);
  const chartPeriods = buildMonthlyPeriods(3, anchorDate);

  return buildPeriodSlice(
    "threeMonths",
    periodStart,
    periodEnd,
    formatMultiMonthRangeLabel(periodStart, periodEnd),
    chartPeriods,
    anchorDate,
  );
}

function buildSixMonthSlice(anchorDate: string): MondayThursdayPeriodSlice {
  const periodEnd = getMonthEnd(anchorDate);
  const periodStart = shiftMonth(getMonthStart(anchorDate), -5);
  const chartPeriods = buildMonthlyPeriods(6, anchorDate);

  return buildPeriodSlice(
    "sixMonths",
    periodStart,
    periodEnd,
    formatMultiMonthRangeLabel(periodStart, periodEnd),
    chartPeriods,
    anchorDate,
  );
}

function buildPeriodBar(
  period: MondayThursdayPeriodSlice["chartPeriods"][number],
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
  slice: MondayThursdayPeriodSlice,
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

export function getMondayThursdayFastsPastAchievementSlice(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): MondayThursdayPeriodSlice {
  if (period === "monthly") return buildMonthlySlice(anchorDate);
  if (period === "threeMonths") return buildThreeMonthSlice(anchorDate);
  return buildSixMonthSlice(anchorDate);
}

export function getMondayThursdayFastsPastAchievement(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): QuranHoursPastAchievement {
  return sliceToAchievement(
    getMondayThursdayFastsPastAchievementSlice(period, anchorDate),
  );
}

export function applyMondayThursdayAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: MondayThursdayPeriodSlice,
  view: MondayThursdayAnalyticsView,
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

export function getMondayThursdayTimeSpentByPeriod(
  slice: MondayThursdayPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalMondayThursdayTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatMondayThursdayFastCountLabel(count: number): string {
  return String(Math.round(count));
}

export function formatMondayThursdayFastTimeLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatMondayThursdayChartHoursLabel(hours: number): string {
  if (hours <= 0) return "0h";
  return formatTotalTime(hours);
}

export function getMondayThursdayGoalTrackedMonths(
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

export function getTotalMondayThursdayFastsCompleted(
  slice: MondayThursdayPeriodSlice,
): number {
  return slice.completedFasts;
}

export function getMondayThursdaySummary(
  slice: MondayThursdayPeriodSlice,
): MondayThursdaySummary {
  return {
    totalCompleted: slice.completedFasts,
    totalIncomplete: slice.incompleteFasts,
    totalTimeSpent: slice.chartPeriods.reduce(
      (sum, period) => sum + period.timeSpentMinutes,
      0,
    ),
  };
}

export function getMondayThursdayFastTimeSpentForDate(date: string): number {
  const normalizedDate = normalizeDateString(date);
  return getMondayThursdayFastProgress().logs
    .filter((log) => {
      if (!log.completed) return false;
      const linkedDate = normalizeDateString(
        log.plannedDate ??
          log.missedFastDate ??
          log.reconciledFromPlannedDate ??
          log.date,
      );
      return (
        linkedDate === normalizedDate ||
        normalizeDateString(log.date) === normalizedDate
      );
    })
    .reduce((sum, log) => sum + getLogDurationMinutes(log), 0);
}

export function isMondayThursdayFastCompletedOnDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  const progress = getMondayThursdayFastProgress();

  const completedOnActualDay = progress.logs.some(
    (log) =>
      log.completed && normalizeDateString(log.date) === normalizedDate,
  );
  if (completedOnActualDay) return true;

  if (!isMondayThursdaySelectedGoalFast(normalizedDate)) return false;
  return getMondayThursdayFastStatus(normalizedDate) === "completed";
}

export function isMondayThursdayFastMissedOnDate(
  date: string,
  slice: MondayThursdayPeriodSlice,
): boolean {
  return slice.missedDates.includes(normalizeDateString(date));
}

export function buildMondayThursdayAchievements(
  slice: MondayThursdayPeriodSlice,
): MondayThursdayAchievement[] {
  const progress = getMondayThursdayFastProgress();
  const dates = new Set([
    ...slice.completedDates,
    ...slice.missedDates,
    ...slice.upcomingDates,
  ]);

  return Array.from(dates)
    .sort()
    .map((date) => ({
      id: date,
      date,
      isPlannedFast:
        isMondayThursdaySelectedGoalFast(date) ||
        progress.logs.some(
          (log) =>
            log.completed &&
            (log.logType === "completed_early" ||
              log.logType === "made_up_skipped") &&
            normalizeDateString(log.date) === date,
        ),
      completed: slice.completedDates.includes(date),
      timeSpent: getMondayThursdayFastTimeSpentForDate(date),
      linkedPlannedFastId: isMondayThursdaySelectedGoalFast(date)
        ? date
        : progress.logs.find(
            (log) =>
              log.completed && normalizeDateString(log.date) === date,
          )?.reconciledFromPlannedDate ??
          progress.logs.find(
            (log) =>
              log.completed && normalizeDateString(log.date) === date,
          )?.plannedDate,
    }));
}

/** @deprecated Use getMondayThursdayFastsPastAchievement(period) instead. */
export type MondayThursdayFastsPastAchievement = MondayThursdayPeriodSlice &
  QuranHoursPastAchievement;
