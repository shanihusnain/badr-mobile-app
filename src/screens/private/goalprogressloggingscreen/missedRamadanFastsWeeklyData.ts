import { PLANNED_FASTS } from "../home/plannedFasts";
import {
  getMissedRamadanFastProgress,
  getTodayDateString,
  isMissedRamadanFastGoalCompleted,
  isMissedRamadanFastLoggingDisabledToday,
  isMissedRamadanFastSkippedDate,
  normalizeDateString,
} from "./missedRamadanFastsData";

export type MissedRamadanFastDayState =
  | "future"
  | "today"
  | "todayDisabled"
  | "pastNeutral"
  | "planned"
  | "plannedSkipped"
  | "completed"
  | "goalAchieved";

export type MissedRamadanFastDayProgress = {
  day: string;
  date: string;
  state: MissedRamadanFastDayState;
  isToday: boolean;
  isSelected?: boolean;
};

export type MissedRamadanFastWeekSummary = {
  weekDays: MissedRamadanFastDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  weekIndex: number;
  completedFastsThisWeek: number;
  streakDays: number;
  previousWeekCompletedCount: number;
  upcomingPlannedThisWeek: number;
  motivationalQuote: string;
  showPreviousWeekStat: boolean;
};

export type MissedRamadanFastCycleSummary = {
  weeks: MissedRamadanFastWeekSummary[];
  activeWeekIndex: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const CYCLE_WEEKS = 4;
const CYCLE_START = normalizeDateString(PLANNED_FASTS.cycleStartDate);

function addDays(dateStr: string, days: number): string {
  const normalizedDate = normalizeDateString(dateStr);
  const date = new Date(`${normalizedDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getDayLabel(dateStr: string): string {
  const dayIndex = new Date(`${normalizeDateString(dateStr)}T12:00:00`).getDay();
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

function resolveDayState(
  date: string,
  today: string,
  plannedDates: Set<string>,
  completedDates: Set<string>,
): MissedRamadanFastDayState {
  const normalizedDate = normalizeDateString(date);
  const normalizedToday = normalizeDateString(today);
  const isPlanned = plannedDates.has(normalizedDate);
  const isCompleted = completedDates.has(normalizedDate);
  const isSkipped = isMissedRamadanFastSkippedDate(normalizedDate);
  const goalCompleted = isMissedRamadanFastGoalCompleted();

  if (isCompleted) {
    return "completed";
  }

  if (goalCompleted && normalizedDate > normalizedToday) {
    return "goalAchieved";
  }

  if (normalizedDate > normalizedToday) {
    return isPlanned ? "planned" : "future";
  }

  if (normalizedDate === normalizedToday) {
    if (isMissedRamadanFastLoggingDisabledToday()) {
      return "todayDisabled";
    }
    if (isPlanned) return "planned";
    return "today";
  }

  if (isSkipped || isPlanned) return "plannedSkipped";
  return "pastNeutral";
}

function countCompletedInWeek(
  weekStart: string,
  completedDates: string[],
): number {
  const normalizedWeekStart = normalizeDateString(weekStart);
  const weekEnd = addDays(normalizedWeekStart, 6);
  return completedDates.filter(
    (date) =>
      normalizeDateString(date) >= normalizedWeekStart &&
      normalizeDateString(date) <= weekEnd,
  ).length;
}

function countUpcomingPlannedInWeek(
  weekStart: string,
  today: string,
  plannedDates: string[],
): number {
  const normalizedWeekStart = normalizeDateString(weekStart);
  const normalizedToday = normalizeDateString(today);
  const weekEnd = addDays(normalizedWeekStart, 6);
  return plannedDates.filter((date) => {
    const normalizedDate = normalizeDateString(date);
    return (
      normalizedDate >= normalizedWeekStart &&
      normalizedDate <= weekEnd &&
      normalizedDate >= normalizedToday
    );
  }).length;
}

function computeMissedRamadanStreak(
  logs: { completed: boolean; loggedAt: string }[],
): number {
  const sorted = [...logs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  let streak = 0;
  for (const log of sorted) {
    if (!log.completed) break;
    streak += 1;
  }
  return streak;
}

function buildMotivationalQuote(
  weekIndex: number,
  completedThisWeek: number,
  upcomingThisWeek: number,
  previousWeekCompleted: number,
): string {
  if (weekIndex === 0 && completedThisWeek === 0) {
    if (upcomingThisWeek > 0) {
      return `Work toward your goal—${upcomingThisWeek} upcoming fast${upcomingThisWeek === 1 ? "" : "s"} this week! Every fast brings you closer.`;
    }
    return "Work toward your goal—every fast brings you closer.";
  }

  if (previousWeekCompleted > 0) {
    return `${previousWeekCompleted} Missed Ramadan fast${previousWeekCompleted === 1 ? "" : "s"} last week. Keep building your momentum.`;
  }

  if (completedThisWeek > 0) {
    return "Tabarak'Allah—your makeup fasts are bringing you closer to completing your goal.";
  }

  if (upcomingThisWeek > 0) {
    return `You have ${upcomingThisWeek} planned fast${upcomingThisWeek === 1 ? "" : "s"} ahead this week. Stay consistent.`;
  }

  return "Plan your next missed Ramadan fast to stay on track with your goal.";
}

function buildWeekDays(
  weekStart: string,
  today: string,
): MissedRamadanFastDayProgress[] {
  const progress = getMissedRamadanFastProgress();
  const normalizedToday = normalizeDateString(today);
  const plannedDates = new Set(
    progress.plannedDates.map((date) => normalizeDateString(date)),
  );
  const completedDates = new Set(
    progress.logs
      .filter((log) => log.completed)
      .map((log) => normalizeDateString(log.date)),
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const normalizedDate = normalizeDateString(date);
    return {
      day: getDayLabel(normalizedDate),
      date: normalizedDate,
      state: resolveDayState(
        normalizedDate,
        normalizedToday,
        plannedDates,
        completedDates,
      ),
      isToday: normalizedDate === normalizedToday,
    };
  });
}

function getActiveWeekIndex(today: string): number {
  const normalizedToday = normalizeDateString(today);
  for (let weekIndex = 0; weekIndex < CYCLE_WEEKS; weekIndex += 1) {
    const weekStart = addDays(CYCLE_START, weekIndex * 7);
    const weekEnd = addDays(weekStart, 6);
    if (normalizedToday >= weekStart && normalizedToday <= weekEnd) {
      return weekIndex;
    }
  }
  return CYCLE_WEEKS - 1;
}

function buildWeekSummary(
  weekIndex: number,
  today: string,
): MissedRamadanFastWeekSummary {
  const progress = getMissedRamadanFastProgress();
  const weekStart = addDays(CYCLE_START, weekIndex * 7);
  const weekEnd = addDays(weekStart, 6);
  const weekDays = buildWeekDays(weekStart, today);
  const completedDates = progress.logs
    .filter((log) => log.completed)
    .map((log) => normalizeDateString(log.date));
  const completedFastsThisWeek = countCompletedInWeek(weekStart, completedDates);
  const previousWeekStart =
    weekIndex > 0 ? addDays(CYCLE_START, (weekIndex - 1) * 7) : null;
  const previousWeekCompletedCount = previousWeekStart
    ? countCompletedInWeek(previousWeekStart, completedDates)
    : 0;
  const upcomingPlannedThisWeek = countUpcomingPlannedInWeek(
    weekStart,
    today,
    progress.plannedDates,
  );

  return {
    weekDays,
    weekRangeLabel: formatWeekRangeLabel(weekStart, weekEnd),
    weekFraction: `${weekIndex + 1}/${CYCLE_WEEKS}`,
    weekIndex,
    completedFastsThisWeek,
    streakDays: computeMissedRamadanStreak(progress.logs),
    previousWeekCompletedCount,
    upcomingPlannedThisWeek,
    motivationalQuote: buildMotivationalQuote(
      weekIndex,
      completedFastsThisWeek,
      upcomingPlannedThisWeek,
      previousWeekCompletedCount,
    ),
    showPreviousWeekStat: weekIndex > 0,
  };
}

export function getMissedRamadanFastCycleSummary(): MissedRamadanFastCycleSummary {
  const today = getTodayDateString();
  const weeks = Array.from({ length: CYCLE_WEEKS }, (_, weekIndex) =>
    buildWeekSummary(weekIndex, today),
  );

  return {
    weeks,
    activeWeekIndex: getActiveWeekIndex(today),
  };
}

export function clampMissedRamadanFastWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), CYCLE_WEEKS - 1);
}

export function canNavigateMissedRamadanFastWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < CYCLE_WEEKS - 1;
}

export function getMissedRamadanFastTodayIndexInWeek(
  weekDays: MissedRamadanFastDayProgress[],
): number | null {
  const todayIndex = weekDays.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : null;
}
