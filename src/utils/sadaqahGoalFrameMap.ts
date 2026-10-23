import moment from "moment-hijri";
import type {
  SadaqahGoalFrameData,
  SadaqahGoalFrameDay,
} from "@/src/api/queries/useGetSadaqahGoalFrame";
import type { MissedZakatDayProgress } from "@/components/molecules/MissedZakatWeeklyProgressDashboard";
import type { KaffarahDayProgress } from "@/components/molecules/KaffarahWeeklyProgressDashboard";
import type { FidyaDayProgress } from "@/components/molecules/FidyaWeeklyProgressDashboard";
import type { LillahDayProgress } from "@/components/molecules/LillahWeeklyProgressDashboard";
import type { SadaqahJariyahDayProgress } from "@/components/molecules/SadaqahJariyahWeeklyProgressDashboard";
import type { VolunteeringDayProgress } from "@/components/molecules/VolunteeringWeeklyProgressDashboard";
import type { LillahCategoryId } from "@/src/screens/private/goalprogressloggingscreen/lillahCategories";
import { LILLAH_CATEGORIES } from "@/src/screens/private/goalprogressloggingscreen/lillahCategories";
import type { SadaqahJariyahCategoryId } from "@/src/screens/private/goalprogressloggingscreen/sadaqahJariyahCategories";
import { SADAQAH_JARIYAH_CATEGORIES } from "@/src/screens/private/goalprogressloggingscreen/sadaqahJariyahCategories";
import type { VolunteeringCategoryId } from "@/src/screens/private/goalprogressloggingscreen/volunteeringCategories";
import { VOLUNTEERING_CATEGORIES } from "@/src/screens/private/goalprogressloggingscreen/volunteeringCategories";

function normalizeDate(date: string | null | undefined): string {
  return String(date ?? "").slice(0, 10);
}

