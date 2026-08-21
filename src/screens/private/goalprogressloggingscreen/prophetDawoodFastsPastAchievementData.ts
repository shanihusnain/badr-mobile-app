import moment from "moment-hijri";
import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import type {
  PastAchievementPeriod,
  QuranHoursPastAchievement,
  QuranPastChartItem,
} from "./quranHoursPastAchievementData";
import {
  getDawoodCycleHistory,
  getProphetDawoodCycleRestartDate,
  getProphetDawoodFastDayStateForDate,
  type ProphetDawoodFastDayState,
} from "./prophetDawoodFastsWeeklyData";
import {
  getProphetDawoodFastLogs,
  isProphetDawoodFastCompletedDate,
  type ProphetDawoodFastLog,
} from "./prophetDawoodFastsData";
import { getTodayDateString, normalizeDateString } from "./whiteDaysFastsData";

export type ProphetDawoodAnalyticsView =
  | "completedVsIncomplete"
  | "completedVsTime";

export type DawoodFastAchievement = {
  id: string;
  date: string;
  isTargetDay: boolean;
  completed: boolean;
  timeSpent: number;
  cycleNumber: number;
};

export type DawoodFastSummary = {
  totalCompleted: number;
  totalIncomplete: number;
  totalTimeSpent: number;
};

export type ProphetDawoodPeriodSlice = {
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
  cycleRestartDate: string | null;
  hasCycleReset: boolean;
  trackedMonths: number;
  cycleCount: number;
};

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi I",
  "Rabi II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qadah",
  "Dhul Hijjah",
];

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

function isDawoodTargetState(state: ProphetDawoodFastDayState): boolean {
  return (
    state === "completed" ||
    state === "missed" ||
    state === "upcoming" ||
    state === "today"
  );
}

function classifyDawoodDatesInRange(
  start: string,
  end: string,
  today: string = getTodayDateString(),
): {
  completed: string[];
  missed: string[];
  upcoming: string[];
  targetCount: number;
} {
  const completed: string[] = [];
  const missed: string[] = [];
  const upcoming: string[] = [];
  let targetCount = 0;

  let cursor = normalizeDateString(start);
  const normalizedEnd = normalizeDateString(end);

  while (cursor <= normalizedEnd) {
    const state = getProphetDawoodFastDayStateForDate(cursor, today);

    if (isDawoodTargetState(state)) {
      targetCount += 1;
      if (state === "completed" || isProphetDawoodFastCompletedDate(cursor)) {
        completed.push(cursor);
      } else if (state === "missed") {
        missed.push(cursor);
      } else {
        upcoming.push(cursor);
      }
    }

    cursor = addDays(cursor, 1);
  }

  return { completed, missed, upcoming, targetCount };
}

function countCompletedInRange(start: string, end: string): number {
  return classifyDawoodDatesInRange(start, end).completed.length;
}

function countTargetsInRange(start: string, end: string): number {
  return classifyDawoodDatesInRange(start, end).targetCount;
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

function getLogDurationMinutes(log: ProphetDawoodFastLog): number {
  if (!log.completed || !log.startTime || !log.endTime) return 0;

  const start = parseFastTimeLabel(log.startTime);
  const end = parseFastTimeLabel(log.endTime);
  if (start === null || end === null || end <= start) return 0;

  return end - start;
}

function sumTimeSpentMinutesInRange(start: string, end: string): number {
  return getProphetDawoodFastLogs()
    .filter((log) => {
      if (!log.completed) return false;
      const date = normalizeDateString(log.date);
      return date >= start && date <= end;
    })
    .reduce((sum, log) => sum + getLogDurationMinutes(log), 0);
}

function countCyclesInRange(start: string, end: string): number {
  const history = getDawoodCycleHistory();

  return history.segments.filter((segment) =>
    segment.plannedDates.some(
      (date) => date >= start && date <= end,
    ),
  ).length;
}

function countTrackedMonths(
  chartPeriods: ProphetDawoodPeriodSlice["chartPeriods"],
): number {
  return chartPeriods.filter(
    (period) => period.completed + period.incomplete > 0,
  ).length;
}

function getPeriodMonthCount(period: PastAchievementPeriod): number {
  if (period === "monthly") return 1;
  if (period === "threeMonths") return 3;
  return 6;
}

function buildMonthlyGregorianPeriods(
  monthCount: number,
  anchorDate: string,
): ProphetDawoodPeriodSlice["chartPeriods"] {
  const periods: ProphetDawoodPeriodSlice["chartPeriods"] = [];
  const endMonthStart = getMonthStart(anchorDate);

  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const monthStart = shiftMonth(endMonthStart, -index);
    const monthEnd = getMonthEnd(monthStart);
    const target = countTargetsInRange(monthStart, monthEnd);
    const completed = countCompletedInRange(monthStart, monthEnd);

    periods.push({
      xLabel: `m${periods.length + 1}`,
      dateLabel: formatMonthBucketLabel(monthStart, monthEnd),
      startDate: monthStart,
      endDate: monthEnd,
      completed,
      incomplete: Math.max(0, target - completed),
      timeSpentMinutes: sumTimeSpentMinutesInRange(monthStart, monthEnd),
    });
  }

  return periods;
}

