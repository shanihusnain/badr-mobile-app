import moment from "moment-hijri";
import type {
  FastingGoalFrameData,
  FastingGoalFrameDay,
} from "@/src/api/queries/useGetFastingGoalFrame";
import type {
  WhiteDaysFastDayProgress,
  WhiteDaysFastDayState,
  WhiteDaysFastWeekSummary,
} from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsWeeklyData";

function normalizeDate(date: string | null | undefined): string {
  return String(date ?? "").slice(0, 10);
}

function getDayOfMonth(date: string): number {
  const parsed = moment(normalizeDate(date), "YYYY-MM-DD");
  return parsed.isValid() ? parsed.date() : 0;
}

function resolveIsFutureDay(day: FastingGoalFrameDay): boolean {
  if (day.isToday) return false;
  const date = normalizeDate(day.date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date > moment().format("YYYY-MM-DD");
  }
  return false;
}

function resolveWhiteDaysDayState(
  day: FastingGoalFrameDay,
): WhiteDaysFastDayState {
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  const isWhiteDay = Boolean(day.isPlanned) || isPlannedState(state);

  if (
    state === "COMPLETED" ||
    state === "LOGGED" ||
    state === "ACHIEVED" ||
    state === "DONE"
  ) {
    return "completed";
  }

  if (state === "MISSED" || state === "SKIPPED") {
    return "missed";
  }

  if (state === "UPCOMING") {
    return day.isToday ? "plannedToday" : "planned";
  }

  if (state === "DUE") {
    return day.isToday ? "plannedToday" : "missed";
  }

  if (isWhiteDay) {
    if (day.isToday) return "plannedToday";
    if (resolveIsFutureDay(day)) return "planned";
    // Past planned white day without a completed/missed signal — treat as missed.
    if (
      state === "PLANNED" ||
      state === "NOT_LOGGED" ||
      state === "PENDING" ||
      state === "EXCUSED" ||
      state === "MENSTRUATING"
    ) {
      return state === "EXCUSED" || state === "MENSTRUATING"
        ? day.isToday
          ? "plannedToday"
          : resolveIsFutureDay(day)
            ? "planned"
            : "missed"
        : "missed";
    }
    return "planned";
  }

  if (day.isToday) return "todayDisabled";
  return "inactive";
}

function isPlannedState(state: string): boolean {
  return (
    state === "PLANNED" ||
    state === "UPCOMING" ||
    state === "DUE" ||
    state === "COMPLETED" ||
    state === "LOGGED" ||
    state === "ACHIEVED" ||
    state === "DONE" ||
    state === "MISSED" ||
    state === "SKIPPED" ||
    state === "PENDING" ||
    state === "NOT_LOGGED" ||
    state === "EXCUSED" ||
    state === "MENSTRUATING"
  );
}

function isMenstruatingDay(day: FastingGoalFrameDay): boolean {
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  return state === "MENSTRUATING" || state === "EXCUSED";
}

export function mapWhiteDaysFrameDay(
  day: FastingGoalFrameDay,
): WhiteDaysFastDayProgress {
  const state = resolveWhiteDaysDayState(day);
  const isWhiteDay =
    Boolean(day.isPlanned) ||
    state === "completed" ||
    state === "missed" ||
    state === "planned" ||
    state === "plannedToday";

  return {
    day: day.dayLabel,
    dayOfMonth: getDayOfMonth(day.date),
    date: normalizeDate(day.date),
    state,
    isToday: Boolean(day.isToday),
    isWhiteDay,
    isMenstruating: isMenstruatingDay(day),
    canDelete: Boolean(day.canDelete) && state === "completed",
  };
}

export function mapWhiteDaysFrameWeekDays(
  frame: FastingGoalFrameData,
): WhiteDaysFastDayProgress[] {
  return (frame.week?.days ?? []).map(mapWhiteDaysFrameDay);
}

export function getFastingFrameTodayIndex(frame: FastingGoalFrameData): number {
  const days = frame.week?.days ?? [];
  const todayIndex = days.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : Math.max(0, days.length - 1);
}

export function getFastingFrameWeekFraction(
  frame: FastingGoalFrameData,
): string {
  const label = frame.week.label?.trim();
  if (label) {
    const match = label.match(/(\d+\s*\/\s*\d+)/);
    if (match) return match[1].replace(/\s+/g, "");
  }
  const weekNumber =
    frame.week.weekNumber ?? frame.cycle.weekNumber ?? 1;
  const totalWeeks =
    frame.week.totalWeeks ?? frame.cycle.totalWeeks ?? 1;
  return `${weekNumber}/${totalWeeks}`;
}

export function formatFastingFrameWeekRange(
  weekStart: string,
  weekEnd: string,
): string {
  const start = moment(normalizeDate(weekStart), "YYYY-MM-DD");
  const end = moment(normalizeDate(weekEnd), "YYYY-MM-DD");
  if (!start.isValid() || !end.isValid()) return "";
  if (start.month() === end.month()) {
    return `${start.format("MMM D")} — ${end.format("D")}`;
  }
  return `${start.format("MMM D")} — ${end.format("MMM D")}`;
}

export function getFastingFrameWeekRangeLabel(
  frame: FastingGoalFrameData,
): string {
  if (frame.week.rangeLabel?.trim()) return frame.week.rangeLabel.trim();
  return formatFastingFrameWeekRange(
    frame.week.weekStart,
    frame.week.weekEnd,
  );
}