function dayAmount(day: SadaqahGoalFrameDay): number {
  const raw = day.amountLogged ?? day.amount ?? day.completedAmount ?? 0;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function resolveIsFutureDay(day: SadaqahGoalFrameDay): boolean {
  if (day.isToday) return false;
  const date = normalizeDate(day.date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date > moment().format("YYYY-MM-DD");
  }
  return false;
}

function isLoggedState(state: string): boolean {
  return (
    state === "COMPLETED" ||
    state === "LOGGED" ||
    state === "ACHIEVED" ||
    state === "DONE"
  );
}

export function formatSadaqahFrameWeekRange(
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

export function getSadaqahFrameWeekRangeLabel(
  frame: SadaqahGoalFrameData,
): string {
  if (frame.week.rangeLabel?.trim()) return frame.week.rangeLabel.trim();
  return formatSadaqahFrameWeekRange(frame.week.weekStart, frame.week.weekEnd);
}

export function getSadaqahFrameWeekFraction(
  frame: SadaqahGoalFrameData,
): string {
  const label = frame.week.label?.trim();
  if (label) {
    const match = label.match(/(\d+\s*\/\s*\d+)/);
    if (match) return match[1].replace(/\s+/g, "");
  }
  const weekNumber = frame.week.weekNumber ?? frame.cycle.weekNumber ?? 1;
  const totalWeeks = frame.week.totalWeeks ?? frame.cycle.totalWeeks ?? 1;
  return `${weekNumber}/${totalWeeks}`;
}

export function getSadaqahFrameTodayIndex(frame: SadaqahGoalFrameData): number {
  const days = frame.week?.days ?? [];
  const todayIndex = days.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : Math.max(0, days.length - 1);
}

export function isSadaqahFrameWeekCurrentOrFuture(
  frame: SadaqahGoalFrameData,
): boolean {
  const today = moment().format("YYYY-MM-DD");
  const weekEnd = normalizeDate(frame.week.weekEnd);
  if (/^\d{4}-\d{2}-\d{2}$/.test(weekEnd) && weekEnd >= today) return true;
  const weekStart = normalizeDate(frame.week.weekStart);
  if (/^\d{4}-\d{2}-\d{2}$/.test(weekStart) && weekStart > today) return true;
  return (frame.week.days ?? []).some((day) => Boolean(day.isToday));
}

export function canNavigateSadaqahFrameWeekNext(
  frame: SadaqahGoalFrameData,
): boolean {
  if (isSadaqahFrameWeekCurrentOrFuture(frame)) return false;
  if (frame.week.hasNext === false) return false;
  if (frame.week.hasNext === true) return true;
  return frame.week.weekNumber < frame.week.totalWeeks;
}

export function getSadaqahFrameWeekStreakDays(
  frame: SadaqahGoalFrameData,
): number {
  const streak = frame.week.streak;
  if (typeof streak === "number" && Number.isFinite(streak)) {
    return Math.max(0, streak);
  }
  if (streak && typeof streak === "object") {
    const count = streak.count;
    if (typeof count === "number" && Number.isFinite(count)) {
      return Math.max(0, count);
    }
  }
  return 0;
}

/** Ring fill 0–100 from frame `goal.achievementPct`, with completed/target fallback. */
export function getSadaqahFrameAchievementPct(
  frame: SadaqahGoalFrameData | null | undefined,
): number {
  if (!frame?.goal) return 0;

  const raw: unknown = frame.goal.achievementPct;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const pct = raw > 0 && raw <= 1 ? raw * 100 : raw;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number.parseFloat(raw.replace("%", ""));
    if (Number.isFinite(n)) {
      const pct = n > 0 && n <= 1 ? n * 100 : n;
      return Math.min(100, Math.max(0, Math.round(pct)));
    }
  }

  const completed =
    frame.goal.completedAmount ?? frame.goal.completed ?? null;
  const target = frame.goal.targetAmount ?? frame.goal.target ?? null;
  if (
    typeof completed === "number" &&
    typeof target === "number" &&
    target > 0
  ) {
    return Math.min(100, Math.max(0, Math.round((completed / target) * 100)));
  }

  return 0;
}

export function sadaqahFrameShowsInsights(
  frame: SadaqahGoalFrameData,
): boolean {
  if (frame.items?.[0]?.insightsAvailable) return true;
  const pct = getSadaqahFrameAchievementPct(frame);
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

export function getSadaqahFrameAchievementLabel(
  frame: SadaqahGoalFrameData,
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

  const pct = getSadaqahFrameAchievementPct(frame);
  if (pct >= 100) {
    return { text: t("progressLogging.fullyAchieved"), type: "completed" };
  }
  if (
    pct > 0 ||
    (frame.goal?.completedAmount ?? frame.goal?.completed ?? 0) > 0
  ) {
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

/** Backend ISO code from the frame (`AED`, `USD`, …). */
export function getSadaqahFrameCurrencyCode(
  frame: SadaqahGoalFrameData | null | undefined,
  fallback = "USD",
): string {
  const code = String(frame?.goal?.currencyCode ?? "")
    .trim()
    .toUpperCase();
  return code || fallback;
}

/** e.g. "AED 200" — same shape as frame `*Display` fields. */
export function formatSadaqahFrameCurrencyAmount(
  frame: SadaqahGoalFrameData | null | undefined,
  amount: number,
): string {
  const code = getSadaqahFrameCurrencyCode(frame);
  return `${code} ${Math.round(amount || 0).toLocaleString("en-US")}`;
}

function titleCaseFrameName(title: string | null | undefined): string {
  const raw = String(title ?? "").trim();
  if (!raw) return "Sadaqah";
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getSadaqahFrameFlowCardTitle(
  frame: SadaqahGoalFrameData,
): string {
  const fromItem = frame.items?.[0]?.title?.trim();
  if (fromItem) return fromItem;

  const targetDisplay = frame.goal?.targetDisplay?.trim();
  if (targetDisplay) {
    return `${targetDisplay} Toward ${titleCaseFrameName(frame.title)}`;
  }

  const targetLabel = frame.goal?.targetLabel?.trim();
  if (targetLabel) return targetLabel;

  const target = frame.goal?.targetAmount ?? frame.goal?.target ?? null;
  if (typeof target === "number" && target > 0) {
    return `${formatSadaqahFrameCurrencyAmount(frame, target)} Toward ${titleCaseFrameName(frame.title)}`;
  }
  return frame.title?.trim() || "Sadaqah";
}

export function getSadaqahFrameRemainingAmount(
  frame: SadaqahGoalFrameData,
): number {
  const remaining =
    frame.goal?.remainingAmount ?? frame.goal?.remaining ?? null;
  if (typeof remaining === "number" && Number.isFinite(remaining)) {
    return Math.max(0, remaining);
  }
  const target = frame.goal?.targetAmount ?? frame.goal?.target ?? 0;
  const completed =
    frame.goal?.completedAmount ?? frame.goal?.completed ?? 0;
  if (typeof target === "number" && typeof completed === "number") {
    return Math.max(0, target - completed);
  }
  return 0;
}

export function getSadaqahFrameTotalSpentThisWeek(
  frame: SadaqahGoalFrameData,
): number {
  const fromWeek =
    frame.week.totalSpent ?? frame.week.totalAmount ?? frame.week.total;
  if (typeof fromWeek === "number" && Number.isFinite(fromWeek)) {
    return Math.max(0, fromWeek);
  }
  return (frame.week.days ?? []).reduce((sum, day) => sum + dayAmount(day), 0);
}

function resolveKaffarahDayCategory(
  day: SadaqahGoalFrameDay,
): "clothes" | "meals" | null {
  const log = day.logs?.[0];
  const hints = [
    log?.kaffarahSubtype,
    log?.kaffarahSubtypeLabel,
    log?.category,
    log?.icon,
    day.icon,
    ...(day.categories ?? []),
  ]
    .map((v) => String(v ?? "").trim().toUpperCase())
    .filter(Boolean);

  for (const hint of hints) {
    if (
      hint.includes("CLOTH") ||
      hint === "ITEMS" ||
      hint === "CLOTHING_ITEMS" ||
      hint === "CLOTHING"
    ) {
      return "clothes";
    }
    if (hint.includes("MEAL") || hint === "MEALS" || hint === "FOOD") {
      return "meals";
    }
  }

  return dayAmount(day) > 0 ? "meals" : null;
}

export function mapKaffarahFrameDay(
  day: SadaqahGoalFrameDay,
  options?: { bestAmount?: number },
): KaffarahDayProgress {
  const count = dayAmount(day);
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  const isFuture =
    state === "FUTURE" || resolveIsFutureDay(day);
  const category = isFuture ? null : resolveKaffarahDayCategory(day);
  const isLogged = count > 0 || isLoggedState(state);
  const isBestDay =
    Boolean(day.isBestDay) ||
    (isLogged &&
      !isFuture &&
      typeof options?.bestAmount === "number" &&
      options.bestAmount > 0 &&
      count === options.bestAmount);

  return {
    day:
      day.dayLabel ||
      moment(normalizeDate(day.date), "YYYY-MM-DD").format("ddd"),
    date: normalizeDate(day.date),
    category,
    count,
    isToday: Boolean(day.isToday),
    isFuture,
    isBestDay,
    isBlurDay: Boolean(day.isBlurred),
    // Match Missed Zakat: explicit false blocks delete; omit/true + logged allows it.
    canDelete: day.canDelete !== false && isLogged && !isFuture,
  };
}

export function mapKaffarahFrameWeekDays(
  frame: SadaqahGoalFrameData,
): KaffarahDayProgress[] {
  const days = frame.week?.days ?? [];
  const amounts = days.map(dayAmount);
  const bestAmount = amounts.reduce((max, n) => Math.max(max, n), 0);
  return days.map((day) => mapKaffarahFrameDay(day, { bestAmount }));
}

export type KaffarahFrameWeekSummary = {
  weekDays: KaffarahDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalThisWeek: number;
  streakDays: number;
  selectedDayIndex: number;
  motivationalQuote?: string;
};

export function mapKaffarahFrameWeekSummary(
  frame: SadaqahGoalFrameData,
): KaffarahFrameWeekSummary {
  return {
    weekDays: mapKaffarahFrameWeekDays(frame),
    weekRangeLabel: getSadaqahFrameWeekRangeLabel(frame),
    weekFraction: getSadaqahFrameWeekFraction(frame),
    totalThisWeek: getSadaqahFrameTotalSpentThisWeek(frame),
    streakDays: getSadaqahFrameWeekStreakDays(frame),
    selectedDayIndex: getSadaqahFrameTodayIndex(frame),
    motivationalQuote: frame.week.motivation?.message?.trim() || undefined,
  };
}

export const KAFFARAH_LOADING_WEEK_SUMMARY: KaffarahFrameWeekSummary = {
  weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
    day,
    category: null,
    count: 0,
  })),
  weekRangeLabel: "---",
  weekFraction: "---",
  totalThisWeek: 0,
  streakDays: 0,
  selectedDayIndex: 0,
};

/** Prefer frame item title; else build from kaffarah meals/clothing targets. */
export function getKaffarahFrameFlowCardTitle(
  frame: SadaqahGoalFrameData,
): string {
  const fromItem = frame.items?.[0]?.title?.trim();
  if (fromItem) return fromItem;

  const targetLabel = frame.goal?.targetLabel?.trim();
  if (targetLabel) return targetLabel;

  const meals = frame.goal?.kaffarah?.meals?.target ?? 0;
  const clothing = frame.goal?.kaffarah?.clothing?.target ?? 0;
  const parts: string[] = [];
  if (typeof meals === "number" && meals > 0) {
    parts.push(`${meals} Meal${meals === 1 ? "" : "s"}`);
  }
  if (typeof clothing === "number" && clothing > 0) {
    parts.push(
      `${clothing} Piece${clothing === 1 ? "" : "s"} of Clothing`,
    );
  }
  if (parts.length > 0) {
    return `${parts.join(" & ")} for Those in Need`;
  }

  return getSadaqahFrameFlowCardTitle(frame);
}

export function mapMissedZakatFrameDay(
  day: SadaqahGoalFrameDay,
  options?: { bestAmount?: number },
): MissedZakatDayProgress {
  const amount = dayAmount(day);
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  const isFuture = resolveIsFutureDay(day);
  const isLogged = amount > 0 || isLoggedState(state);
  const isBestDay =
    Boolean(day.isBestDay) ||
    (isLogged &&
      !isFuture &&
      typeof options?.bestAmount === "number" &&
      options.bestAmount > 0 &&
      amount === options.bestAmount);

  return {
    day:
      day.dayLabel ||
      moment(normalizeDate(day.date), "YYYY-MM-DD").format("ddd"),
    date: normalizeDate(day.date),
    amountLogged: amount,
    isLogged,
    isFuture,
    isBestDay,
    // Match prayer/fasting: explicit false blocks delete; omit/true + logged allows it.
    canDelete: day.canDelete !== false && isLogged && !isFuture,
  };
}

export function mapMissedZakatFrameWeekDays(
  frame: SadaqahGoalFrameData,
): MissedZakatDayProgress[] {
  const days = frame.week?.days ?? [];
  const amounts = days.map(dayAmount);
  const bestAmount = amounts.reduce((max, n) => Math.max(max, n), 0);
  return days.map((day) => mapMissedZakatFrameDay(day, { bestAmount }));
}

export type MissedZakatFrameWeekSummary = {
  weekDays: MissedZakatDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalSpentThisWeek: number;
  streakDays: number;
  remainingAmount: number;
  selectedDayIndex: number;
};

export function mapMissedZakatFrameWeekSummary(
  frame: SadaqahGoalFrameData,
): MissedZakatFrameWeekSummary {
  return {
    weekDays: mapMissedZakatFrameWeekDays(frame),
    weekRangeLabel: getSadaqahFrameWeekRangeLabel(frame),
    weekFraction: getSadaqahFrameWeekFraction(frame),
    totalSpentThisWeek: getSadaqahFrameTotalSpentThisWeek(frame),
    streakDays: getSadaqahFrameWeekStreakDays(frame),
    remainingAmount: getSadaqahFrameRemainingAmount(frame),
    selectedDayIndex: getSadaqahFrameTodayIndex(frame),
  };
}

export const MISSED_ZAKAT_LOADING_WEEK_SUMMARY: MissedZakatFrameWeekSummary = {
  weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
    day,
    amountLogged: 0,
    isFuture: false,
  })),
  weekRangeLabel: "---",
  weekFraction: "---",
  totalSpentThisWeek: 0,
  streakDays: 0,
  remainingAmount: 0,
  selectedDayIndex: 0,
};

