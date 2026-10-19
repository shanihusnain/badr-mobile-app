import moment from "moment-hijri";
import type {
  SadaqahGoalFrameData,
  SadaqahGoalFrameDay,
} from "@/src/api/queries/useGetSadaqahGoalFrame";
import type { MissedZakatDayProgress } from "@/components/molecules/MissedZakatWeeklyProgressDashboard";
import { formatReviewCurrencyAmount } from "@/src/utils/sadaqahGoalMap";

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
  const count = frame.week.streak?.count;
  if (typeof count === "number" && Number.isFinite(count)) {
    return Math.max(0, count);
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

export function getSadaqahFrameFlowCardTitle(
  frame: SadaqahGoalFrameData,
): string {
  const fromItem = frame.items?.[0]?.title?.trim();
  if (fromItem) return fromItem;
  const targetLabel = frame.goal?.targetLabel?.trim();
  if (targetLabel) return targetLabel;
  const target = frame.goal?.targetAmount ?? frame.goal?.target ?? null;
  const currency = frame.goal?.currencyCode ?? "USD";
  if (typeof target === "number" && target > 0) {
    return `${formatReviewCurrencyAmount(currency, target)} Toward Missed Zakat`;
  }
  return frame.title?.trim() || "Missed Zakat";
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
  const fromWeek = frame.week.totalSpent ?? frame.week.totalAmount;
  if (typeof fromWeek === "number" && Number.isFinite(fromWeek)) {
    return Math.max(0, fromWeek);
  }
  return (frame.week.days ?? []).reduce((sum, day) => sum + dayAmount(day), 0);
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
