import moment from "moment-hijri";
import { PLANNED_FASTS } from "../home/plannedFasts";
import { PROPHET_DAWOOD_FASTS_GOAL_TARGET } from "./prophetDawoodFastsTarget";
import { getTodayDateString, normalizeDateString } from "./whiteDaysFastsData";

export type ProphetDawoodFastStatus = "completed" | "skipped" | "pending";

export type ProphetDawoodFastDateNavigationOption = {
  date: string;
  cycleDay: number;
};

export type ProphetDawoodFastLog = {
  date: string;
  cycleDay: number;
  completed: boolean;
  startTime: string;
  endTime: string;
  loggedAt: string;
};

export type ProphetDawoodFastSubmitResult = {
  plannedDate: string;
  cycleDay: number;
  completed: boolean;
  startTime: string;
  endTime: string;
  goalTarget: number;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
};

function addDays(dateStr: string, days: number): string {
  return moment(normalizeDateString(dateStr), "YYYY-MM-DD")
    .add(days, "days")
    .format("YYYY-MM-DD");
}

export function getProphetDawoodCycleStartDate(): string {
  return normalizeDateString(PLANNED_FASTS.cycleStartDate);
}

export function getProphetDawoodStartDay(): 1 | 2 {
  return PLANNED_FASTS.dawoodStartDay;
}

export function getProphetDawoodCycleEndDate(): string {
  return normalizeDateString(PLANNED_FASTS.cycleEndDate);
}

export function getCycleDayForDate(date: string): number {
  const start = moment(getProphetDawoodCycleStartDate(), "YYYY-MM-DD");
  const target = moment(normalizeDateString(date), "YYYY-MM-DD");
  return target.diff(start, "days") + 1;
}

export function isProphetDawoodPlannedCycleDay(
  cycleDay: number,
  startDay: 1 | 2 = getProphetDawoodStartDay(),
): boolean {
  if (cycleDay < 1 || cycleDay > 28) return false;
  return startDay === 1 ? cycleDay % 2 === 1 : cycleDay % 2 === 0;
}

export function getProphetDawoodPlannedFastDates(): string[] {
  return PLANNED_FASTS.dawoodDates.map(normalizeDateString);
}

let completedDates: string[] =
  PLANNED_FASTS.completedDawoodDates.map(normalizeDateString);

let logs: ProphetDawoodFastLog[] = completedDates.map((date) => ({
  date,
  cycleDay: getCycleDayForDate(date),
  completed: true,
  startTime: "",
  endTime: "",
  loggedAt: date,
}));

export function getProphetDawoodFastGoalTarget(): number {
  return PROPHET_DAWOOD_FASTS_GOAL_TARGET;
}

export function isProphetDawoodPlannedDate(date: string): boolean {
  return getProphetDawoodPlannedFastDates().includes(normalizeDateString(date));
}

export function isProphetDawoodFastCompletedDate(date: string): boolean {
  return completedDates.includes(normalizeDateString(date));
}

export function getProphetDawoodFastCompletedDates(): string[] {
  return [...completedDates];
}

export function getProphetDawoodFastLogs(): ProphetDawoodFastLog[] {
  return [...logs];
}

export function getProphetDawoodFastStatus(
  date: string,
): ProphetDawoodFastStatus {
  const normalized = normalizeDateString(date);
  if (!isProphetDawoodPlannedDate(normalized)) {
    return "pending";
  }
  if (completedDates.includes(normalized)) {
    return "completed";
  }
  if (normalized < getTodayDateString()) {
    return "skipped";
  }
  return "pending";
}

export function getProphetDawoodFastCompletedCount(): number {
  const planned = new Set(getProphetDawoodPlannedFastDates());
  return completedDates.filter((date) => planned.has(normalizeDateString(date)))
    .length;
}

export function getProphetDawoodFastRemainingCount(): number {
  return Math.max(
    0,
    getProphetDawoodFastGoalTarget() - getProphetDawoodFastCompletedCount(),
  );
}

export function isProphetDawoodFastGoalCompleted(): boolean {
  return (
    getProphetDawoodFastCompletedCount() >= getProphetDawoodFastGoalTarget()
  );
}

export function getProphetDawoodFastCompletionPercent(): number {
  const target = getProphetDawoodFastGoalTarget();
  if (target <= 0) return 0;
  return Math.min(
    100,
    Math.round((getProphetDawoodFastCompletedCount() / target) * 100),
  );
}

