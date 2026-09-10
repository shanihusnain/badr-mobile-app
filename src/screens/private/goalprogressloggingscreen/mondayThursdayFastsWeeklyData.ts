import { PLANNED_FASTS } from "../home/plannedFasts";
import {
  getMondayThursdayFastGoalTarget,
  getMondayThursdayFastProgress,
  getMondayThursdayFastStatus,
  getTodayDateString,
  isMondayThursdayFastCompletedEarlyOnSelectedDate,
  isMondayThursdayFastGoalCompleted,
  isMondayThursdayFastLoggingDisabledToday,
  isMondayThursdayFastLogCompletedOnDate,
  normalizeDateString,
} from "./mondayThursdayFastsData";

export type MondayThursdayFastDayState =
  | "inactive"
  | "today"
  | "todayDisabled"
  | "planned"
  | "completed"
  | "missed"
  | "goalAchieved";

export type MondayThursdayFastDayProgress = {
  day: string;
  date: string;
  state: MondayThursdayFastDayState;
  isToday: boolean;
  isSelected: boolean;
};

export type MondayThursdayFastWeekSummary = {
  weekDays: MondayThursdayFastDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  weekIndex: number;
  completedFastsThisWeek: number;
  missedFastsThisWeek: number;
  plannedFastsThisWeek: number;
  streakWeeks: number;
  previousWeekCompletedCount: number;
  weekOverWeekDelta: number;
  cumulativeCompletionPercent: number;
  motivationalQuoteKey:
    | "weekOneProgress"
    | "buildingMomentum"
    | "tabarakAllah"
    | "stayConsistent"
    | "planNext";
  motivationalQuoteParams?: Record<string, number>;
  showPreviousWeekStat: boolean;
};