function resolveActivePageIndex(
  chartPeriods: ProphetDawoodPeriodSlice["chartPeriods"],
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
  chartPeriods: ProphetDawoodPeriodSlice["chartPeriods"],
  calendarAnchorDate: string,
): ProphetDawoodPeriodSlice {
  const monthCount = getPeriodMonthCount(period);
  const today = getTodayDateString();
  const targetFasts = countTargetsInRange(periodStart, periodEnd);
  const completedFasts = countCompletedInRange(periodStart, periodEnd);
  const incompleteFasts = Math.max(0, targetFasts - completedFasts);
  const achievementPercent = Math.min(
    100,
    Math.round((completedFasts / Math.max(targetFasts, 1)) * 100),
  );

  const previousPeriodStart = shiftMonth(periodStart, -monthCount);
  const previousPeriodEnd = addDays(periodStart, -1);
  const previousTarget = countTargetsInRange(
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
  const monthBuckets = classifyDawoodDatesInRange(monthStart, monthEnd, today);
  const cycleRestartDate = getProphetDawoodCycleRestartDate();
  const history = getDawoodCycleHistory();

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
    completedDates: monthBuckets.completed,
    missedDates: monthBuckets.missed,
    upcomingDates: monthBuckets.upcoming,
    calendarMonthDate: monthStart,
    cycleRestartDate,
    hasCycleReset: history.hasMissedDawoodFast && cycleRestartDate !== null,
    trackedMonths: countTrackedMonths(chartPeriods),
    cycleCount: countCyclesInRange(periodStart, periodEnd),
  };
}

