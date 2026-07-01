import { PLANNED_FASTS } from "../home/plannedFasts";
import {
  getProphetDawoodCycleStartDate,
  getProphetDawoodFastCompletedDates,
  getProphetDawoodStartDay,
  isProphetDawoodFastCompletedDate,
} from "./prophetDawoodFastsData";
import { getTodayDateString, normalizeDateString } from "./whiteDaysFastsData";

export type ProphetDawoodFastDayState =
  | "inactive"
  | "upcoming"
  | "completed"
  | "missed"
  | "today"
  | "todayDisabled";

export type ProphetDawoodFastDayProgress = {
  day: string;
  date: string;
  state: ProphetDawoodFastDayState;
  isToday: boolean;
  isTargetDay: boolean;
  showCycleRestartIcon: boolean;
};

export type ProphetDawoodFastWeekSummary = {
  weekDays: ProphetDawoodFastDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  weekIndex: number;
  completedFastsThisWeek: number;
  streakDays: number;
  hasMissedDawoodFast: boolean;
  motivationalQuoteKey:
    | "inProgress"
    | "completedToday"
    | "missed"
    | "streakGrowing";
};

export type ProphetDawoodFastCycleSummary = {
  weeks: ProphetDawoodFastWeekSummary[];
  activeWeekIndex: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const CYCLE_WEEKS = 4;
const CYCLE_WEEK_START = getSundayWeekStart(PLANNED_FASTS.cycleStartDate);

export type DawoodCycleSegment = {
  anchor: string;
  plannedDates: string[];
  isActive: boolean;
};

export type DawoodCycleHistory = {
  segments: DawoodCycleSegment[];
  activePlannedDates: string[];
  hasMissedDawoodFast: boolean;
  cycleRestartDate: string | null;
};

export type ActiveDawoodCycleState = {
  activeCycleAnchor: string;
  activeCycleEnd: string;
  activePlannedDates: string[];
  hasMissedDawoodFast: boolean;
};

function getSundayWeekStart(dateStr: string): string {
  const date = new Date(`${normalizeDateString(dateStr)}T12:00:00`);
  date.setDate(date.getDate() - date.getDay());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return normalizeDateString(`${year}-${month}-${day}`);
}

function addDays(dateStr: string, days: number): string {
  const normalizedDate = normalizeDateString(dateStr);
  const date = new Date(`${normalizedDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return normalizeDateString(`${year}-${month}-${day}`);
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

export function getPlannedDatesForDawoodAnchor(
  anchor: string,
  startDay: 1 | 2 = getProphetDawoodStartDay(),
): string[] {
  const dates: string[] = [];

  for (let index = 0; index < 28; index += 1) {
    const cycleDay = index + 1;
    const isFastDay =
      startDay === 1 ? cycleDay % 2 === 1 : cycleDay % 2 === 0;

    if (isFastDay) {
      dates.push(normalizeDateString(addDays(anchor, index)));
    }
  }

  return dates;
}

export function getDawoodCycleHistory(): DawoodCycleHistory {
  const startDay = getProphetDawoodStartDay();
  const today = getTodayDateString();
  const initialAnchor = getProphetDawoodCycleStartDate();
  let anchor = initialAnchor;
  let hasMissedDawoodFast = false;
  const segments: DawoodCycleSegment[] = [];
  const completedDates = getProphetDawoodFastCompletedDates();

  for (let iteration = 0; iteration < 20; iteration += 1) {
    const plannedDates = getPlannedDatesForDawoodAnchor(anchor, startDay);
    const missedDates = plannedDates
      .filter(
        (date) =>
          date < today && !isProphetDawoodFastCompletedDate(date),
      )
      .sort();

    if (missedDates.length === 0) {
      segments.push({ anchor, plannedDates, isActive: true });
      const cycleRestartDate =
        hasMissedDawoodFast && anchor !== initialAnchor ? anchor : null;

      return {
        segments,
        activePlannedDates: plannedDates,
        hasMissedDawoodFast,
        cycleRestartDate,
      };
    }

    hasMissedDawoodFast = true;
    const firstMiss = missedDates[0];
    const restartDate = completedDates
      .filter((date) => date > firstMiss)
      .sort()[0];

    segments.push({ anchor, plannedDates, isActive: false });

    if (!restartDate) {
      return {
        segments,
        activePlannedDates: [],
        hasMissedDawoodFast,
        cycleRestartDate: null,
      };
    }

    anchor = restartDate;
  }

  const plannedDates = getPlannedDatesForDawoodAnchor(anchor, startDay);
  segments.push({ anchor, plannedDates, isActive: true });
  const cycleRestartDate =
    hasMissedDawoodFast && anchor !== initialAnchor ? anchor : null;

  return {
    segments,
    activePlannedDates: plannedDates,
    hasMissedDawoodFast,
    cycleRestartDate,
  };
}

export function getActiveDawoodCycleState(): ActiveDawoodCycleState {
  const history = getDawoodCycleHistory();
  const activeSegment =
    history.segments.find((segment) => segment.isActive) ??
    history.segments[history.segments.length - 1];

  return {
    activeCycleAnchor: activeSegment.anchor,
    activeCycleEnd: addDays(activeSegment.anchor, 27),
    activePlannedDates: history.activePlannedDates,
    hasMissedDawoodFast: history.hasMissedDawoodFast,
  };
}

function isDawoodTargetDate(
  normalized: string,
  history: DawoodCycleHistory,
): boolean {
  return history.segments.some((segment) =>
    segment.plannedDates.includes(normalized),
  );
}

function resolveDayState(
  date: string,
  today: string,
  history: DawoodCycleHistory,
): ProphetDawoodFastDayState {
  const normalized = normalizeDateString(date);
  const normalizedToday = normalizeDateString(today);
  const activePlannedDates = history.activePlannedDates;

  if (isProphetDawoodFastCompletedDate(normalized)) {
    return isDawoodTargetDate(normalized, history) ? "completed" : "inactive";
  }

  if (normalized === normalizedToday) {
    if (activePlannedDates.includes(normalized)) {
      return "today";
    }
    return "todayDisabled";
  }

  if (activePlannedDates.includes(normalized)) {
    if (normalized > normalizedToday) {
      return "upcoming";
    }
    return "missed";
  }

  for (const segment of history.segments) {
    if (segment.isActive) continue;
    if (!segment.plannedDates.includes(normalized)) continue;
    if (normalized < normalizedToday) {
      return "missed";
    }
    return "inactive";
  }

  return "inactive";
}

export function getProphetDawoodFastDayStateForDate(
  date: string,
  today: string = getTodayDateString(),
): ProphetDawoodFastDayState {
  return resolveDayState(normalizeDateString(date), today, getDawoodCycleHistory());
}

export function getProphetDawoodCycleRestartDate(): string | null {
  return getDawoodCycleHistory().cycleRestartDate;
}

function countCompletedDawoodFastsInWeek(
  weekStart: string,
  weekEnd: string,
): number {
  let count = 0;

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(weekStart, index);
    const normalized = normalizeDateString(date);
    if (normalized > weekEnd) break;
    if (isProphetDawoodFastCompletedDate(normalized)) {
      count += 1;
    }
  }

  return count;
}

function computeStreakDays(
  today: string,
  activePlannedDates: string[],
): number {
  const normalizedToday = normalizeDateString(today);
  const pastTargets = activePlannedDates
    .filter((date) => date <= normalizedToday)
    .sort()
    .reverse();

  let streak = 0;
  for (const date of pastTargets) {
    if (isProphetDawoodFastCompletedDate(date)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function hasPastMissedDawoodTarget(
  today: string,
  history: DawoodCycleHistory,
): boolean {
  const normalizedToday = normalizeDateString(today);

  return history.segments.some((segment) =>
    segment.plannedDates.some(
      (date) =>
        date < normalizedToday && !isProphetDawoodFastCompletedDate(date),
    ),
  );
}

function buildMotivationalQuoteMeta(
  today: string,
  history: DawoodCycleHistory,
  streakDays: number,
): Pick<ProphetDawoodFastWeekSummary, "motivationalQuoteKey"> {
  const normalizedToday = normalizeDateString(today);

  if (
    history.hasMissedDawoodFast &&
    hasPastMissedDawoodTarget(today, history) &&
    history.cycleRestartDate === null
  ) {
    return { motivationalQuoteKey: "missed" };
  }

  if (
    history.hasMissedDawoodFast &&
    history.cycleRestartDate !== null &&
    normalizedToday === history.cycleRestartDate &&
    isProphetDawoodFastCompletedDate(normalizedToday)
  ) {
    return { motivationalQuoteKey: "completedToday" };
  }

  const isTodayActiveTarget = history.activePlannedDates.includes(
    normalizedToday,
  );
  if (
    isTodayActiveTarget &&
    isProphetDawoodFastCompletedDate(normalizedToday)
  ) {
    return { motivationalQuoteKey: "completedToday" };
  }

  if (streakDays >= 2) {
    return { motivationalQuoteKey: "streakGrowing" };
  }

  return { motivationalQuoteKey: "inProgress" };
}

function buildWeekDays(
  weekStart: string,
  today: string,
  history: DawoodCycleHistory,
): ProphetDawoodFastDayProgress[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const normalizedDate = normalizeDateString(date);
    const state = resolveDayState(normalizedDate, today, history);

    return {
      day: getDayLabel(normalizedDate),
      date: normalizedDate,
      state,
      isToday: normalizedDate === normalizeDateString(today),
      isTargetDay: state !== "inactive",
      showCycleRestartIcon:
        history.cycleRestartDate !== null &&
        normalizedDate === history.cycleRestartDate,
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
  history: DawoodCycleHistory,
): ProphetDawoodFastWeekSummary {
  const { weekStart, weekEnd } = getWeekBounds(weekIndex);
  const weekDays = buildWeekDays(weekStart, today, history);
  const streakDays = computeStreakDays(today, history.activePlannedDates);

  return {
    weekDays,
    weekRangeLabel: formatWeekRangeLabel(weekStart, weekEnd),
    weekFraction: `${weekIndex + 1}/${CYCLE_WEEKS}`,
    weekIndex,
    completedFastsThisWeek: countCompletedDawoodFastsInWeek(weekStart, weekEnd),
    streakDays,
    hasMissedDawoodFast: history.hasMissedDawoodFast,
    ...buildMotivationalQuoteMeta(today, history, streakDays),
  };
}

export function getProphetDawoodFastCycleSummary(): ProphetDawoodFastCycleSummary {
  const today = getTodayDateString();
  const history = getDawoodCycleHistory();
  const weeks = Array.from({ length: CYCLE_WEEKS }, (_, weekIndex) =>
    buildWeekSummary(weekIndex, today, history),
  );

  return {
    weeks,
    activeWeekIndex: getActiveWeekIndex(today),
  };
}

export function clampProphetDawoodFastWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), CYCLE_WEEKS - 1);
}

export function canNavigateProphetDawoodFastWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < CYCLE_WEEKS - 1;
}

export function getProphetDawoodFastTodayIndexInWeek(
  weekDays: ProphetDawoodFastDayProgress[],
): number | null {
  const todayIndex = weekDays.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : null;
}
