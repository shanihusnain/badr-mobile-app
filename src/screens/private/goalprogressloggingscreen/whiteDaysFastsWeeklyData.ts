import moment from "moment-hijri";
import { PLANNED_FASTS } from "../home/plannedFasts";
import {
  getTodayDateString,
  isWhiteDaysFastCompletedDate,
  normalizeDateString,
  getWhiteDayDatesForHijriMonth,
} from "./whiteDaysFastsData";

export type WhiteDaysFastDayState =
  | "inactive"
  | "upcoming"
  | "today"
  | "completed"
  | "missed";

export type WhiteDaysFastDayProgress = {
  day: string;
  date: string;
  state: WhiteDaysFastDayState;
  isToday: boolean;
  isWhiteDay: boolean;
};

export type WhiteDaysFastWeekSummary = {
  weekDays: WhiteDaysFastDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  weekIndex: number;
  completedFastsThisWeek: number;
  monthlyStreak: number;
  motivationalQuoteKey:
    | "upcoming"
    | "completed"
    | "missed"
    | "allCompleted";
  motivationalQuoteParams?: { day?: number };
};

export type WhiteDaysFastCycleSummary = {
  weeks: WhiteDaysFastWeekSummary[];
  activeWeekIndex: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const CYCLE_WEEKS = 4;
const CYCLE_WEEK_START = getSundayWeekStart(PLANNED_FASTS.cycleStartDate);

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

function isHijriWhiteDay(date: string): boolean {
  const hijriDay = moment(normalizeDateString(date), "YYYY-MM-DD").iDate();
  return hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
}

function getWhiteDayNumber(date: string): number {
  const hijriDay = moment(normalizeDateString(date), "YYYY-MM-DD").iDate();
  if (hijriDay === 13) return 1;
  if (hijriDay === 14) return 2;
  return 3;
}

function resolveDayState(date: string, today: string): WhiteDaysFastDayState {
  if (!isHijriWhiteDay(date)) {
    return "inactive";
  }

  const normalized = normalizeDateString(date);
  const normalizedToday = normalizeDateString(today);

  if (isWhiteDaysFastCompletedDate(normalized)) {
    return "completed";
  }

  if (normalized > normalizedToday) {
    return "upcoming";
  }

  if (normalized === normalizedToday) {
    return "today";
  }

  return "missed";
}

function countCompletedWhiteDaysInWeek(
  weekStart: string,
  weekEnd: string,
): number {
  let count = 0;
  for (let index = 0; index < 7; index += 1) {
    const date = addDays(weekStart, index);
    const normalized = normalizeDateString(date);
    if (normalized > weekEnd) break;
    if (!isHijriWhiteDay(normalized)) continue;
    if (isWhiteDaysFastCompletedDate(normalized)) {
      count += 1;
    }
  }
  return count;
}

function isHijriMonthFullyCompleted(
  hijriMonth: number,
  hijriYear: number,
): boolean {
  const dates = getWhiteDayDatesForHijriMonth(hijriMonth, hijriYear);
  if (dates.length < 3) return false;
  return dates.every((date) => isWhiteDaysFastCompletedDate(date));
}

function computeMonthlyStreak(today: string): number {
  const anchor = moment(normalizeDateString(today), "YYYY-MM-DD");
  let streak = 0;

  for (let monthOffset = 0; monthOffset < 24; monthOffset += 1) {
    const monthAnchor = anchor.clone().subtract(monthOffset, "iMonth");
    const hijriMonth = monthAnchor.iMonth();
    const hijriYear = monthAnchor.iYear();
    const dates = getWhiteDayDatesForHijriMonth(hijriMonth, hijriYear);
    if (dates.length < 3) continue;

    if (isHijriMonthFullyCompleted(hijriMonth, hijriYear)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function buildMotivationalQuoteMeta(today: string): Pick<
  WhiteDaysFastWeekSummary,
  "motivationalQuoteKey" | "motivationalQuoteParams"
> {
  const anchor = moment(normalizeDateString(today), "YYYY-MM-DD");
  const monthDates = getWhiteDayDatesForHijriMonth(
    anchor.iMonth(),
    anchor.iYear(),
  );
  const normalizedToday = normalizeDateString(today);

  const allComplete =
    monthDates.length === 3 &&
    monthDates.every((date) => isWhiteDaysFastCompletedDate(date));
  if (allComplete) {
    return { motivationalQuoteKey: "allCompleted" };
  }

  const hasMissed = monthDates.some((date) => {
    const normalized = normalizeDateString(date);
    return (
      normalized < normalizedToday && !isWhiteDaysFastCompletedDate(normalized)
    );
  });
  if (hasMissed) {
    return { motivationalQuoteKey: "missed" };
  }

  const todayWhiteDay = monthDates.find(
    (date) => normalizeDateString(date) === normalizedToday,
  );
  if (todayWhiteDay && !isWhiteDaysFastCompletedDate(todayWhiteDay)) {
    return {
      motivationalQuoteKey: "upcoming",
      motivationalQuoteParams: { day: getWhiteDayNumber(todayWhiteDay) },
    };
  }

  const nextUpcoming = monthDates.find((date) => {
    const normalized = normalizeDateString(date);
    return (
      normalized >= normalizedToday &&
      !isWhiteDaysFastCompletedDate(normalized)
    );
  });
  if (nextUpcoming) {
    return {
      motivationalQuoteKey: "upcoming",
      motivationalQuoteParams: { day: getWhiteDayNumber(nextUpcoming) },
    };
  }

  const hasCompleted = monthDates.some((date) =>
    isWhiteDaysFastCompletedDate(date),
  );
  if (hasCompleted) {
    return { motivationalQuoteKey: "completed" };
  }

  return {
    motivationalQuoteKey: "upcoming",
    motivationalQuoteParams: { day: 1 },
  };
}

function buildWeekDays(
  weekStart: string,
  today: string,
): WhiteDaysFastDayProgress[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const normalizedDate = normalizeDateString(date);
    const isWhiteDay = isHijriWhiteDay(normalizedDate);

    return {
      day: getDayLabel(normalizedDate),
      date: normalizedDate,
      state: resolveDayState(normalizedDate, today),
      isToday: normalizedDate === normalizeDateString(today),
      isWhiteDay,
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
): WhiteDaysFastWeekSummary {
  const { weekStart, weekEnd } = getWeekBounds(weekIndex);
  const weekDays = buildWeekDays(weekStart, today);

  return {
    weekDays,
    weekRangeLabel: formatWeekRangeLabel(weekStart, weekEnd),
    weekFraction: `${weekIndex + 1}/${CYCLE_WEEKS}`,
    weekIndex,
    completedFastsThisWeek: countCompletedWhiteDaysInWeek(weekStart, weekEnd),
    monthlyStreak: computeMonthlyStreak(today),
    ...buildMotivationalQuoteMeta(today),
  };
}

export function getWhiteDaysFastCycleSummary(): WhiteDaysFastCycleSummary {
  const today = getTodayDateString();
  const weeks = Array.from({ length: CYCLE_WEEKS }, (_, weekIndex) =>
    buildWeekSummary(weekIndex, today),
  );

  return {
    weeks,
    activeWeekIndex: getActiveWeekIndex(today),
  };
}

export function clampWhiteDaysFastWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), CYCLE_WEEKS - 1);
}

export function canNavigateWhiteDaysFastWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < CYCLE_WEEKS - 1;
}

export function getWhiteDaysFastTodayIndexInWeek(
  weekDays: WhiteDaysFastDayProgress[],
): number | null {
  const todayIndex = weekDays.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : null;
}