function buildMonthlySlice(anchorDate: string): ProphetDawoodPeriodSlice {
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

function buildThreeMonthSlice(anchorDate: string): ProphetDawoodPeriodSlice {
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

function buildSixMonthSlice(anchorDate: string): ProphetDawoodPeriodSlice {
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
  period: ProphetDawoodPeriodSlice["chartPeriods"][number],
): QuranPastChartItem {
  const completed = period.completed;
  const incomplete = period.incomplete;
  const stackTotal = completed + incomplete;

  return {
    xLabel: period.xLabel,
    dateLabel: period.dateLabel,
    completedHours: completed,
    incompleteHours: incomplete,
    hours: completed,
    // Keep empty periods at 0 so the chart has no bar (no fake 1-unit stub).
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
  slice: ProphetDawoodPeriodSlice,
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

export function getProphetDawoodFastsPastAchievementSlice(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): ProphetDawoodPeriodSlice {
  if (period === "monthly") return buildMonthlySlice(anchorDate);
  if (period === "threeMonths") return buildThreeMonthSlice(anchorDate);
  return buildSixMonthSlice(anchorDate);
}

export function getProphetDawoodFastsPastAchievement(
  period: PastAchievementPeriod,
  anchorDate: string = getTodayDateString(),
): QuranHoursPastAchievement {
  return sliceToAchievement(
    getProphetDawoodFastsPastAchievementSlice(period, anchorDate),
  );
}

export function formatProphetDawoodFastCountLabel(count: number): string {
  return String(Math.round(count));
}

export function applyProphetDawoodAnalyticsView(
  achievement: QuranHoursPastAchievement,
  slice: ProphetDawoodPeriodSlice,
  view: ProphetDawoodAnalyticsView,
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

export function getProphetDawoodTimeSpentByPeriod(
  slice: ProphetDawoodPeriodSlice,
): number[] {
  return slice.chartPeriods.map((period) => period.timeSpentMinutes);
}

export function getTotalProphetDawoodTimeSpentMinutes(
  timeSpentByPeriod: number[],
): number {
  return timeSpentByPeriod.reduce((sum, minutes) => sum + minutes, 0);
}

export function formatProphetDawoodFastTimeLabel(totalMinutes: number): string {
  return formatTotalTime(totalMinutes / 60);
}

export function formatProphetDawoodChartHoursLabel(hours: number): string {
  if (hours <= 0) return "0h";
  return formatTotalTime(hours);
}

export function formatDawoodAchievementHijriFooter(
  start: string,
  end: string,
): string {
  const startMoment = moment(normalizeDateString(start), "YYYY-MM-DD");
  const endMoment = moment(normalizeDateString(end), "YYYY-MM-DD");
  const gregorianLabel = `${startMoment.format("MMM D")} - ${endMoment.format("D")}, ${endMoment.year()}`;
  const hijriStart = `${HIJRI_MONTHS[startMoment.iMonth()]} ${startMoment.iDate()}`;
  const hijriEnd = `${HIJRI_MONTHS[endMoment.iMonth()]} ${endMoment.iDate()}, ${endMoment.iYear()} AH`;

  return `${gregorianLabel} corresponds to ${hijriStart} to ${hijriEnd} in the Hijri calendar.`;
}

export function getProphetDawoodGoalTrackedMonths(
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

export function getTotalProphetDawoodFastsCompleted(
  slice: ProphetDawoodPeriodSlice,
): number {
  return slice.completedFasts;
}

export function getProphetDawoodFastSummary(
  slice: ProphetDawoodPeriodSlice,
): DawoodFastSummary {
  return {
    totalCompleted: slice.completedFasts,
    totalIncomplete: slice.incompleteFasts,
    totalTimeSpent: slice.chartPeriods.reduce(
      (sum, period) => sum + period.timeSpentMinutes,
      0,
    ),
  };
}

export function getProphetDawoodFastTimeSpentForDate(date: string): number {
  const normalizedDate = normalizeDateString(date);
  return getProphetDawoodFastLogs()
    .filter(
      (log) => log.completed && normalizeDateString(log.date) === normalizedDate,
    )
    .reduce((sum, log) => sum + getLogDurationMinutes(log), 0);
}

export function isProphetDawoodFastCompletedOnDate(date: string): boolean {
  return isProphetDawoodFastCompletedDate(normalizeDateString(date));
}

export function isProphetDawoodFastMissedOnDate(
  date: string,
  slice: ProphetDawoodPeriodSlice,
): boolean {
  return slice.missedDates.includes(normalizeDateString(date));
}

export function buildProphetDawoodAchievements(
  slice: ProphetDawoodPeriodSlice,
): DawoodFastAchievement[] {
  const history = getDawoodCycleHistory();
  const dates = new Set([
    ...slice.completedDates,
    ...slice.missedDates,
    ...slice.upcomingDates,
  ]);

  const cycleByDate = new Map<string, number>();
  history.segments.forEach((segment, index) => {
    segment.plannedDates.forEach((plannedDate) => {
      cycleByDate.set(normalizeDateString(plannedDate), index + 1);
    });
  });

  return Array.from(dates)
    .sort()
    .map((date) => ({
      id: date,
      date,
      isTargetDay: true,
      completed: slice.completedDates.includes(date),
      timeSpent: getProphetDawoodFastTimeSpentForDate(date),
      cycleNumber: cycleByDate.get(date) ?? 1,
    }));
}
