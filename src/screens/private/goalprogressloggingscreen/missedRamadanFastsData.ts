import moment from "moment-hijri";
import { PLANNED_FASTS } from "../home/plannedFasts";

export type MissedRamadanFastLogRecord = {
  date: string;
  plannedDate?: string;
  completed: boolean;
  skipped: boolean;
  loggedAt: string;
  logType?: MissedRamadanFastLogType;
  startTime?: string;
  endTime?: string;
};

export type MissedRamadanFastProgress = {
  goalTarget: number;
  plannedDates: string[];
  skippedDates: string[];
  logs: MissedRamadanFastLogRecord[];
};

export type MissedRamadanFastLogOption = {
  id: string;
  date: string;
  kind: "planned" | "skipped" | "manual";
  plannedDate?: string;
};

export type MissedRamadanFastLogType =
  | "completed_early"
  | "made_up_skipped"
  | "completed_planned";

export type MissedRamadanFastDateOption = {
  id: string;
  date: string;
  plannedDate?: string;
};

export type MissedRamadanFastSubmitPayload =
  | {
      logType: "completed_early";
      plannedFastDate: string;
      actualCompletedDate: string;
      startTime: string;
      endTime: string;
    }
  | {
      logType: "made_up_skipped";
      completedDate: string;
      startTime: string;
      endTime: string;
    }
  | {
      logType: "completed_planned";
      plannedFastDate: string;
      startTime: string;
      endTime: string;
    };

export type MissedRamadanFastSubmitResult = {
  logType?: MissedRamadanFastLogType;
  date: string;
  completed: boolean;
  plannedDate?: string;
  reconciledFromPlannedDate?: string;
  startTime?: string;
  endTime?: string;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
};

const DEFAULT_GOAL_TARGET = 5;

export function normalizeDateString(date: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  let normalized = date;
  for (let index = 0; index < arabicIndic.length; index += 1) {
    normalized = normalized.replaceAll(arabicIndic[index], String(index));
  }
  return normalized;
}

function normalizeDates(dates: string[]): string[] {
  return dates.map(normalizeDateString);
}

let progressState: MissedRamadanFastProgress = {
  goalTarget: DEFAULT_GOAL_TARGET,
  plannedDates: normalizeDates([...PLANNED_FASTS.missedRamadanDates]),
  skippedDates: normalizeDates(
    PLANNED_FASTS.missedRamadanDates.filter(
      (date) =>
        normalizeDateString(date) < getTodayDateString() &&
        !PLANNED_FASTS.completedMissedRamadanDates
          .map(normalizeDateString)
          .includes(normalizeDateString(date)),
    ),
  ),
  logs: PLANNED_FASTS.completedMissedRamadanDates.map((date) => ({
    date: normalizeDateString(date),
    plannedDate: normalizeDateString(date),
    completed: true,
    skipped: false,
    loggedAt: normalizeDateString(date),
  })),
};

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMissedRamadanFastProgress(): MissedRamadanFastProgress {
  return {
    ...progressState,
    plannedDates: [...progressState.plannedDates],
    skippedDates: [...progressState.skippedDates],
    logs: [...progressState.logs],
  };
}

export function getMissedRamadanFastGoalTarget(): number {
  return progressState.goalTarget;
}

export function getMissedRamadanFastCompletedDates(): string[] {
  return progressState.logs
    .filter((log) => log.completed)
    .map((log) => normalizeDateString(log.date))
    .sort();
}

export function getMissedRamadanFastCompletedCount(): number {
  return getMissedRamadanFastCompletedDates().length;
}

export function getMissedRamadanFastRemainingCount(): number {
  return Math.max(
    0,
    progressState.goalTarget - getMissedRamadanFastCompletedCount(),
  );
}

export function isMissedRamadanFastGoalCompleted(): boolean {
  return getMissedRamadanFastCompletedCount() >= progressState.goalTarget;
}

