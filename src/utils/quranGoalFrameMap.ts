import moment from "moment-hijri";
import type {
  QuranGoalFrameData,
  QuranGoalFrameDay,
  QuranGoalFrameStatus,
} from "@/src/api/queries/useGetQuranGoalFrame";
import type { QuranHoursDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranHoursWeeklyData";
import type { MemorisationDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationWeeklyData";

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

function normalizeFrameDate(value?: string | null): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  // Prefer plain YYYY-MM-DD — moment-hijri breaks on moment.ISO_8601 formats.
  const slice = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  const parsed = moment(raw, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
}

function resolveIsToday(day: QuranGoalFrameDay): boolean {
  const dateKey = normalizeFrameDate(day.date);
  if (dateKey) return dateKey === moment().format("YYYY-MM-DD");
  return Boolean(day.isToday);
}

function hasQuranFrameDayActivity(day: QuranGoalFrameDay): boolean {
  const state = String(day.state ?? "").toUpperCase();
  // MISSED / UPCOMING / EMPTY / NONE are not logged activity — do not paint green.
  return (
    getQuranFrameDayMinutes(day) > 0 ||
    state === "LOGGED" ||
    state === "COMPLETE" ||
    state === "BEST_DAY" ||
    state === "PARTIAL"
  );
}

/**
 * Prefer calendar date for today/future so:
 * - grey tab only on real today
 * - past empty days stay solid grey (not future outlines)
 * - past logged days stay green + muted (no today chrome)
 */
function resolveIsFutureDay(day: QuranGoalFrameDay): boolean {
  if (resolveIsToday(day)) return false;
  if (hasQuranFrameDayActivity(day)) return false;

  const state = String(day.state ?? "").toUpperCase();
  if (state === "UPCOMING") return true;
  const dateKey = normalizeFrameDate(day.date);
  if (dateKey) {
    return moment(dateKey, "YYYY-MM-DD").isAfter(moment(), "day");
  }
  return false;
}

export function mapQuranHoursFrameWeekDays(
  frame: QuranGoalFrameData,
): QuranHoursDayProgress[] {
  return frame.week.days.map((day) => {
    const minutesLogged = getQuranFrameDayMinutes(day);
    const isToday = resolveIsToday(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isMissed = state === "MISSED";
    const isLogged = !isFuture && !isMissed && hasQuranFrameDayActivity(day);
    const apiDuration = day.valueDisplay?.trim() || undefined;

    return {
      day: day.dayLabel,
      minutesLogged,
      isLogged,
      isBestDay: Boolean(day.isBestDay) || state === "BEST_DAY",
      isToday,
      isFuture,
      showDurationLabel: !isMissed && (minutesLogged > 0 || !!apiDuration),
      date: normalizeFrameDate(day.date) ?? day.date,
      durationLabel: apiDuration,
      canDelete:
        !isMissed &&
        day.canDelete !== false &&
        (minutesLogged > 0 || isLogged),
    };
  });
}

/** Map MEMORIZATION_* frame week days → memorisation weekly rings. */
export function mapQuranMemorisationFrameWeekDays(
  frame: QuranGoalFrameData,
): MemorisationDayProgress[] {
  return frame.week.days.map((day) => {
    const ayahsLogged = getQuranFrameDayMinutes(day);
    const isToday = resolveIsToday(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isMissed = state === "MISSED";
    const isLogged = !isFuture && !isMissed && hasQuranFrameDayActivity(day);
    const countLabel = day.valueDisplay?.trim() || undefined;

    return {
      day: day.dayLabel,
      date: normalizeFrameDate(day.date) ?? day.date,
      ayahsLogged,
      isLogged,
      isBestDay: Boolean(day.isBestDay) || state === "BEST_DAY",
      isToday,
      isFuture,
      countLabel,
      canDelete:
        !isMissed &&
        day.canDelete !== false &&
        (ayahsLogged > 0 || isLogged),
    };
  });
}

export function getQuranFrameMemorisationItem(frame: QuranGoalFrameData) {
  return frame.items?.[0] ?? null;
}

export function getQuranFrameMemorisationSurahName(
  frame: QuranGoalFrameData,
): string {
  const item = getQuranFrameMemorisationItem(frame);
  const title = item?.title?.trim();
  if (title) {
    // "Al-Fatihah (The Opening)" → "Al-Fatihah"
    const bare = title.replace(/\s*\([^)]*\)\s*$/, "").trim();
    return bare || title;
  }
  return frame.title?.trim() || "";
}

export function getQuranFrameMemorisationProgress(frame: QuranGoalFrameData) {
  const item = getQuranFrameMemorisationItem(frame);
  const memorizedAyahs = Math.max(
    0,
    Math.round(toFiniteNumber(item?.completed) ?? 0),
  );
  const totalAyahs = Math.max(
    0,
    Math.round(toFiniteNumber(item?.target) ?? 0),
  );
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        toFiniteNumber(item?.achievementPct) ??
          toFiniteNumber(frame.goal.achievementPct) ??
          0,
      ),
    ),
  );
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const completed =
    progressPercent >= 100 ||
    (totalAyahs > 0 && memorizedAyahs >= totalAyahs);

  return {
    memorizedAyahs,
    totalAyahs,
    remainingAyahs,
    progressPercent,
    completed,
  };
}

/** Ring label for memorisation — prefer API targetLabel ("Goal: 1 surah"). */
export function getQuranFrameMemorisationRingLabel(
  frame: QuranGoalFrameData,
): string {
  const label = frame.goal.targetLabel?.trim();
  if (label) {
    return label.replace(/^Goal:\s*/i, "").trim() || label;
  }
  const target = toFiniteNumber(frame.goal.target);
  if (target != null && target > 0) {
    return target === 1 ? "1 surah" : `${target} surahs`;
  }
  return getQuranFrameGoalTitle(frame);
}

export function getQuranFrameTodayIndex(frame: QuranGoalFrameData): number {
  const days = mapQuranHoursFrameWeekDays(frame);
  const todayIndex = days.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : days.length - 1;
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

export function getQuranFrameWeekTotalLabel(
  frame: QuranGoalFrameData,
): string | null {
  return frame.week.totalLabel?.trim() || null;
}

export function getQuranFrameWeekTotalDisplay(
  frame: QuranGoalFrameData,
): string | null {
  return frame.week.totalDisplay?.trim() || null;
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

/**
 * Show VIEW INSIGHTS when:
 * 1) the goal ring is at 100% (goal completed), or
 * 2) today is on/after the last day of the 28-day cycle.
 * Ignore `items[].showInsights` — API may set it before those conditions.
 */
export function quranFrameShowsInsights(frame: QuranGoalFrameData): boolean {
  const pct = frame.goal.achievementPct ?? 0;
  if (pct >= 100) return true;

  const status = normalizeQuranGoalFrameStatus(frame.goal.status);
  if (status === "COMPLETED") return true;

  const dayNumber = frame.cycle?.dayNumber;
  const totalDays = frame.cycle?.totalDays;
  if (
    dayNumber != null &&
    totalDays != null &&
    totalDays > 0 &&
    dayNumber >= totalDays
  ) {
    return true;
  }

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