export function mapFidyaFrameDay(
  day: SadaqahGoalFrameDay,
  options?: { bestAmount?: number },
): FidyaDayProgress {
  const count = dayAmount(day);
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  const isFuture = state === "FUTURE" || resolveIsFutureDay(day);
  const isLogged = count > 0 || isLoggedState(state);
  const isBestDay =
    Boolean(day.isBestDay) ||
    (isLogged &&
      !isFuture &&
      typeof options?.bestAmount === "number" &&
      options.bestAmount > 0 &&
      count === options.bestAmount);

  return {
    day:
      day.dayLabel ||
      moment(normalizeDate(day.date), "YYYY-MM-DD").format("ddd"),
    date: normalizeDate(day.date),
    count,
    isToday: Boolean(day.isToday),
    isFuture,
    isBestDay,
    isBlurDay: Boolean(day.isBlurred),
    canDelete: day.canDelete !== false && isLogged && !isFuture,
  };
}

export function mapFidyaFrameWeekDays(
  frame: SadaqahGoalFrameData,
): FidyaDayProgress[] {
  const days = frame.week?.days ?? [];
  const amounts = days.map(dayAmount);
  const bestAmount = amounts.reduce((max, n) => Math.max(max, n), 0);
  return days.map((day) => mapFidyaFrameDay(day, { bestAmount }));
}

