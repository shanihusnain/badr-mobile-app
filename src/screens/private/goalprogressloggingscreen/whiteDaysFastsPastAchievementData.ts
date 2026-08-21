import moment from "moment-hijri";
import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";
import {
  getTodayDateString,
  getWhiteDaysFastLogs,
  isWhiteDaysFastCompletedDate,
  normalizeDateString,
  type WhiteDaysFastLog,
} from "./whiteDaysFastsData";

export type WhiteDaysAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTime";

export type WhiteDaysPeriodSlice = {
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${normalizeDateString(dateStr)}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getMonthStart(dateStr: string): string {
  const date = new Date(`${normalizeDateString(dateStr)}T12:00:00`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

function getMonthEnd(dateStr: string): string {
  const date = new Date(`${normalizeDateString(dateStr)}T12:00:00`);
  date.setMonth(date.getMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
}

function shiftMonth(dateStr: string, deltaMonths: number): string {
  const date = new Date(`${normalizeDateString(dateStr)}T12:00:00`);
  date.setMonth(date.getMonth() + deltaMonths, 1);
  return getMonthStart(date.toISOString().slice(0, 10));
}

function formatShortDate(dateStr: string): string {
  return new Date(`${normalizeDateString(dateStr)}T12:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}

function formatDateRangeLabel(start: string, end: string): string {
  const startDate = new Date(`${normalizeDateString(start)}T12:00:00`);
  const endDate = new Date(`${normalizeDateString(end)}T12:00:00`);
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
  const startDate = new Date(`${normalizeDateString(start)}T12:00:00`);
  const endDate = new Date(`${normalizeDateString(end)}T12:00:00`);
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const year = endDate.getFullYear().toString().slice(-2);
  return `${startMonth} — ${endMonth}, ${year}`;
}

function formatMonthBucketLabel(start: string, end: string): string {
  const startDate = new Date(`${normalizeDateString(start)}T12:00:00`);
  const endDate = new Date(`${normalizeDateString(end)}T12:00:00`);
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return startMonth;
  }

  return `${startMonth} ${startDate.getDate()} – ${endMonth} ${endDate.getDate()}`;
}

function isWhiteDayDate(dateStr: string): boolean {
  const hijriDay = moment(normalizeDateString(dateStr), "YYYY-MM-DD").iDate();
  return hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
}

function getWhiteDayDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = normalizeDateString(start);
  const normalizedEnd = normalizeDateString(end);

  while (cursor <= normalizedEnd) {
    if (isWhiteDayDate(cursor)) {
      dates.push(cursor);
    }
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function countWhiteDaysInRange(start: string, end: string): number {
  return getWhiteDayDatesInRange(start, end).length;
}

function countCompletedInRange(start: string, end: string): number {
  return getWhiteDayDatesInRange(start, end).filter((date) =>
    isWhiteDaysFastCompletedDate(date),
  ).length;
}

function parseFastTimeLabel(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  const parsedHour = Number(match[1]);
  const parsedMinute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (parsedHour < 1 || parsedHour > 12 || parsedMinute < 0 || parsedMinute > 59) {
    return null;
  }

  const hour24 = meridiem
    ? meridiem === "AM"
      ? parsedHour === 12
        ? 0
        : parsedHour
      : parsedHour === 12
        ? 12
        : parsedHour + 12
    : parsedHour === 12
      ? 12
      : parsedHour + 12;

  return hour24 * 60 + parsedMinute;
}

function getLogDurationMinutes(log: WhiteDaysFastLog): number {
  if (!log.completed || !log.startTime || !log.endTime) return 0;

  const start = parseFastTimeLabel(log.startTime);
  const end = parseFastTimeLabel(log.endTime);
  if (start === null || end === null || end <= start) return 0;

  return end - start;
}

function sumTimeSpentMinutesInRange(start: string, end: string): number {
  return getWhiteDaysFastLogs()
    .filter((log) => {
      if (!log.completed) return false;
      const date = normalizeDateString(log.date);
      return date >= start && date <= end;
    })
    .reduce((sum, log) => sum + getLogDurationMinutes(log), 0);
}

function getCompletedDatesInRange(start: string, end: string): string[] {
  return getWhiteDayDatesInRange(start, end).filter((date) =>
    isWhiteDaysFastCompletedDate(date),
  );
}

function getMissedDatesInRange(
  start: string,
  end: string,
  today: string,
): string[] {
  const normalizedToday = normalizeDateString(today);
  return getWhiteDayDatesInRange(start, end).filter((date) => {
    const normalized = normalizeDateString(date);
    return normalized < normalizedToday && !isWhiteDaysFastCompletedDate(date);
  });
}

function getUpcomingDatesInRange(
  start: string,
  end: string,
  today: string,
): string[] {
  const normalizedToday = normalizeDateString(today);
  return getWhiteDayDatesInRange(start, end).filter((date) => {
    const normalized = normalizeDateString(date);
    return (
      normalized >= normalizedToday && !isWhiteDaysFastCompletedDate(date)
    );
  });
}

function getPeriodMonthCount(period: PastAchievementPeriod): number {
  if (period === "monthly") return 1;
  if (period === "threeMonths") return 3;
  return 6;
}

function buildMonthlyGregorianPeriods(
  monthCount: number,
  anchorDate: string,
): WhiteDaysPeriodSlice["chartPeriods"] {
  const periods: WhiteDaysPeriodSlice["chartPeriods"] = [];
  const endMonthStart = getMonthStart(anchorDate);

  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const monthStart = shiftMonth(endMonthStart, -index);
    const monthEnd = getMonthEnd(monthStart);
    const whiteDayCount = countWhiteDaysInRange(monthStart, monthEnd);
    const completed = countCompletedInRange(monthStart, monthEnd);

    periods.push({
      xLabel: `m${periods.length + 1}`,
      dateLabel: formatMonthBucketLabel(monthStart, monthEnd),
      startDate: monthStart,
      endDate: monthEnd,
      completed,
      incomplete: Math.max(0, whiteDayCount - completed),
      timeSpentMinutes: sumTimeSpentMinutesInRange(monthStart, monthEnd),
    });
  }

  return periods;
}

function resolveActivePageIndex(
  chartPeriods: WhiteDaysPeriodSlice["chartPeriods"],
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
  chartPeriods: WhiteDaysPeriodSlice["chartPeriods"],
  calendarAnchorDate: string,
): WhiteDaysPeriodSlice {
  const monthCount = getPeriodMonthCount(period);
  const targetFasts = countWhiteDaysInRange(periodStart, periodEnd);
  const completedFasts = countCompletedInRange(periodStart, periodEnd);
  const incompleteFasts = Math.max(0, targetFasts - completedFasts);
  const achievementPercent = Math.min(
    100,
    Math.round((completedFasts / Math.max(targetFasts, 1)) * 100),
  );

  const previousPeriodStart = shiftMonth(periodStart, -monthCount);
  const previousPeriodEnd = addDays(periodStart, -1);
  const previousTarget = countWhiteDaysInRange(
    previousPeriodStart,
    previousPeriodEnd,
  );
  const previousCompleted = countCompletedInRange(
    previousPeriodStart,
    previousPeriodEnd,
  );
  const previousPercent = Math.round(
    (previousCompleted / Math.max(previousTarget, 1)) * 100,
  );

  const monthStart = getMonthStart(calendarAnchorDate);
  const monthEnd = getMonthEnd(calendarAnchorDate);
  const today = getTodayDateString();

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
    missedDates: getMissedDatesInRange(monthStart, monthEnd, today),
    upcomingDates: getUpcomingDatesInRange(monthStart, monthEnd, today),
    calendarMonthDate: monthStart,
  };
}

function buildMonthlySlice(anchorDate: string): WhiteDaysPeriodSlice {
  const monthStart = getMonthStart(anchorDate);
  const monthEnd = getMonthEnd(anchorDate);

  return buildPeriodSlice(
    "monthly",
    monthStart,
    monthEnd,
    formatDateRangeLabel(monthStart, monthEnd),
    buildMonthlyGregorianPeriods(1, anchorDate),
    anchorDate,
  );
}

function buildThreeMonthSlice(anchorDate: string): WhiteDaysPeriodSlice {
  const endMonthStart = getMonthStart(anchorDate);
  const startMonthStart = shiftMonth(endMonthStart, -2);
  const endMonthEnd = getMonthEnd(endMonthStart);

  return buildPeriodSlice(
    "threeMonths",
    startMonthStart,
    endMonthEnd,
    formatMultiMonthRangeLabel(startMonthStart, endMonthEnd),
    buildMonthlyGregorianPeriods(3, anchorDate),
    anchorDate,
  );
}

function buildSixMonthSlice(anchorDate: string): WhiteDaysPeriodSlice {
  const endMonthStart = getMonthStart(anchorDate);
  const startMonthStart = shiftMonth(endMonthStart, -5);
  const endMonthEnd = getMonthEnd(endMonthStart);

  return buildPeriodSlice(
    "sixMonths",
    startMonthStart,
    endMonthEnd,
    formatMultiMonthRangeLabel(startMonthStart, endMonthEnd),
    buildMonthlyGregorianPeriods(6, anchorDate),
    anchorDate,
  );
}

function buildPeriodBar(
  period: WhiteDaysPeriodSlice["chartPeriods"][number],
): QuranPastChartItem {
  const stackTotal = period.completed + period.incomplete;

  return {
    xLabel: period.xLabel,
    dateLabel: period.dateLabel,
    completedHours: period.completed,
    incompleteHours: period.incomplete,
    hours: period.completed,
    stackTotalHours: stackTotal,
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
  slice: WhiteDaysPeriodSlice,
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

export function getWhiteDaysFastsPastAchievementSlice(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): WhiteDaysPeriodSlice {
  if (period === "monthly") return buildMonthlySlice(anchorDate);
  if (period === "threeMonths") return buildThreeMonthSlice(anchorDate);
  return buildSixMonthSlice(anchorDate);
}

export function getWhiteDaysFastsPastAchievement(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): QuranHoursPastAchievement {
  return sliceToAchievement(
    getWhiteDaysFastsPastAchievementSlice(period, anchorDate),
  );
}

export function shiftWhiteDaysPastAchievementAnchor(
  anchorDate: string,
  direction: "prev" | "next",
): string {
  return shiftMonth(anchorDate, direction === "prev" ? -1 : 1);
}

export function formatWhiteDaysFastCountLabel(count: number): string {
  return String(Math.round(count));
}

export function applyWhiteDaysAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: WhiteDaysPeriodSlice,
  view: WhiteDaysAnalyticsView,
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

export function getWhiteDaysTimeSpentByPeriod(
  slice: WhiteDaysPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalWhiteDaysTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatWhiteDaysFastTimeSpentLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatWhiteDaysChartHoursLabel(hours: number): string {
  if (hours <= 0) return "0h";
  return formatTotalTime(hours);
}

export function getWhiteDaysGoalTrackedMonths(
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

export function getTotalWhiteDaysFastsCompleted(
  slice: WhiteDaysPeriodSlice,
): number {
  return slice.completedFasts;
}

export function getWhiteDaysFastTimeSpentForDate(date: string): number {
  const normalizedDate = normalizeDateString(date);
  return getWhiteDaysFastLogs()
    .filter((log) => normalizeDateString(log.date) === normalizedDate)
    .reduce((sum, log) => sum + getLogDurationMinutes(log), 0);
}

export function isWhiteDaysFastCompletedOnDate(date: string): boolean {
  return isWhiteDaysFastCompletedDate(date);
}

export function isWhiteDaysFastMissedOnDate(
  date: string,
  slice: WhiteDaysPeriodSlice,
): boolean {
  return slice.missedDates.includes(normalizeDateString(date));
}
