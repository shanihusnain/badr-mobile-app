import moment from "moment-hijri";
import { PLANNED_FASTS } from "../home/plannedFasts";
import { WHITE_DAYS_FASTS_GOAL_TARGET } from "./whiteDaysFastsTarget";

export type WhiteDaysFastStatus = "completed" | "skipped" | "pending";

export type WhiteDaysFastInsights = {
  goalTarget: number;
  completedCount: number;
  completionPercent: number;
};

export type WhiteDaysFastDateNavigationOption = {
  date: string;
};

export type WhiteDaysFastLog = {
  date: string;
  completed: boolean;
  startTime: string;
  endTime: string;
  loggedAt: string;
};

export type WhiteDaysFastSubmitResult = {
  date: string;
  completed: boolean;
  startTime: string;
  endTime: string;
  goalTarget: number;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
};

export function normalizeDateString(date: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  let normalized = date;
  for (let index = 0; index < arabicIndic.length; index += 1) {
    normalized = normalized.replaceAll(arabicIndic[index], String(index));
  }
  return normalized;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return normalizeDateString(`${year}-${month}-${day}`);
}

function getCycleWhiteDayDates(): string[] {
  const anchor = moment();
  const hijriMonth = anchor.iMonth();
  const hijriYear = anchor.iYear();
  const dates: string[] = [];

  for (let offset = -40; offset <= 40; offset += 1) {
    const date = moment().add(offset, "days");
    if (date.iMonth() !== hijriMonth || date.iYear() !== hijriYear) continue;

    const hijriDay = date.iDate();
    if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) {
      dates.push(normalizeDateString(date.format("YYYY-MM-DD")));
    }
  }

  if (dates.length > 0) {
    return [...new Set(dates)]
      .sort()
      .slice(0, WHITE_DAYS_FASTS_GOAL_TARGET);
  }

  return PLANNED_FASTS.whiteDayDates
    .map(normalizeDateString)
    .slice(0, WHITE_DAYS_FASTS_GOAL_TARGET);
}

let completedDates: string[] = PLANNED_FASTS.completedWhiteDayDates.map(
  normalizeDateString,
);

let logs: WhiteDaysFastLog[] = completedDates.map((date) => ({
  date,
  completed: true,
  startTime: "",
  endTime: "",
  loggedAt: date,
}));

export function getWhiteDaysFastGoalTarget(): number {
  return WHITE_DAYS_FASTS_GOAL_TARGET;
}

export function isWhiteDaysCycleDate(date: string): boolean {
  return getCycleWhiteDayDates().includes(normalizeDateString(date));
}

export function getCurrentHijriMonthWhiteDayDates(): string[] {
  return getCycleWhiteDayDates();
}

export function isWhiteDaysFastCompletedDate(date: string): boolean {
  return completedDates.includes(normalizeDateString(date));
}

export function getWhiteDaysFastCompletedDates(): string[] {
  return [...completedDates];
}

export function getWhiteDaysFastLogs(): WhiteDaysFastLog[] {
  return [...logs];
}

export function getWhiteDayDatesForHijriMonth(
  hijriMonth: number,
  hijriYear: number,
): string[] {
  const dates: string[] = [];
  const probe = moment().iYear(hijriYear).iMonth(hijriMonth).iDate(1);

  for (let dayOffset = 0; dayOffset < 35; dayOffset += 1) {
    const candidate = probe.clone().add(dayOffset, "days");
    if (
      candidate.iMonth() !== hijriMonth ||
      candidate.iYear() !== hijriYear
    ) {
      if (dayOffset > 20) break;
      continue;
    }

    const hijriDay = candidate.iDate();
    if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) {
      dates.push(normalizeDateString(candidate.format("YYYY-MM-DD")));
    }
  }

  return [...new Set(dates)].sort();
}