export type FidyaFrameWeekSummary = {
  weekDays: FidyaDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalThisWeek: number;
  streakDays: number;
  selectedDayIndex: number;
  motivationalQuote?: string;
};

export function mapFidyaFrameWeekSummary(
  frame: SadaqahGoalFrameData,
): FidyaFrameWeekSummary {
  return {
    weekDays: mapFidyaFrameWeekDays(frame),
    weekRangeLabel: getSadaqahFrameWeekRangeLabel(frame),
    weekFraction: getSadaqahFrameWeekFraction(frame),
    totalThisWeek: getSadaqahFrameTotalSpentThisWeek(frame),
    streakDays: getSadaqahFrameWeekStreakDays(frame),
    selectedDayIndex: getSadaqahFrameTodayIndex(frame),
    motivationalQuote: frame.week?.motivation?.message?.trim() || undefined,
  };
}

export const FIDYA_LOADING_WEEK_SUMMARY: FidyaFrameWeekSummary = {
  weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
    day,
    count: 0,
  })),
  weekRangeLabel: "---",
  weekFraction: "---",
  totalThisWeek: 0,
  streakDays: 0,
  selectedDayIndex: 0,
};

/** Prefer frame item title; else "{N} Meals for Those in Need". */
export function getFidyaFrameFlowCardTitle(frame: SadaqahGoalFrameData): string {
  const fromItem = frame.items?.[0]?.title?.trim();
  if (fromItem) return fromItem;

  const targetLabel = frame.goal?.targetLabel?.trim();
  if (targetLabel) return targetLabel;

  const targetDisplay = frame.goal?.targetDisplay?.trim();
  if (targetDisplay) return targetDisplay;

  const meals = frame.goal?.targetAmount ?? frame.goal?.target ?? null;
  if (typeof meals === "number" && meals > 0) {
    return `${meals} Meal${meals === 1 ? "" : "s"} for Those in Need`;
  }

  return frame.title?.trim() || "Fidya for Missed Fasts";
}