export function getMissedRamadanFastCompletionPercent(): number {
  if (progressState.goalTarget <= 0) return 0;
  return Math.min(
    100,
    Math.round(
      (getMissedRamadanFastCompletedCount() / progressState.goalTarget) * 100,
    ),
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

export function getMissedRamadanFastLongestStreak(): number {
  return computeLongestConsecutiveDayStreak(getMissedRamadanFastCompletedDates());
}

export function getMissedRamadanFastWeeklyAverage(): number {
  const completed = getMissedRamadanFastCompletedCount();
  if (completed === 0) return 0;

  const cycleStart = PLANNED_FASTS.cycleStartDate;
  const today = getTodayDateString();
  const start = new Date(`${cycleStart}T12:00:00`);
  const end = new Date(`${today}T12:00:00`);
  const elapsedDays =
    Math.max(1, Math.floor((end.getTime() - start.getTime()) / (86400000)) + 1);
  const elapsedWeeks = Math.max(1, Math.ceil(elapsedDays / 7));

  return Math.round((completed / elapsedWeeks) * 10) / 10;
}

export type MissedRamadanFastInsights = {
  goalTarget: number;
  completedCount: number;
  completionPercent: number;
  longestStreak: number;
  weeklyAverage: number;
};

export function getMissedRamadanFastInsights(): MissedRamadanFastInsights {
  return {
    goalTarget: getMissedRamadanFastGoalTarget(),
    completedCount: getMissedRamadanFastCompletedCount(),
    completionPercent: getMissedRamadanFastCompletionPercent(),
    longestStreak: getMissedRamadanFastLongestStreak(),
    weeklyAverage: getMissedRamadanFastWeeklyAverage(),
  };
}

export function isMissedRamadanFastPlannedDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  return progressState.plannedDates.includes(normalizedDate);
}

export function isMissedRamadanFastCompletedDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  return getMissedRamadanFastCompletedDates().includes(normalizedDate);
}

export function isMissedRamadanFastExplicitlySkippedDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  return progressState.skippedDates.includes(normalizedDate);
}

export function isMissedRamadanFastSkippedDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  if (isMissedRamadanFastExplicitlySkippedDate(normalizedDate)) return true;
  const today = getTodayDateString();
  return (
    normalizedDate < today &&
    isMissedRamadanFastPlannedDate(normalizedDate) &&
    !isMissedRamadanFastCompletedDate(normalizedDate)
  );
}

export function isMissedRamadanFastInProgress(_date: string): boolean {
  return false;
}

export function canLogMissedRamadanFastOnDate(date: string): boolean {
  const normalizedDate = normalizeDateString(date);
  const today = getTodayDateString();
  if (normalizedDate > today) return false;
  if (isMissedRamadanFastCompletedDate(normalizedDate)) return false;
  if (isMissedRamadanFastGoalCompleted()) return false;
  return true;
}

export function isMissedRamadanFastLoggingDisabledToday(): boolean {
  const today = getTodayDateString();
  return !canLogMissedRamadanFastOnDate(today);
}

function formatOptionDate(date: string, today: string): string {
  if (date === today) return "Today";
  return moment(date, "YYYY-MM-DD").format("ddd MMM D");
}

export function formatMissedRamadanFastDateLabel(
  date: string,
  today = getTodayDateString(),
): string {
  return formatOptionDate(date, today);
}

function getFuturePlannedDates(): string[] {
  const today = getTodayDateString();
  return [...progressState.plannedDates]
    .filter((date) => date > today)
    .sort();
}

export function getFuturePlannedFastOptions(): MissedRamadanFastDateOption[] {
  return getFuturePlannedDates().map((date) => ({
    id: `future-planned-${date}`,
    date,
    plannedDate: date,
  }));
}

function addDateOption(
  options: MissedRamadanFastDateOption[],
  seenDates: Set<string>,
  date: string,
  idPrefix: string,
  plannedDate?: string,
): void {
  const normalizedDate = normalizeDateString(date);
  if (seenDates.has(normalizedDate)) return;
  if (!canLogMissedRamadanFastOnDate(normalizedDate)) return;
  seenDates.add(normalizedDate);
  options.push({
    id: `${idPrefix}-${normalizedDate}`,
    date: normalizedDate,
    plannedDate: plannedDate ? normalizeDateString(plannedDate) : normalizedDate,
  });
}

