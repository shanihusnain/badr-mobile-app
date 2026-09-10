import moment from "moment-hijri";
import type {
  QuranGoalFrameData,
  QuranGoalFrameDay,
  QuranGoalFrameStatus,
} from "@/src/api/queries/useGetQuranGoalFrame";
import type { QuranHoursDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranHoursWeeklyData";

export function formatQuranFrameWeekRange(weekStart: string, weekEnd: string) {
  const start = moment(weekStart, "YYYY-MM-DD");
  const end = moment(weekEnd, "YYYY-MM-DD");
  if (!start.isValid() || !end.isValid()) return "";
  if (start.month() === end.month()) {
    return `${start.format("MMM D")} — ${end.format("D")}`;
  }
  return `${start.format("MMM D")} — ${end.format("MMM D")}`;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Minutes logged for a day (`value` from LISTENING frame). */
export function getQuranFrameDayMinutes(day: QuranGoalFrameDay): number {
  const minutes = toFiniteNumber(day.value);
  return minutes != null && minutes >= 0 ? Math.round(minutes) : 0;
}

function hasQuranFrameDayActivity(day: QuranGoalFrameDay): boolean {
  const state = String(day.state ?? "").toUpperCase();
  return (
    getQuranFrameDayMinutes(day) > 0 ||
    state === "LOGGED" ||
    state === "COMPLETE" ||
    state === "BEST_DAY" ||
    state === "PARTIAL" ||
    state === "MISSED"
  );
}

/**
 * Prefer API activity/state over calendar "after today".
 * Device date can lag the cycle (e.g. Fri logged while "today" is still Thu),
 * and that must not blank the duration slot via `isFuture` → `isInactiveOutline`.
 */
function resolveIsFutureDay(day: QuranGoalFrameDay): boolean {
  if (day.isToday) return false;
  if (hasQuranFrameDayActivity(day)) return false;

  const state = String(day.state ?? "").toUpperCase();
  if (state === "UPCOMING") return true;
  if (day.date) {
    const date = moment(day.date, "YYYY-MM-DD");
    if (date.isValid()) return date.isAfter(moment(), "day");
  }
  return false;
}

export function mapQuranHoursFrameWeekDays(
  frame: QuranGoalFrameData,
): QuranHoursDayProgress[] {
  return frame.week.days.map((day) => {
    const minutesLogged = getQuranFrameDayMinutes(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isLogged = !isFuture && hasQuranFrameDayActivity(day);
    const apiDuration = day.valueDisplay?.trim() || undefined;

    return {
      day: day.dayLabel,
      minutesLogged,
      isLogged,
      isBestDay: Boolean(day.isBestDay) || state === "BEST_DAY",
      isToday: Boolean(day.isToday),
      isFuture,
      showDurationLabel: minutesLogged > 0 || !!apiDuration,
      date: day.date,
      durationLabel: apiDuration,
      canDelete: day.canDelete !== false && (minutesLogged > 0 || isLogged),
    };
  });
}

export function getQuranFrameTodayIndex(frame: QuranGoalFrameData): number {
  const todayIndex = frame.week.days.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : frame.week.days.length - 1;
}

export function getQuranFrameWeekFraction(frame: QuranGoalFrameData): string {
  const label = frame.week.label?.trim();
  if (label) {
    // API: "1/4 WEEKS" → "1/4"
    const match = label.match(/(\d+\s*\/\s*\d+)/);
    if (match) return match[1].replace(/\s+/g, "");
  }
  return `${frame.week.weekNumber}/${frame.week.totalWeeks}`;
}

export function getQuranFrameWeekRangeLabel(frame: QuranGoalFrameData): string {
  if (frame.week.rangeLabel?.trim()) return frame.week.rangeLabel.trim();
  return formatQuranFrameWeekRange(frame.week.weekStart, frame.week.weekEnd);
}

export function getQuranFrameWeekStreakDays(frame: QuranGoalFrameData): number {
  const weekStreak = toFiniteNumber(frame.week.streak?.count);
  if (weekStreak != null) return Math.max(0, weekStreak);

  const current = toFiniteNumber(frame.streaks?.currentStreak);
  if (current != null) return Math.max(0, current);

  return 0;
}

export function getQuranFrameWeekTotalMinutes(
  frame: QuranGoalFrameData,
): number {
  const fromWeek = toFiniteNumber(frame.week.totalMinutes);
  if (fromWeek != null && fromWeek >= 0) return Math.round(fromWeek);

  return frame.week.days.reduce(
    (sum, day) => sum + getQuranFrameDayMinutes(day),
    0,
  );
}

export function getQuranFrameMotivationalQuote(
  frame: QuranGoalFrameData,
): string {
  return frame.week.motivation?.message?.trim() ?? "";
}

/**
 * Signed minutes delta for the weekly footer caret.
 * `null` = week 1 / no comparison. DOWN → negative, UP → positive.
 */
export function getQuranFrameVsLastWeekDelta(
  frame: QuranGoalFrameData,
): number | null {
  const raw = frame.week.vsLastWeek;
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;

  const value = Math.abs(toFiniteNumber(raw.value) ?? 0);
  const direction = String(raw.direction ?? "").toUpperCase();
  if (direction === "DOWN") return -value;
  if (direction === "UP") return value;
  return value === 0 ? 0 : value;
}

/** Prefer API display string (e.g. "2h 0m") for the comparison badge. */
export function getQuranFrameVsLastWeekDisplay(
  frame: QuranGoalFrameData,
): string | null {
  const raw = frame.week.vsLastWeek;
  if (raw == null || typeof raw === "number") return null;
  const display = raw.display?.trim();
  if (display) return display;
  const value = toFiniteNumber(raw.value);
  if (value == null || value <= 0) return null;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${hours}h ${minutes}m`;
}

export function normalizeQuranGoalFrameStatus(
  status: string | undefined | null,
): QuranGoalFrameStatus {
  const normalized = (status ?? "NOT_STARTED").toUpperCase().replace(/-/g, "_");
  if (normalized === "IN_PROGRESS") return "IN_PROGRESS";
  if (normalized === "COMPLETED") return "COMPLETED";
  return "NOT_STARTED";
}

type TranslateFn = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export function getQuranFrameAchievementLabel(
  frame: QuranGoalFrameData,
  t: TranslateFn,
): { text: string; type: "in-progress" | "completed" | "not-started" } {
  const status = normalizeQuranGoalFrameStatus(frame.goal.status);
  const pct = frame.goal.achievementPct ?? 0;
  const completedMinutes = toFiniteNumber(frame.goal.completed) ?? 0;

  if (status === "COMPLETED" || pct >= 100) {
    return { text: t("progressLogging.fullyAchieved"), type: "completed" };
  }
  if (completedMinutes > 0 || pct > 0) {
    return { text: t("progressLogging.inProgress"), type: "in-progress" };
  }
  return { text: t("progressLogging.notStarted"), type: "not-started" };
}

/** Hours target for HOURS goals (LISTENING / TAJWEED). */
export function getQuranFrameTargetHours(frame: QuranGoalFrameData): number {
  return toFiniteNumber(frame.goal.target) ?? 0;
}

/** Prefer API card title, then targetLabel, then "N hours". */
export function getQuranFrameGoalTitle(frame: QuranGoalFrameData): string {
  const itemTitle = frame.items?.[0]?.title?.trim();
  if (itemTitle) return itemTitle;
  if (frame.goal.targetLabel?.trim()) return frame.goal.targetLabel.trim();
  const hours = getQuranFrameTargetHours(frame);
  return hours > 0 ? `${hours} hours` : frame.title?.trim() || "";
}

/** Compact ring inner label, e.g. "12 hours". */
export function getQuranFrameRingGoalCountLabel(
  frame: QuranGoalFrameData,
  unitLabel: string,
): string {
  const count = getQuranFrameTargetHours(frame);
  return `${count} ${unitLabel}`;
}

export function quranFrameShowsInsights(frame: QuranGoalFrameData): boolean {
  if (frame.items?.some((item) => item.showInsights)) return true;

  const pct = frame.goal.achievementPct ?? 0;
  if (pct >= 100) return true;

  const status = normalizeQuranGoalFrameStatus(frame.goal.status);
  if (status === "COMPLETED") return true;

  if (frame.cycle?.isEnded) return true;

  const cycleEnd = frame.cycle?.endDate;
  if (cycleEnd) {
    const today = moment().format("YYYY-MM-DD");
    const end = moment(cycleEnd).format("YYYY-MM-DD");
    if (end && today >= end) return true;
  }

  return false;
}

export function getQuranFrameCycleStart(frame: QuranGoalFrameData): string {
  return frame.cycle.startDate?.slice(0, 10) ?? "";
}

export function getQuranFrameCycleEnd(frame: QuranGoalFrameData): string {
  return frame.cycle.endDate?.slice(0, 10) ?? "";
}