/** UI kebab id (`food-relief`) → backend causeCategory (`FOOD_RELIEF`). */
export function sadaqahUiCategoryToCauseCategory(uiId: string): string {
  return String(uiId ?? "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");
}

function normalizeCategoryHint(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
}

function dayCategoryHints(day: SadaqahGoalFrameDay): string[] {
  const log = day.logs?.[0];
  return [
    log?.category,
    log?.categoryLabel,
    log?.icon,
    day.icon,
    ...(day.categories ?? []),
  ]
    .map((v) => normalizeCategoryHint(String(v ?? "")))
    .filter(Boolean);
}

function resolveLillahCategory(
  day: SadaqahGoalFrameDay,
): LillahCategoryId | null {
  const ids = new Set(LILLAH_CATEGORIES.map((c) => c.id));
  for (const hint of dayCategoryHints(day)) {
    if (ids.has(hint as LillahCategoryId)) return hint as LillahCategoryId;
    for (const cat of LILLAH_CATEGORIES) {
      if (hint.includes(cat.id) || cat.id.includes(hint)) return cat.id;
      if (normalizeCategoryHint(cat.label) === hint) return cat.id;
    }
  }
  return dayAmount(day) > 0 ? "food-relief" : null;
}

function resolveJariyahCategory(
  day: SadaqahGoalFrameDay,
): SadaqahJariyahCategoryId | null {
  const ids = new Set(SADAQAH_JARIYAH_CATEGORIES.map((c) => c.id));
  for (const hint of dayCategoryHints(day)) {
    if (ids.has(hint as SadaqahJariyahCategoryId)) {
      return hint as SadaqahJariyahCategoryId;
    }
    for (const cat of SADAQAH_JARIYAH_CATEGORIES) {
      if (hint.includes(cat.id) || cat.id.includes(hint)) return cat.id;
      if (normalizeCategoryHint(cat.label) === hint) return cat.id;
    }
  }
  return dayAmount(day) > 0 ? "honoring-parents" : null;
}