export function getPendingPlannedFastOptions(): MissedRamadanFastDateOption[] {
  const today = getTodayDateString();
  const options: MissedRamadanFastDateOption[] = [];
  const seenDates = new Set<string>();

  for (const date of [...progressState.plannedDates].sort()) {
    if (normalizeDateString(date) > today) continue;
    addDateOption(options, seenDates, date, "pending-planned");
  }

  if (!isMissedRamadanFastGoalCompleted()) {
    addDateOption(options, seenDates, today, "pending-today");
  }

  return options;
}

export function getSkippedFastOptions(): MissedRamadanFastDateOption[] {
  const options: MissedRamadanFastDateOption[] = [];
  const seenDates = new Set<string>();

  for (const date of [...progressState.skippedDates].sort()) {
    addDateOption(options, seenDates, date, "skipped");
  }

  for (const date of [...progressState.plannedDates].sort()) {
    if (!isMissedRamadanFastSkippedDate(date)) continue;
    addDateOption(options, seenDates, date, "skipped");
  }

  if (!isMissedRamadanFastGoalCompleted() && options.length === 0) {
    const today = getTodayDateString();
    const cycleStart = normalizeDateString(PLANNED_FASTS.cycleStartDate);
    let cursor = cycleStart;

    while (cursor < today) {
      addDateOption(options, seenDates, cursor, "skipped-fallback");
      const next = new Date(`${cursor}T12:00:00`);
      next.setDate(next.getDate() + 1);
      cursor = next.toISOString().slice(0, 10);
    }
  }

  return options.sort((a, b) => a.date.localeCompare(b.date));
}

