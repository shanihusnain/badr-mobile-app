import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import type { RingSegment } from "@/components/atoms/TaperedCircleBorder";
import { PLANNED_FASTS } from "../home/plannedFasts";

export type MondayThursdayFastStatus = "planned" | "completed" | "missed";

export type MondayThursdayFastLogType =
  | "completed_early"
  | "made_up_skipped"
  | "completed_planned";

export type MondayThursdayFastLogRecord = {
  date: string;
  plannedDate?: string;
  missedFastDate?: string;
  reconciledFromPlannedDate?: string;
  completed: boolean;
  loggedAt: string;
  logType?: MondayThursdayFastLogType;
  startTime?: string;
  endTime?: string;
};

export type MondayThursdayFastProgress = {
  selectedGoalFasts: string[];
  logs: MondayThursdayFastLogRecord[];
};

export type MondayThursdayFastDateOption = {
  id: string;
  date: string;
  plannedDate?: string;
};

export type MondayThursdayFastSubmitPayload =
  | {
      logType: "completed_early";
      plannedFastDate: string;
      actualCompletedDate: string;
      startTime: string;
      endTime: string;
    }
  | {
      logType: "made_up_skipped";
      missedFastDate: string;
      startTime: string;
      endTime: string;
    }
  | {
      logType: "completed_planned";
      plannedFastDate: string;
      startTime: string;
      endTime: string;
    };

export type MondayThursdayFastSubmitResult = {
  logType?: MondayThursdayFastLogType;
  date: string;
  completed: boolean;
  plannedDate?: string;
  missedFastDate?: string;
  reconciledFromPlannedDate?: string;
  startTime?: string;
  endTime?: string;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
};