export function getCurrentLoggableProphetDawoodFast(): string | null {
  const plannedDates = getProphetDawoodPlannedFastDates();
  const today = getTodayDateString();

  const nonCompleted = plannedDates.filter(
    (date) => getProphetDawoodFastStatus(date) !== "completed",
  );
  if (nonCompleted.length === 0) return null;

  if (nonCompleted.includes(today)) {
    return today;
  }

  const yesterday = addDays(today, -1);
  if (
    nonCompleted.includes(yesterday) &&
    getProphetDawoodFastStatus(yesterday) === "skipped"
  ) {
    return yesterday;
  }

  const upcomingPending = nonCompleted
    .filter((date) => date > today)
    .sort((a, b) => a.localeCompare(b));

  return upcomingPending[0] ?? null;
}

export function getPreviousRecoverableSkippedProphetDawoodFast(
  currentDate: string,
): string | null {
  const plannedDates = getProphetDawoodPlannedFastDates();
  const normalizedCurrent = normalizeDateString(currentDate);
  const currentIndex = plannedDates.indexOf(normalizedCurrent);
  if (currentIndex <= 0) return null;

  const previousDate = plannedDates[currentIndex - 1];
  return getProphetDawoodFastStatus(previousDate) === "skipped"
    ? previousDate
    : null;
}

export function getProphetDawoodFastDateNavigationOptions(): ProphetDawoodFastDateNavigationOption[] {
  return getProphetDawoodPlannedFastDates().map((date) => ({
    date,
    cycleDay: getCycleDayForDate(date),
  }));
}

export function canLogProphetDawoodFastOnDate(date: string): boolean {
  const normalized = normalizeDateString(date);

  if (!isProphetDawoodPlannedDate(normalized)) return false;
  if (getProphetDawoodFastStatus(normalized) === "completed") return false;
  if (isProphetDawoodFastGoalCompleted()) return false;

  return getProphetDawoodPlannedFastDates().includes(normalized);
}

export function hasProphetDawoodFastLoggingAvailable(): boolean {
  return (
    !isProphetDawoodFastGoalCompleted() &&
    getCurrentLoggableProphetDawoodFast() !== null
  );
}

export function formatProphetDawoodFastDateLabel(
  date: string,
  today = getTodayDateString(),
): string {
  const normalized = normalizeDateString(date);
  if (normalized === today) return "Today";

  const yesterday = addDays(today, -1);
  if (normalized === yesterday) return "Yesterday";

  return moment(normalized, "YYYY-MM-DD").format("ddd, MMM D");
}

export function formatProphetDawoodFastTimeLabel(
  hour: string,
  minute: string,
  period: "am" | "pm",
): string {
  const paddedMinute = minute.padStart(2, "0");
  return `${hour}:${paddedMinute} ${period.toUpperCase()}`;
}

function timeToMinutes(
  hour: string,
  minute: string,
  period: "am" | "pm",
): number | null {
  const parsedHour = Number.parseInt(hour, 10);
  const parsedMinute = Number.parseInt(minute, 10);
  if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) return null;
  if (
    parsedHour < 1 ||
    parsedHour > 12 ||
    parsedMinute < 0 ||
    parsedMinute > 59
  ) {
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

export function isProphetDawoodFastEndTimeAfterStartTime(
  startHour: string,
  startMinute: string,
  startPeriod: "am" | "pm",
  endHour: string,
  endMinute: string,
  endPeriod: "am" | "pm",
): boolean {
  const start = timeToMinutes(startHour, startMinute, startPeriod);
  const end = timeToMinutes(endHour, endMinute, endPeriod);
  if (start === null || end === null) return false;
  return end > start;
}

export function submitProphetDawoodFastLog(payload: {
  plannedDate: string;
  startTime: string;
  endTime: string;
}): ProphetDawoodFastSubmitResult | null {
  const normalizedDate = normalizeDateString(payload.plannedDate);
  if (!canLogProphetDawoodFastOnDate(normalizedDate)) return null;

  const cycleDay = getCycleDayForDate(normalizedDate);

  if (!completedDates.includes(normalizedDate)) {
    completedDates = [...completedDates, normalizedDate].sort();
  }

  logs = [
    ...logs,
    {
      date: normalizedDate,
      cycleDay,
      completed: true,
      startTime: payload.startTime,
      endTime: payload.endTime,
      loggedAt: getTodayDateString(),
    },
  ];

  return {
    plannedDate: normalizedDate,
    cycleDay,
    completed: true,
    startTime: payload.startTime,
    endTime: payload.endTime,
    goalTarget: getProphetDawoodFastGoalTarget(),
    completedCount: getProphetDawoodFastCompletedCount(),
    remainingCount: getProphetDawoodFastRemainingCount(),
    goalCompleted: isProphetDawoodFastGoalCompleted(),
  };
}