function resolveVolunteeringCategory(
  day: SadaqahGoalFrameDay,
): VolunteeringCategoryId | null {
  const ids = new Set(VOLUNTEERING_CATEGORIES.map((c) => c.id));
  for (const hint of dayCategoryHints(day)) {
    if (ids.has(hint as VolunteeringCategoryId)) {
      return hint as VolunteeringCategoryId;
    }
    for (const cat of VOLUNTEERING_CATEGORIES) {
      if (hint.includes(cat.id) || cat.id.includes(hint)) return cat.id;
      if (normalizeCategoryHint(cat.label) === hint) return cat.id;
    }
  }
  const minutes = dayMinutes(day);
  return minutes > 0 ? "distributing-food" : null;
}

function dayMinutes(day: SadaqahGoalFrameDay): number {
  if (typeof day.minutes === "number" && Number.isFinite(day.minutes)) {
    return Math.max(0, Math.round(day.minutes));
  }
  const logMinutes = day.logs?.[0]?.durationMinutes;
  if (typeof logMinutes === "number" && Number.isFinite(logMinutes)) {
    return Math.max(0, Math.round(logMinutes));
  }
  // Some payloads store hours in `amount` for volunteering.
  const amount = dayAmount(day);
  if (amount > 0 && amount < 24) {
    return Math.round(amount * 60);
  }
  return Math.max(0, Math.round(amount));
}

export function mapLillahFrameDay(
  day: SadaqahGoalFrameDay,
  options?: { bestAmount?: number },
): LillahDayProgress {
  const amount = dayAmount(day);
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  const isFuture = state === "FUTURE" || resolveIsFutureDay(day);
  const category = isFuture ? null : resolveLillahCategory(day);
  const isLogged = amount > 0 || isLoggedState(state);
  const isBestDay =
    Boolean(day.isBestDay) ||
    (isLogged &&
      !isFuture &&
      typeof options?.bestAmount === "number" &&
      options.bestAmount > 0 &&
      amount === options.bestAmount);

  return {
    day:
      day.dayLabel ||
      moment(normalizeDate(day.date), "YYYY-MM-DD").format("ddd"),
    date: normalizeDate(day.date),
    category,
    amount,
    isToday: Boolean(day.isToday),
    isFuture,
    isBestDay,
    isBlurDay: Boolean(day.isBlurred),
    canDelete: day.canDelete !== false && isLogged && !isFuture,
  };
}