export type MondayThursdayFastCycleSummary = {
  weeks: MondayThursdayFastWeekSummary[];
  activeWeekIndex: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const CYCLE_WEEKS = 4;
const CYCLE_WEEK_START = getSundayWeekStart(PLANNED_FASTS.cycleStartDate);

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

function getDayLabel(dateStr: string): string {
  const dayIndex = new Date(
    `${normalizeDateString(dateStr)}T12:00:00`,
  ).getDay();
  return DAY_LABELS[dayIndex];
}

function formatWeekRangeLabel(start: string, end: string): string {
  const startDate = new Date(`${normalizeDateString(start)}T12:00:00`);
  const endDate = new Date(`${normalizeDateString(end)}T12:00:00`);
  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${startLabel} — ${endLabel}`;
}

function getWeekBounds(weekIndex: number): {
  weekStart: string;
  weekEnd: string;
} {
  const weekStart = addDays(CYCLE_WEEK_START, weekIndex * 7);
  const weekEnd = addDays(weekStart, 6);
  return { weekStart, weekEnd };
}

function getSelectedDatesInWeek(
  weekStart: string,
  weekEnd: string,
  selectedGoalFasts: string[],
): string[] {
  return selectedGoalFasts.filter((date) => {
    const normalizedDate = normalizeDateString(date);
    return normalizedDate >= weekStart && normalizedDate <= weekEnd;
  });
}

function isDateInWeek(
  date: string,
  weekStart: string,
  weekEnd: string,
): boolean {
  const normalizedDate = normalizeDateString(date);
  return normalizedDate >= weekStart && normalizedDate <= weekEnd;
}

function resolveDayState(
  date: string,
  today: string,
  isSelected: boolean,
): MondayThursdayFastDayState {
  const normalizedDate = normalizeDateString(date);
  const normalizedToday = normalizeDateString(today);

  if (isMondayThursdayFastLogCompletedOnDate(normalizedDate)) {
    return "completed";
  }

  if (
    isMondayThursdayFastGoalCompleted() &&
    normalizedDate > normalizedToday
  ) {
    return "goalAchieved";
  }

  if (!isSelected) {
    if (normalizedDate > normalizedToday) {
      return "inactive";
    }
    if (normalizedDate === normalizedToday) {
      if (isMondayThursdayFastLoggingDisabledToday()) {
        return "todayDisabled";
      }
      return "today";
    }
    return "inactive";
  }

  if (isMondayThursdayFastCompletedEarlyOnSelectedDate(normalizedDate)) {
    if (normalizedDate > normalizedToday) {
      return "planned";
    }
    return "inactive";
  }

  const status = getMondayThursdayFastStatus(normalizedDate);

  if (status === "completed") {
    return "completed";
  }

  if (normalizedDate > normalizedToday) {
    return "planned";
  }

  if (normalizedDate === normalizedToday) {
    if (isMondayThursdayFastLoggingDisabledToday()) {
      return "todayDisabled";
    }
    if (status === "missed") {
      return "missed";
    }
    return "planned";
  }

  if (status === "missed") {
    return "missed";
  }

  return "planned";
}

function countCompletedInWeek(
  weekStart: string,
  weekEnd: string,
  logs: { completed: boolean; date: string }[],
): number {
  const dates = new Set<string>();
  for (const log of logs) {
    if (!log.completed) continue;
    const normalizedDate = normalizeDateString(log.date);
    if (normalizedDate >= weekStart && normalizedDate <= weekEnd) {
      dates.add(normalizedDate);
    }
  }
  return dates.size;
}

function countMissedInWeek(
  weekStart: string,
  weekEnd: string,
  selectedGoalFasts: string[],
): number {
  return getSelectedDatesInWeek(weekStart, weekEnd, selectedGoalFasts).filter(
    (date) => getMondayThursdayFastStatus(date) === "missed",
  ).length;
}

function countPlannedInWeek(
  weekStart: string,
  weekEnd: string,
  selectedGoalFasts: string[],
): number {
  return getSelectedDatesInWeek(weekStart, weekEnd, selectedGoalFasts).filter(
    (date) => getMondayThursdayFastStatus(date) === "planned",
  ).length;
}

function countCumulativeCompletedThroughWeek(
  weekEnd: string,
  selectedGoalFasts: string[],
): number {
  return selectedGoalFasts.filter((date) => {
    const normalizedDate = normalizeDateString(date);
    if (normalizedDate > weekEnd) return false;
    return getMondayThursdayFastStatus(normalizedDate) === "completed";
  }).length;
}

function computeWeekStreak(
  weekIndex: number,
  weeks: Pick<MondayThursdayFastWeekSummary, "completedFastsThisWeek">[],
): number {
  let consecutiveWeeks = 0;
  for (let index = weekIndex; index >= 0; index -= 1) {
    if (weeks[index].completedFastsThisWeek > 0) {
      consecutiveWeeks += 1;
    } else {
      break;
    }
  }
  return Math.max(0, consecutiveWeeks - 1);
}

function buildMotivationalQuoteMeta(
  weekIndex: number,
  completedThisWeek: number,
  cumulativePercent: number,
  previousWeekCompleted: number,
): Pick<
  MondayThursdayFastWeekSummary,
  "motivationalQuoteKey" | "motivationalQuoteParams"
> {
  if (weekIndex === 0 && completedThisWeek > 0) {
    return {
      motivationalQuoteKey: "weekOneProgress",
      motivationalQuoteParams: { week: 1, percent: cumulativePercent },
    };
  }

  if (previousWeekCompleted > 0 && completedThisWeek > 0) {
    return {
      motivationalQuoteKey: "buildingMomentum",
      motivationalQuoteParams: { count: previousWeekCompleted },
    };
  }

  if (completedThisWeek > 0) {
    return { motivationalQuoteKey: "tabarakAllah" };
  }

  if (cumulativePercent > 0) {
    return {
      motivationalQuoteKey: "stayConsistent",
      motivationalQuoteParams: { percent: cumulativePercent },
    };
  }

  return { motivationalQuoteKey: "planNext" };
}

function buildWeekDays(
  weekStart: string,
  weekEnd: string,
  today: string,
  selectedGoalFasts: string[],
): MondayThursdayFastDayProgress[] {
  const selectedInWeek = new Set(
    getSelectedDatesInWeek(weekStart, weekEnd, selectedGoalFasts).map(
      normalizeDateString,
    ),
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const normalizedDate = normalizeDateString(date);
    const isSelected = selectedInWeek.has(normalizedDate);

    return {
      day: getDayLabel(normalizedDate),
      date: normalizedDate,
      state: resolveDayState(normalizedDate, today, isSelected),
      isToday: normalizedDate === normalizeDateString(today),
      isSelected,
    };
  });
}

function getActiveWeekIndex(today: string): number {
  const normalizedToday = normalizeDateString(today);
  for (let weekIndex = 0; weekIndex < CYCLE_WEEKS; weekIndex += 1) {
    const { weekStart, weekEnd } = getWeekBounds(weekIndex);
    if (normalizedToday >= weekStart && normalizedToday <= weekEnd) {
      return weekIndex;
    }
  }
  return CYCLE_WEEKS - 1;
}

function buildWeekSummary(
  weekIndex: number,
  today: string,
): MondayThursdayFastWeekSummary {
  const progress = getMondayThursdayFastProgress();
  const { weekStart, weekEnd } = getWeekBounds(weekIndex);
  const selectedGoalFasts = progress.selectedGoalFasts;
  const weekDays = buildWeekDays(weekStart, weekEnd, today, selectedGoalFasts);
  const completedFastsThisWeek = countCompletedInWeek(
    weekStart,
    weekEnd,
    progress.logs,
  );
  const missedFastsThisWeek = countMissedInWeek(
    weekStart,
    weekEnd,
    selectedGoalFasts,
  );
  const plannedFastsThisWeek = countPlannedInWeek(
    weekStart,
    weekEnd,
    selectedGoalFasts,
  );

  const previousWeekCompletedCount =
    weekIndex > 0
      ? countCompletedInWeek(
          getWeekBounds(weekIndex - 1).weekStart,
          getWeekBounds(weekIndex - 1).weekEnd,
          progress.logs,
        )
      : 0;

  const goalTarget = getMondayThursdayFastGoalTarget();
  const cumulativeCompleted = countCumulativeCompletedThroughWeek(
    weekEnd,
    selectedGoalFasts,
  );
  const cumulativeCompletionPercent =
    goalTarget > 0
      ? Math.min(100, Math.round((cumulativeCompleted / goalTarget) * 100))
      : 0;

  return {
    weekDays,
    weekRangeLabel: formatWeekRangeLabel(weekStart, weekEnd),
    weekFraction: `${weekIndex + 1}/${CYCLE_WEEKS}`,
    weekIndex,
    completedFastsThisWeek,
    missedFastsThisWeek,
    plannedFastsThisWeek,
    streakWeeks: 0,
    previousWeekCompletedCount,
    weekOverWeekDelta: completedFastsThisWeek - previousWeekCompletedCount,
    cumulativeCompletionPercent,
    ...buildMotivationalQuoteMeta(
      weekIndex,
      completedFastsThisWeek,
      cumulativeCompletionPercent,
      previousWeekCompletedCount,
    ),
    showPreviousWeekStat: weekIndex > 0,
  };
}

export function getMondayThursdayFastCycleSummary(): MondayThursdayFastCycleSummary {
  const today = getTodayDateString();
  const weeks = Array.from({ length: CYCLE_WEEKS }, (_, weekIndex) =>
    buildWeekSummary(weekIndex, today),
  );

  return {
    weeks: weeks.map((week, weekIndex) => ({
      ...week,
      streakWeeks: computeWeekStreak(weekIndex, weeks),
    })),
    activeWeekIndex: getActiveWeekIndex(today),
  };
}

export function clampMondayThursdayFastWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), CYCLE_WEEKS - 1);
}

export function canNavigateMondayThursdayFastWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < CYCLE_WEEKS - 1;
}

export function getMondayThursdayFastTodayIndexInWeek(
  weekDays: MondayThursdayFastDayProgress[],
): number | null {
  const todayIndex = weekDays.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : null;
}

export function isMondayThursdayFastDateInWeek(
  date: string,
  weekIndex: number,
): boolean {
  const { weekStart, weekEnd } = getWeekBounds(weekIndex);
  return isDateInWeek(date, weekStart, weekEnd);
}