function getSundayWeekStart(dateStr: string): string {
  const date = new Date(`${normalizeDateString(dateStr)}T12:00:00`);
  date.setDate(date.getDate() - date.getDay());
  return date.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const normalizedDate = normalizeDateString(dateStr);
  const date = new Date(`${normalizedDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildInitialSelectedGoalFasts(): string[] {
  const cycleWeekStart = getSundayWeekStart(PLANNED_FASTS.cycleStartDate);
  const selected: string[] = [];
  const cycleWeeks = 4;

  for (
    let weekIndex = 0;
    weekIndex < cycleWeeks && selected.length < 4;
    weekIndex += 1
  ) {
    const weekStart = addDays(cycleWeekStart, weekIndex * 7);
    const weekEnd = addDays(weekStart, 6);
    const datesInWeek = PLANNED_FASTS.monThuDates.filter((date) => {
      const normalizedDate = normalizeDateString(date);
      return normalizedDate >= weekStart && normalizedDate <= weekEnd;
    });
    const maxDatesForWeek = weekIndex === 1 ? 2 : 1;

    for (const date of datesInWeek) {
      if (selected.length >= 4) break;
      selected.push(date);
      const selectedInWeek = selected.filter((candidate) => {
        const normalizedDate = normalizeDateString(candidate);
        return normalizedDate >= weekStart && normalizedDate <= weekEnd;
      });
      if (selectedInWeek.length >= maxDatesForWeek) break;
    }
  }

  return normalizeDates(selected);
}

function buildInitialLogs(
  selectedGoalFasts: string[],
): MondayThursdayFastLogRecord[] {
  return selectedGoalFasts.slice(0, 2).map((date) => ({
    date: normalizeDateString(date),
    plannedDate: normalizeDateString(date),
    completed: true,
    loggedAt: normalizeDateString(date),
    logType: "completed_planned" as const,
  }));
}

const INITIAL_SELECTED = buildInitialSelectedGoalFasts();

let progressState: MondayThursdayFastProgress = {
  selectedGoalFasts: INITIAL_SELECTED,
  logs: buildInitialLogs(INITIAL_SELECTED),
};

export function normalizeDateString(date: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  let normalized = date;
  for (let index = 0; index < arabicIndic.length; index += 1) {
    normalized = normalized.replaceAll(arabicIndic[index], String(index));
  }
  return normalized;
}

function normalizeDates(dates: string[]): string[] {
  return [...new Set(dates.map(normalizeDateString))].sort();
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMondayThursdayFastProgress(): MondayThursdayFastProgress {
  return {
    selectedGoalFasts: [...progressState.selectedGoalFasts],
    logs: [...progressState.logs],
  };
}

export function getMondayThursdaySelectedGoalFasts(): string[] {
  return [...progressState.selectedGoalFasts];
}

export function setMondayThursdaySelectedGoalFasts(dates: string[]): void {
  progressState = {
    ...progressState,
    selectedGoalFasts: normalizeDates(dates),
  };
}

export function getMondayThursdayFastGoalTarget(): number {
  return progressState.selectedGoalFasts.length;
}

export function isMondayThursdaySelectedGoalFast(date: string): boolean {
  return progressState.selectedGoalFasts.includes(normalizeDateString(date));
}

function isSelectedFastCompleted(selectedDate: string): boolean {
  const normalized = normalizeDateString(selectedDate);
  return progressState.logs.some(
    (log) =>
      log.completed &&
      (normalizeDateString(log.plannedDate ?? "") === normalized ||
        normalizeDateString(log.missedFastDate ?? "") === normalized ||
        normalizeDateString(log.reconciledFromPlannedDate ?? "") ===
          normalized ||
        (log.logType === "completed_planned" &&
          normalizeDateString(log.date) === normalized)),
  );
}

export function isMondayThursdayFastCompletedEarlyOnSelectedDate(
  selectedDate: string,
): boolean {
  const normalized = normalizeDateString(selectedDate);
  return progressState.logs.some(
    (log) =>
      log.completed &&
      log.logType === "completed_early" &&
      normalizeDateString(log.reconciledFromPlannedDate ?? "") === normalized &&
      normalizeDateString(log.date) !== normalized,
  );
}

export function isMondayThursdayFastLogCompletedOnDate(date: string): boolean {
  const normalized = normalizeDateString(date);
  return progressState.logs.some(
    (log) => log.completed && normalizeDateString(log.date) === normalized,
  );
}

export function getMondayThursdayFastStatus(
  selectedDate: string,
): MondayThursdayFastStatus {
  const normalized = normalizeDateString(selectedDate);
  if (!isMondayThursdaySelectedGoalFast(normalized)) {
    return "planned";
  }
  if (isSelectedFastCompleted(normalized)) {
    return "completed";
  }
  if (normalized < getTodayDateString()) {
    return "missed";
  }
  return "planned";
}

export function getMondayThursdayFastCompletedDates(): string[] {
  return progressState.logs
    .filter((log) => log.completed)
    .map((log) => normalizeDateString(log.date))
    .sort();
}

export function getMondayThursdayFastCompletedCount(): number {
  return progressState.selectedGoalFasts.filter((date) =>
    isSelectedFastCompleted(date),
  ).length;
}

export function getMondayThursdayFastRemainingCount(): number {
  return Math.max(
    0,
    getMondayThursdayFastGoalTarget() - getMondayThursdayFastCompletedCount(),
  );
}

export function isMondayThursdayFastGoalCompleted(): boolean {
  return (
    getMondayThursdayFastCompletedCount() >= getMondayThursdayFastGoalTarget()
  );
}

export function getMondayThursdayFastCompletionPercent(): number {
  const target = getMondayThursdayFastGoalTarget();
  if (target <= 0) return 0;
  return Math.min(
    100,
    Math.round((getMondayThursdayFastCompletedCount() / target) * 100),
  );
}

export function getMondayThursdayFastRingSegments(
  completedCount?: number,
): RingSegment[] {
  const total = getMondayThursdayFastGoalTarget();
  if (total <= 0) return [];

  const completed = completedCount ?? getMondayThursdayFastCompletedCount();
  const remaining = Math.max(0, total - completed);

  return [
    { value: completed, color: Colors.light.green },
    { value: remaining, color: Colors.light.ringRamadan },
  ].filter((segment) => segment.value > 0);
}

export function isMondayThursdayFastCompletedDate(date: string): boolean {
  return getMondayThursdayFastCompletedDates().includes(
    normalizeDateString(date),
  );
}

export function isMondayThursdayFastMissedDate(date: string): boolean {
  const normalized = normalizeDateString(date);
  return (
    isMondayThursdaySelectedGoalFast(normalized) &&
    getMondayThursdayFastStatus(normalized) === "missed"
  );
}

export function isMondayThursdayFastPlannedDate(date: string): boolean {
  const normalized = normalizeDateString(date);
  return (
    isMondayThursdaySelectedGoalFast(normalized) &&
    getMondayThursdayFastStatus(normalized) === "planned"
  );
}

function computeLongestConsecutiveDayStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = new Date(`${sorted[index - 1]}T12:00:00`);
    const currentDate = new Date(`${sorted[index]}T12:00:00`);
    const dayDiff =
      (currentDate.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (dayDiff > 1) {
      current = 1;
    }
  }

  return longest;
}

export function getMondayThursdayFastLongestStreak(): number {
  return computeLongestConsecutiveDayStreak(
    getMondayThursdayFastCompletedDates(),
  );
}

export function getMondayThursdayFastWeeklyAverage(): number {
  const completed = getMondayThursdayFastCompletedCount();
  if (completed === 0) return 0;

  const cycleStart = PLANNED_FASTS.cycleStartDate;
  const today = getTodayDateString();
  const start = new Date(`${cycleStart}T12:00:00`);
  const end = new Date(`${today}T12:00:00`);
  const elapsedDays = Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / 86400000) + 1,
  );
  const elapsedWeeks = Math.max(1, Math.ceil(elapsedDays / 7));

  return Math.round((completed / elapsedWeeks) * 10) / 10;
}

export type MondayThursdayFastInsights = {
  goalTarget: number;
  completedCount: number;
  completionPercent: number;
  longestStreak: number;
  weeklyAverage: number;
};

export function getMondayThursdayFastInsights(): MondayThursdayFastInsights {
  return {
    goalTarget: getMondayThursdayFastGoalTarget(),
    completedCount: getMondayThursdayFastCompletedCount(),
    completionPercent: getMondayThursdayFastCompletionPercent(),
    longestStreak: getMondayThursdayFastLongestStreak(),
    weeklyAverage: getMondayThursdayFastWeeklyAverage(),
  };
}

export function canLogMondayThursdayFastOnDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  if (normalizedDate > getTodayDateString()) return false;
  if (isMondayThursdayFastGoalCompleted()) return false;
  return true;
}

export function isMondayThursdayFastLoggingDisabledToday(): boolean {
  return !canLogMondayThursdayFastOnDate(getTodayDateString());
}

function formatOptionDate(date: string, today: string): string {
  if (date === today) return "Today";
  return moment(date, "YYYY-MM-DD").format("ddd MMM D");
}

export function formatMondayThursdayFastDateLabel(
  date: string,
  today = getTodayDateString(),
): string {
  return formatOptionDate(date, today);
}

function buildDateOption(
  date: string,
  idPrefix: string,
  plannedDate?: string,
): MondayThursdayFastDateOption {
  const normalizedDate = normalizeDateString(date);
  return {
    id: `${idPrefix}-${normalizedDate}`,
    date: normalizedDate,
    plannedDate: plannedDate
      ? normalizeDateString(plannedDate)
      : normalizedDate,
  };
}

export function getPlannedMondayThursdayFastOptions(): MondayThursdayFastDateOption[] {
  return progressState.selectedGoalFasts
    .filter((date) => getMondayThursdayFastStatus(date) === "planned")
    .map((date) => buildDateOption(date, "planned"));
}

export function getFuturePlannedMondayThursdayFastOptions(): MondayThursdayFastDateOption[] {
  const today = getTodayDateString();
  return getPlannedMondayThursdayFastOptions().filter(
    (option) => normalizeDateString(option.date) > today,
  );
}

export function getPendingPlannedMondayThursdayFastOptions(): MondayThursdayFastDateOption[] {
  const today = getTodayDateString();
  return getPlannedMondayThursdayFastOptions().filter(
    (option) => normalizeDateString(option.date) <= today,
  );
}

export function getMissedMondayThursdayFastOptions(): MondayThursdayFastDateOption[] {
  return progressState.selectedGoalFasts
    .filter((date) => getMondayThursdayFastStatus(date) === "missed")
    .map((date) => buildDateOption(date, "missed"));
}

export function getActualEarlyMondayThursdayFastDateOptions(
  plannedFastDate: string,
): MondayThursdayFastDateOption[] {
  const today = getTodayDateString();
  const options: MondayThursdayFastDateOption[] = [];
  const seenDates = new Set<string>();
  const normalizedPlannedDate = normalizeDateString(plannedFastDate);
  const cycleStart = normalizeDateString(PLANNED_FASTS.cycleStartDate);
  let cursor = cycleStart;

  while (cursor < normalizedPlannedDate && cursor <= today) {
    const normalizedCursor = normalizeDateString(cursor);
    if (
      !seenDates.has(normalizedCursor) &&
      canLogMondayThursdayFastOnDate(cursor)
    ) {
      seenDates.add(normalizedCursor);
      options.push(
        buildDateOption(
          normalizedCursor,
          "actual-early",
          normalizedPlannedDate,
        ),
      );
    }
    const next = new Date(`${cursor}T12:00:00`);
    next.setDate(next.getDate() + 1);
    cursor = next.toISOString().slice(0, 10);
  }

  return options.sort((a, b) => a.date.localeCompare(b.date));
}

export function isActualDateBeforePlannedDate(
  actualDate: string,
  plannedFastDate: string,
): boolean {
  return normalizeDateString(actualDate) < normalizeDateString(plannedFastDate);
}

export function getMondayThursdayFastDateOptionsForLogType(
  logType: MondayThursdayFastLogType,
): MondayThursdayFastDateOption[] {
  switch (logType) {
    case "completed_planned":
      return getPendingPlannedMondayThursdayFastOptions();
    case "completed_early":
      return getFuturePlannedMondayThursdayFastOptions();
    case "made_up_skipped":
      return getMissedMondayThursdayFastOptions();
  }
}

export function hasMondayThursdayFastLogTypeAvailable(
  logType: MondayThursdayFastLogType,
): boolean {
  switch (logType) {
    case "completed_early":
      return getFuturePlannedMondayThursdayFastOptions().length > 0;
    case "made_up_skipped":
      return getMissedMondayThursdayFastOptions().length > 0;
    case "completed_planned":
      return getPendingPlannedMondayThursdayFastOptions().length > 0;
  }
}

export function getAvailableMondayThursdayFastLogTypes(): MondayThursdayFastLogType[] {
  return (
    ["completed_early", "made_up_skipped", "completed_planned"] as const
  ).filter((logType) => hasMondayThursdayFastLogTypeAvailable(logType));
}

export function hasMondayThursdayFastLoggingAvailable(): boolean {
  if (isMondayThursdayFastGoalCompleted()) return false;
  return getAvailableMondayThursdayFastLogTypes().length > 0;
}

export function formatMondayThursdayFastTimeLabel(
  hour: string,
  minute: string,
  period: "am" | "pm",
): string {
  const parsedHour = Number.parseInt(hour, 10);
  const paddedMinute = minute.padStart(2, "0");
  return `${parsedHour}:${paddedMinute} ${period}`;
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

export function isMondayThursdayFastEndTimeAfterStartTime(
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

export function submitMondayThursdayFastBranchLog(
  payload: MondayThursdayFastSubmitPayload,
): MondayThursdayFastSubmitResult | null {
  const today = getTodayDateString();

  switch (payload.logType) {
    case "completed_early": {
      if (
        !isMondayThursdaySelectedGoalFast(payload.plannedFastDate) ||
        getMondayThursdayFastStatus(payload.plannedFastDate) !== "planned" ||
        !isActualDateBeforePlannedDate(
          payload.actualCompletedDate,
          payload.plannedFastDate,
        ) ||
        !canLogMondayThursdayFastOnDate(payload.actualCompletedDate) ||
        isSelectedFastCompleted(payload.plannedFastDate)
      ) {
        return null;
      }

      progressState = {
        ...progressState,
        logs: [
          ...progressState.logs,
          {
            date: normalizeDateString(payload.actualCompletedDate),
            plannedDate: normalizeDateString(payload.plannedFastDate),
            reconciledFromPlannedDate: normalizeDateString(
              payload.plannedFastDate,
            ),
            completed: true,
            loggedAt: today,
            logType: payload.logType,
            startTime: payload.startTime,
            endTime: payload.endTime,
          },
        ],
      };

      return {
        logType: payload.logType,
        date: payload.actualCompletedDate,
        completed: true,
        plannedDate: payload.plannedFastDate,
        reconciledFromPlannedDate: payload.plannedFastDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        completedCount: getMondayThursdayFastCompletedCount(),
        remainingCount: getMondayThursdayFastRemainingCount(),
        goalCompleted: isMondayThursdayFastGoalCompleted(),
      };
    }
    case "made_up_skipped": {
      if (
        !isMondayThursdaySelectedGoalFast(payload.missedFastDate) ||
        getMondayThursdayFastStatus(payload.missedFastDate) !== "missed" ||
        isSelectedFastCompleted(payload.missedFastDate)
      ) {
        return null;
      }

      progressState = {
        ...progressState,
        logs: [
          ...progressState.logs,
          {
            date: normalizeDateString(payload.missedFastDate),
            missedFastDate: normalizeDateString(payload.missedFastDate),
            plannedDate: normalizeDateString(payload.missedFastDate),
            completed: true,
            loggedAt: today,
            logType: payload.logType,
            startTime: payload.startTime,
            endTime: payload.endTime,
          },
        ],
      };

      return {
        logType: payload.logType,
        date: payload.missedFastDate,
        completed: true,
        missedFastDate: payload.missedFastDate,
        plannedDate: payload.missedFastDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        completedCount: getMondayThursdayFastCompletedCount(),
        remainingCount: getMondayThursdayFastRemainingCount(),
        goalCompleted: isMondayThursdayFastGoalCompleted(),
      };
    }
    case "completed_planned": {
      if (
        !isMondayThursdaySelectedGoalFast(payload.plannedFastDate) ||
        getMondayThursdayFastStatus(payload.plannedFastDate) !== "planned" ||
        !canLogMondayThursdayFastOnDate(payload.plannedFastDate) ||
        isSelectedFastCompleted(payload.plannedFastDate)
      ) {
        return null;
      }

      progressState = {
        ...progressState,
        logs: [
          ...progressState.logs,
          {
            date: normalizeDateString(payload.plannedFastDate),
            plannedDate: normalizeDateString(payload.plannedFastDate),
            completed: true,
            loggedAt: today,
            logType: payload.logType,
            startTime: payload.startTime,
            endTime: payload.endTime,
          },
        ],
      };

      return {
        logType: payload.logType,
        date: payload.plannedFastDate,
        completed: true,
        plannedDate: payload.plannedFastDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        completedCount: getMondayThursdayFastCompletedCount(),
        remainingCount: getMondayThursdayFastRemainingCount(),
        goalCompleted: isMondayThursdayFastGoalCompleted(),
      };
    }
  }
}