export function mapLillahFrameWeekDays(
  frame: SadaqahGoalFrameData,
): LillahDayProgress[] {
  const days = frame.week?.days ?? [];
  const amounts = days.map(dayAmount);
  const bestAmount = amounts.reduce((max, n) => Math.max(max, n), 0);
  return days.map((day) => mapLillahFrameDay(day, { bestAmount }));
}

export type LillahFrameWeekSummary = {
  weekDays: LillahDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalThisWeek: number;
  streakDays: number;
  selectedDayIndex: number;
  motivationalQuote?: string;
};

export function mapLillahFrameWeekSummary(
  frame: SadaqahGoalFrameData,
): LillahFrameWeekSummary {
  return {
    weekDays: mapLillahFrameWeekDays(frame),
    weekRangeLabel: getSadaqahFrameWeekRangeLabel(frame),
    weekFraction: getSadaqahFrameWeekFraction(frame),
    totalThisWeek: getSadaqahFrameTotalSpentThisWeek(frame),
    streakDays: getSadaqahFrameWeekStreakDays(frame),
    selectedDayIndex: getSadaqahFrameTodayIndex(frame),
    motivationalQuote: frame.week?.motivation?.message?.trim() || undefined,
  };
}

export const LILLAH_LOADING_WEEK_SUMMARY: LillahFrameWeekSummary = {
  weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
    day,
    category: null,
    amount: 0,
  })),
  weekRangeLabel: "---",
  weekFraction: "---",
  totalThisWeek: 0,
  streakDays: 0,
  selectedDayIndex: 0,
};

export function mapSadaqahJariyahFrameDay(
  day: SadaqahGoalFrameDay,
  options?: { bestAmount?: number },
): SadaqahJariyahDayProgress {
  const amount = dayAmount(day);
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  const isFuture = state === "FUTURE" || resolveIsFutureDay(day);
  const category = isFuture ? null : resolveJariyahCategory(day);
  const isLogged = amount > 0 || isLoggedState(state);
  const isBestDay =
    Boolean(day.isBestDay) ||
    (isLogged &&
      !isFuture &&
      typeof options?.bestAmount === "number" &&
      options.bestAmount > 0 &&
      amount === options.bestAmount);

  return {
    day:
      day.dayLabel ||
      moment(normalizeDate(day.date), "YYYY-MM-DD").format("ddd"),
    date: normalizeDate(day.date),
    category,
    amount,
    isToday: Boolean(day.isToday),
    isFuture,
    isBestDay,
    isBlurDay: Boolean(day.isBlurred),
    canDelete: day.canDelete !== false && isLogged && !isFuture,
  };
}

export function mapSadaqahJariyahFrameWeekDays(
  frame: SadaqahGoalFrameData,
): SadaqahJariyahDayProgress[] {
  const days = frame.week?.days ?? [];
  const amounts = days.map(dayAmount);
  const bestAmount = amounts.reduce((max, n) => Math.max(max, n), 0);
  return days.map((day) => mapSadaqahJariyahFrameDay(day, { bestAmount }));
}

export type SadaqahJariyahFrameWeekSummary = {
  weekDays: SadaqahJariyahDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalThisWeek: number;
  streakDays: number;
  selectedDayIndex: number;
  motivationalQuote?: string;
};

export function mapSadaqahJariyahFrameWeekSummary(
  frame: SadaqahGoalFrameData,
): SadaqahJariyahFrameWeekSummary {
  return {
    weekDays: mapSadaqahJariyahFrameWeekDays(frame),
    weekRangeLabel: getSadaqahFrameWeekRangeLabel(frame),
    weekFraction: getSadaqahFrameWeekFraction(frame),
    totalThisWeek: getSadaqahFrameTotalSpentThisWeek(frame),
    streakDays: getSadaqahFrameWeekStreakDays(frame),
    selectedDayIndex: getSadaqahFrameTodayIndex(frame),
    motivationalQuote: frame.week?.motivation?.message?.trim() || undefined,
  };
}

export const SADAQAH_JARIYAH_LOADING_WEEK_SUMMARY: SadaqahJariyahFrameWeekSummary =
  {
    weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
      day,
      category: null,
      amount: 0,
    })),
    weekRangeLabel: "---",
    weekFraction: "---",
    totalThisWeek: 0,
    streakDays: 0,
    selectedDayIndex: 0,
  };