export function getActualEarlyFastDateOptions(
  plannedFastDate: string,
): MissedRamadanFastDateOption[] {
  const today = getTodayDateString();
  const options: MissedRamadanFastDateOption[] = [];
  const seenDates = new Set<string>();
  const normalizedPlannedDate = normalizeDateString(plannedFastDate);
  const cycleStart = normalizeDateString(PLANNED_FASTS.cycleStartDate);
  let cursor = cycleStart;

  while (cursor < normalizedPlannedDate && cursor <= today) {
    addDateOption(
      options,
      seenDates,
      cursor,
      "actual-early",
      normalizedPlannedDate,
    );

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
  return (
    normalizeDateString(actualDate) < normalizeDateString(plannedFastDate)
  );
}

/** @deprecated Use branch-specific option getters instead. */
export function getMissedRamadanFastDateOptionsForLogType(
  logType: MissedRamadanFastLogType,
): MissedRamadanFastDateOption[] {
  switch (logType) {
    case "completed_early":
      return getFuturePlannedFastOptions();
    case "made_up_skipped":
      return getSkippedFastOptions();
    case "completed_planned":
      return getPendingPlannedFastOptions();
  }
}

export function hasMissedRamadanFastLogTypeAvailable(
  logType: MissedRamadanFastLogType,
): boolean {
  switch (logType) {
    case "completed_early":
      return getFuturePlannedFastOptions().length > 0;
    case "made_up_skipped":
      return getSkippedFastOptions().length > 0;
    case "completed_planned":
      return getPendingPlannedFastOptions().length > 0;
  }
}

export function getAvailableMissedRamadanFastLogTypes(): MissedRamadanFastLogType[] {
  return (["completed_early", "made_up_skipped", "completed_planned"] as const).filter(
    (logType) => hasMissedRamadanFastLogTypeAvailable(logType),
  );
}

export function hasMissedRamadanFastLoggingAvailable(): boolean {
  if (isMissedRamadanFastGoalCompleted()) return false;
  return getAvailableMissedRamadanFastLogTypes().length > 0;
}

export function submitMissedRamadanFastBranchLog(
  payload: MissedRamadanFastSubmitPayload,
): MissedRamadanFastSubmitResult | null {
  switch (payload.logType) {
    case "completed_early": {
      const result = submitMissedRamadanFastLog(
        payload.actualCompletedDate,
        true,
        {
          logType: payload.logType,
          startTime: payload.startTime,
          endTime: payload.endTime,
          reconcilePlannedDate: payload.plannedFastDate,
        },
      );
      if (!result) return null;
      return {
        ...result,
        logType: payload.logType,
        date: payload.actualCompletedDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        plannedDate: payload.plannedFastDate,
        reconciledFromPlannedDate: payload.plannedFastDate,
      };
    }
    case "made_up_skipped": {
      const result = submitMissedRamadanFastLog(payload.completedDate, true, {
        logType: payload.logType,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
      if (!result) return null;
      return {
        ...result,
        logType: payload.logType,
        date: payload.completedDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        plannedDate: payload.completedDate,
      };
    }
    case "completed_planned": {
      const result = submitMissedRamadanFastLog(payload.plannedFastDate, true, {
        logType: payload.logType,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
      if (!result) return null;
      return {
        ...result,
        logType: payload.logType,
        date: payload.plannedFastDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        plannedDate: payload.plannedFastDate,
      };
    }
  }
}

/** @deprecated Use submitMissedRamadanFastBranchLog instead. */
export function submitMissedRamadanFastLogWithType(
  logType: MissedRamadanFastLogType,
  completedDate: string,
  startTime: string,
  endTime: string,
): MissedRamadanFastSubmitResult | null {
  if (logType === "made_up_skipped") {
    return submitMissedRamadanFastBranchLog({
      logType,
      completedDate,
      startTime,
      endTime,
    });
  }

  if (logType === "completed_planned") {
    return submitMissedRamadanFastBranchLog({
      logType,
      plannedFastDate: completedDate,
      startTime,
      endTime,
    });
  }

  return submitMissedRamadanFastBranchLog({
    logType: "completed_early",
    plannedFastDate: completedDate,
    actualCompletedDate: completedDate,
    startTime,
    endTime,
  });
}

export function formatMissedRamadanFastTimeLabel(
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

export function isMissedRamadanFastEndTimeAfterStartTime(
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

export function getMissedRamadanFastLogOptions(): MissedRamadanFastLogOption[] {
  const today = getTodayDateString();
  const options: MissedRamadanFastLogOption[] = [];
  const seenDates = new Set<string>();

  const addOption = (option: MissedRamadanFastLogOption) => {
    if (seenDates.has(option.date)) return;
    if (!canLogMissedRamadanFastOnDate(option.date)) return;
    seenDates.add(option.date);
    options.push(option);
  };

  for (const date of [...progressState.skippedDates].sort()) {
    addOption({
      id: `skipped-${date}`,
      date,
      kind: "skipped",
      plannedDate: date,
    });
  }

  for (const date of [...progressState.plannedDates].sort()) {
    if (date > today) continue;
    if (isMissedRamadanFastSkippedDate(date)) {
      addOption({
        id: `planned-skipped-${date}`,
        date,
        kind: "skipped",
        plannedDate: date,
      });
      continue;
    }
    addOption({
      id: `planned-${date}`,
      date,
      kind: "planned",
      plannedDate: date,
    });
  }

  if (canLogMissedRamadanFastOnDate(today)) {
    addOption({
      id: `manual-${today}`,
      date: today,
      kind: "manual",
    });
  }

  return options.sort((a, b) => a.date.localeCompare(b.date));
}

export function submitMissedRamadanFastLog(
  date: string,
  completed: boolean,
  meta?: {
    logType?: MissedRamadanFastLogType;
    startTime?: string;
    endTime?: string;
    reconcilePlannedDate?: string;
  },
): MissedRamadanFastSubmitResult | null {
  const normalizedDate = normalizeDateString(date);
  const normalizedReconcileDate = meta?.reconcilePlannedDate
    ? normalizeDateString(meta.reconcilePlannedDate)
    : undefined;

  if (!canLogMissedRamadanFastOnDate(normalizedDate)) return null;

  const today = getTodayDateString();
  let nextPlannedDates = normalizeDates([...progressState.plannedDates]);
  let nextSkippedDates = normalizeDates([...progressState.skippedDates]);

  if (!completed) {
    nextSkippedDates = nextSkippedDates.includes(normalizedDate)
      ? nextSkippedDates
      : [...nextSkippedDates, normalizedDate].sort();
    nextPlannedDates = nextPlannedDates.filter(
      (plannedDate) => plannedDate !== normalizedDate,
    );

    progressState = {
      ...progressState,
      plannedDates: nextPlannedDates,
      skippedDates: nextSkippedDates,
      logs: [
        ...progressState.logs,
        {
          date: normalizedDate,
          plannedDate: normalizedDate,
          completed: false,
          skipped: true,
          loggedAt: today,
          logType: meta?.logType,
          startTime: meta?.startTime,
          endTime: meta?.endTime,
        },
      ],
    };

    return {
      date: normalizedDate,
      completed: false,
      plannedDate: normalizedDate,
      completedCount: getMissedRamadanFastCompletedCount(),
      remainingCount: getMissedRamadanFastRemainingCount(),
      goalCompleted: isMissedRamadanFastGoalCompleted(),
    };
  }

  let plannedDate: string | undefined;
  let reconciledFromPlannedDate: string | undefined;

  if (
    normalizedReconcileDate &&
    nextPlannedDates.includes(normalizedReconcileDate)
  ) {
    reconciledFromPlannedDate = normalizedReconcileDate;
    plannedDate = normalizedReconcileDate;
    nextPlannedDates = nextPlannedDates.filter(
      (planned) => planned !== normalizedReconcileDate,
    );
  } else if (nextPlannedDates.includes(normalizedDate)) {
    plannedDate = normalizedDate;
    nextPlannedDates = nextPlannedDates.filter(
      (planned) => planned !== normalizedDate,
    );
  } else {
    const futurePlanned = nextPlannedDates
      .filter((planned) => planned > normalizedDate)
      .sort();
    if (futurePlanned.length > 0) {
      reconciledFromPlannedDate = futurePlanned[0];
      plannedDate = reconciledFromPlannedDate;
      nextPlannedDates = nextPlannedDates.filter(
        (planned) => planned !== reconciledFromPlannedDate,
      );
    }
  }

  nextSkippedDates = nextSkippedDates.filter(
    (skippedDate) => skippedDate !== normalizedDate,
  );

  progressState = {
    ...progressState,
    plannedDates: nextPlannedDates,
    skippedDates: nextSkippedDates,
    logs: [
      ...progressState.logs,
      {
        date: normalizedDate,
        plannedDate,
        completed: true,
        skipped: false,
        loggedAt: today,
        logType: meta?.logType,
        startTime: meta?.startTime,
        endTime: meta?.endTime,
      },
    ],
  };

  return {
    date: normalizedDate,
    completed: true,
    plannedDate,
    reconciledFromPlannedDate,
    completedCount: getMissedRamadanFastCompletedCount(),
    remainingCount: getMissedRamadanFastRemainingCount(),
    goalCompleted: isMissedRamadanFastGoalCompleted(),
  };
}

export function setMissedRamadanFastGoalTarget(target: number): void {
  progressState = {
    ...progressState,
    goalTarget: Math.max(1, target),
  };
}

export function setMissedRamadanFastPlannedDates(dates: string[]): void {
  progressState = {
    ...progressState,
    plannedDates: [...dates].sort(),
  };
}

/** @deprecated Use submitMissedRamadanFastLog instead. */
export function startMissedRamadanFast(_date: string): void {}

/** @deprecated Use submitMissedRamadanFastLog instead. */
export function completeMissedRamadanFast(
  date: string,
  _startTime?: string,
): void {
  submitMissedRamadanFastLog(date, true);
}

export function formatMissedRamadanFastOptionLabel(
  option: MissedRamadanFastLogOption,
): string {
  const today = getTodayDateString();
  const dateLabel = formatOptionDate(option.date, today);

  switch (option.kind) {
    case "planned":
      return `Planned — ${dateLabel}`;
    case "skipped":
      return `Skipped — ${dateLabel}`;
    case "manual":
      return `Log today — ${dateLabel}`;
  }
}