export function isFastingFrameWeekCurrentOrFuture(
  frame: FastingGoalFrameData,
): boolean {
  const today = moment().format("YYYY-MM-DD");
  const weekEnd = normalizeDate(frame.week.weekEnd);
  if (/^\d{4}-\d{2}-\d{2}$/.test(weekEnd) && weekEnd >= today) return true;
  const weekStart = normalizeDate(frame.week.weekStart);
  if (/^\d{4}-\d{2}-\d{2}$/.test(weekStart) && weekStart > today) return true;
  return (frame.week.days ?? []).some((day) => Boolean(day.isToday));
}

export function canNavigateFastingFrameWeekNext(
  frame: FastingGoalFrameData,
): boolean {
  if (isFastingFrameWeekCurrentOrFuture(frame)) return false;
  if (frame.week.hasNext === false) return false;
  if (frame.week.hasNext === true) return true;
  return frame.week.weekNumber < frame.week.totalWeeks;
}

export function getFastingFrameWeekStreakDays(
  frame: FastingGoalFrameData,
): number {
  const count = frame.week.streak?.count;
  if (typeof count === "number" && Number.isFinite(count)) {
    return Math.max(0, count);
  }
  return 0;
}

export function getFastingFrameTotalFastsThisWeek(
  frame: FastingGoalFrameData,
): number {
  const fromWeek = frame.week.totalFasts;
  if (typeof fromWeek === "number" && Number.isFinite(fromWeek)) {
    return Math.max(0, fromWeek);
  }
  return mapWhiteDaysFrameWeekDays(frame).filter(
    (day) => day.state === "completed",
  ).length;
}

export function getFastingFrameMotivationalQuote(
  frame: FastingGoalFrameData,
): string {
  return frame.week.motivation?.message?.trim() ?? "";
}

export function fastingFrameShowsInsights(frame: FastingGoalFrameData): boolean {
  if (frame.items?.[0]?.insightsAvailable) return true;
  const pct = frame.goal?.achievementPct ?? 0;
  if (pct >= 100) return true;
  const status = String(frame.goal?.status ?? "")
    .trim()
    .toUpperCase();
  if (status === "COMPLETED") return true;
  if (frame.cycle?.isEnded) return true;
  const cycleEnd = normalizeDate(frame.cycle?.endDate);
  if (/^\d{4}-\d{2}-\d{2}$/.test(cycleEnd)) {
    return moment().format("YYYY-MM-DD") >= cycleEnd;
  }
  return false;
}

export function getFastingFrameAchievementLabel(
  frame: FastingGoalFrameData,
  t: (key: string, options?: Record<string, unknown>) => string,
): { text: string; type: "not-started" | "in-progress" | "completed" } {
  const pill = frame.items?.[0]?.pill;
  const pillState = String(pill?.state ?? "")
    .trim()
    .toUpperCase();
  const pillLabel = pill?.label?.trim();

  if (pillState === "ACHIEVED" || pillState === "COMPLETED") {
    return {
      text: pillLabel || t("progressLogging.fullyAchieved"),
      type: "completed",
    };
  }
  if (pillState === "IN_PROGRESS" || pillState === "STARTED") {
    return {
      text: pillLabel || t("progressLogging.inProgress"),
      type: "in-progress",
    };
  }
  if (pillState === "NOT_STARTED") {
    return {
      text: pillLabel || t("progressLogging.notStarted"),
      type: "not-started",
    };
  }

  const pct = frame.goal?.achievementPct ?? 0;
  if (pct >= 100) {
    return { text: t("progressLogging.fullyAchieved"), type: "completed" };
  }
  if (pct > 0 || (frame.goal?.completed ?? 0) > 0) {
    return {
      text: pillLabel || t("progressLogging.inProgress"),
      type: "in-progress",
    };
  }
  return {
    text: pillLabel || t("progressLogging.notStarted"),
    type: "not-started",
  };
}

export function mapWhiteDaysFrameWeekSummary(
  frame: FastingGoalFrameData,
): WhiteDaysFastWeekSummary {
  const weekDays = mapWhiteDaysFrameWeekDays(frame);
  const completedFastsThisWeek = getFastingFrameTotalFastsThisWeek(frame);
  const motivationalQuote = getFastingFrameMotivationalQuote(frame);

  let motivationalQuoteKey: WhiteDaysFastWeekSummary["motivationalQuoteKey"] =
    "upcoming";
  if (weekDays.some((day) => day.state === "missed")) {
    motivationalQuoteKey = "missed";
  } else if (
    weekDays.filter((day) => day.isWhiteDay).length > 0 &&
    weekDays
      .filter((day) => day.isWhiteDay)
      .every((day) => day.state === "completed")
  ) {
    motivationalQuoteKey = "allCompleted";
  } else if (completedFastsThisWeek > 0) {
    motivationalQuoteKey = "completed";
  }

  return {
    weekDays,
    weekRangeLabel: getFastingFrameWeekRangeLabel(frame),
    weekFraction: getFastingFrameWeekFraction(frame),
    weekIndex: Math.max(0, (frame.week.weekNumber ?? 1) - 1),
    completedFastsThisWeek,
    monthlyStreak: getFastingFrameWeekStreakDays(frame),
    motivationalQuoteKey,
    motivationalQuote: motivationalQuote || undefined,
  };
}