export function getWhiteDaysFastStatus(date: string): WhiteDaysFastStatus {
  const normalized = normalizeDateString(date);
  if (!isWhiteDaysCycleDate(normalized)) {
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

export function getWhiteDaysFastCompletedCount(): number {
  const cycleDates = new Set(getCycleWhiteDayDates());
  return completedDates.filter((date) => cycleDates.has(normalizeDateString(date)))
    .length;
}

export function getWhiteDaysFastRemainingCount(): number {
  return Math.max(
    0,
    getWhiteDaysFastGoalTarget() - getWhiteDaysFastCompletedCount(),
  );
}

export function isWhiteDaysFastGoalCompleted(): boolean {
  return (
    getWhiteDaysFastCompletedCount() >= getWhiteDaysFastGoalTarget()
  );
}

export function getWhiteDaysFastCompletionPercent(): number {
  const target = getWhiteDaysFastGoalTarget();
  if (target <= 0) return 0;
  return Math.min(
    100,
    Math.round((getWhiteDaysFastCompletedCount() / target) * 100),
  );
}

export function getCurrentLoggableWhiteDay(): string | null {
  const cycleDates = getCycleWhiteDayDates();
  const today = getTodayDateString();

  const nonCompleted = cycleDates.filter(
    (date) => getWhiteDaysFastStatus(date) !== "completed",
  );
  if (nonCompleted.length === 0) return null;

  if (nonCompleted.includes(today)) {
    return today;
  }

  const pastSkipped = nonCompleted
    .filter((date) => date < today)
    .sort((a, b) => b.localeCompare(a));
  if (pastSkipped.length > 0) {
    return pastSkipped[0];
  }

  const upcomingPending = nonCompleted
    .filter((date) => date > today)
    .sort((a, b) => a.localeCompare(b));
  return upcomingPending[0] ?? null;
}

export function getPreviousRecoverableSkippedWhiteDay(
  currentDate: string,
): string | null {
  const cycleDates = getCycleWhiteDayDates();
  const normalizedCurrent = normalizeDateString(currentDate);
  const currentIndex = cycleDates.indexOf(normalizedCurrent);
  if (currentIndex <= 0) return null;

  const previousDate = cycleDates[currentIndex - 1];
  return getWhiteDaysFastStatus(previousDate) === "skipped"
    ? previousDate
    : null;
}

export function getWhiteDaysFastDateNavigationOptions(): WhiteDaysFastDateNavigationOption[] {
  const current = getCurrentLoggableWhiteDay();
  if (!current) return [];

  const previousSkipped = getPreviousRecoverableSkippedWhiteDay(current);
  const options: WhiteDaysFastDateNavigationOption[] = [];

  if (previousSkipped) {
    options.push({ date: previousSkipped });
  }
  options.push({ date: current });

  return options;
}

export function isWhiteDaysFastDateInNavigationOptions(date: string): boolean {
  const normalized = normalizeDateString(date);
  return getWhiteDaysFastDateNavigationOptions().some(
    (option) => option.date === normalized,
  );
}

export function canLogWhiteDaysFastOnDate(date: string): boolean {
  const normalized = normalizeDateString(date);

  if (!isWhiteDaysCycleDate(normalized)) return false;
  if (getWhiteDaysFastStatus(normalized) === "completed") return false;
  if (isWhiteDaysFastGoalCompleted()) return false;

  return isWhiteDaysFastDateInNavigationOptions(normalized);
}

export function hasWhiteDaysFastLoggingAvailable(): boolean {
  return (
    !isWhiteDaysFastGoalCompleted() &&
    getWhiteDaysFastDateNavigationOptions().length > 0
  );
}

export function formatWhiteDaysFastDateLabel(
  date: string,
  today = getTodayDateString(),
): string {
  const normalized = normalizeDateString(date);
  if (normalized === today) return "Today";

  const current = getCurrentLoggableWhiteDay();
  if (current && normalized === getPreviousRecoverableSkippedWhiteDay(current)) {
    return "Yesterday";
  }

  return moment(normalized, "YYYY-MM-DD").format("ddd, MMM D");
}

export function formatWhiteDaysFastTimeLabel(
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

export function isWhiteDaysFastEndTimeAfterStartTime(
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

export function submitWhiteDaysFastLog(payload: {
  date: string;
  startTime: string;
  endTime: string;
}): WhiteDaysFastSubmitResult | null {
  const normalizedDate = normalizeDateString(payload.date);
  if (!canLogWhiteDaysFastOnDate(normalizedDate)) return null;

  if (!completedDates.includes(normalizedDate)) {
    completedDates = [...completedDates, normalizedDate].sort();
  }

  logs = [
    ...logs,
    {
      date: normalizedDate,
      completed: true,
      startTime: payload.startTime,
      endTime: payload.endTime,
      loggedAt: getTodayDateString(),
    },
  ];

  return {
    date: normalizedDate,
    completed: true,
    startTime: payload.startTime,
    endTime: payload.endTime,
    goalTarget: getWhiteDaysFastGoalTarget(),
    completedCount: getWhiteDaysFastCompletedCount(),
    remainingCount: getWhiteDaysFastRemainingCount(),
    goalCompleted: isWhiteDaysFastGoalCompleted(),
  };
}

export function getWhiteDaysFastInsights(): WhiteDaysFastInsights {
  return {
    goalTarget: getWhiteDaysFastGoalTarget(),
    completedCount: getWhiteDaysFastCompletedCount(),
    completionPercent: getWhiteDaysFastCompletionPercent(),
  };
}