export function mapVolunteeringFrameDay(
  day: SadaqahGoalFrameDay,
  options?: { bestMinutes?: number },
): VolunteeringDayProgress {
  const minutesLogged = dayMinutes(day);
  const state = String(day.state ?? "")
    .trim()
    .toUpperCase();
  const isFuture = state === "FUTURE" || resolveIsFutureDay(day);
  const category = isFuture ? null : resolveVolunteeringCategory(day);
  const isLogged = minutesLogged > 0 || isLoggedState(state);
  const isBestDay =
    Boolean(day.isBestDay) ||
    (isLogged &&
      !isFuture &&
      typeof options?.bestMinutes === "number" &&
      options.bestMinutes > 0 &&
      minutesLogged === options.bestMinutes);

  return {
    day:
      day.dayLabel ||
      moment(normalizeDate(day.date), "YYYY-MM-DD").format("ddd"),
    date: normalizeDate(day.date),
    category,
    minutesLogged,
    isToday: Boolean(day.isToday),
    isFuture,
    isBestDay,
    isBlurDay: Boolean(day.isBlurred),
    canDelete: day.canDelete !== false && isLogged && !isFuture,
  };
}

export function mapVolunteeringFrameWeekDays(
  frame: SadaqahGoalFrameData,
): VolunteeringDayProgress[] {
  const days = frame.week?.days ?? [];
  const minutes = days.map(dayMinutes);
  const bestMinutes = minutes.reduce((max, n) => Math.max(max, n), 0);
  return days.map((day) => mapVolunteeringFrameDay(day, { bestMinutes }));
}

export type VolunteeringFrameWeekSummary = {
  weekDays: VolunteeringDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalMinutesThisWeek: number;
  streakDays: number;
  selectedDayIndex: number;
  motivationalQuote?: string;
};

export function mapVolunteeringFrameWeekSummary(
  frame: SadaqahGoalFrameData,
): VolunteeringFrameWeekSummary {
  const weekDays = mapVolunteeringFrameWeekDays(frame);
  const fromWeekTotal =
    typeof frame.week?.total === "number" && Number.isFinite(frame.week.total)
      ? Math.round(frame.week.total)
      : null;
  // Prefer summing day minutes; week.total may already be hours for volunteering.
  const summed = weekDays.reduce((sum, d) => sum + d.minutesLogged, 0);
  const totalMinutesThisWeek =
    summed > 0
      ? summed
      : fromWeekTotal != null && fromWeekTotal < 48
        ? Math.round(fromWeekTotal * 60)
        : (fromWeekTotal ?? 0);

  return {
    weekDays,
    weekRangeLabel: getSadaqahFrameWeekRangeLabel(frame),
    weekFraction: getSadaqahFrameWeekFraction(frame),
    totalMinutesThisWeek,
    streakDays: getSadaqahFrameWeekStreakDays(frame),
    selectedDayIndex: getSadaqahFrameTodayIndex(frame),
    motivationalQuote: frame.week?.motivation?.message?.trim() || undefined,
  };
}

export const VOLUNTEERING_LOADING_WEEK_SUMMARY: VolunteeringFrameWeekSummary = {
  weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
    day,
    category: null,
    minutesLogged: 0,
  })),
  weekRangeLabel: "---",
  weekFraction: "---",
  totalMinutesThisWeek: 0,
  streakDays: 0,
  selectedDayIndex: 0,
};

export function getVolunteeringFrameFlowCardTitle(
  frame: SadaqahGoalFrameData,
): string {
  const fromItem = frame.items?.[0]?.title?.trim();
  if (fromItem) return fromItem;

  const targetLabel = frame.goal?.targetLabel?.trim();
  if (targetLabel) return targetLabel;

  const hours = frame.goal?.targetAmount ?? frame.goal?.target ?? null;
  if (typeof hours === "number" && hours > 0) {
    return `${hours} Hour${hours === 1 ? "" : "s"} of\nVolunteering`;
  }

  return frame.title?.trim() || "Volunteering Services";
}
