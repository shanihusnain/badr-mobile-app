import type { ReactNode } from "react";

export type SinglePrayerDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
  date?: string;
  /** When set (e.g. Quran hours), shown under the day instead of the count. */
  durationLabel?: string;
  /** When false, long-press delete is disabled for this day. */
  canDelete?: boolean;
};

export type SinglePrayerDayRingRenderArgs = {
  day: SinglePrayerDayProgress;
  index: number;
  size: number;
  isSelected: boolean;
  hasLog: boolean;
  isFuture: boolean;
  isMenstruation: boolean;
  showEmptyOutline: boolean;
};

export type SinglePrayerWeeklyProgressDashboardProps = {
  weekDays: SinglePrayerDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalPrayersThisWeek?: number;
  streakDays?: number;
  /**
   * Prayer delta vs the previous week.
   * `null` / omitted on week 1 (no comparison slot). Present from week 2 onward.
   */
  vsLastWeek?: number | null;
  /** When set, shown instead of the numeric magnitude (e.g. Quran "2h 0m"). */
  vsLastWeekDisplay?: string | null;
  motivationalQuote?: string;
  defaultMotivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  /** When true, remaining unlogged cycle days render as empty outlined circles. */
  isGoalCompleted?: boolean;
  /** Optional override for the stats row (icon + totals). */
  statsRow?: ReactNode;
  /** Optional custom day ring (e.g. Quran multi-arc / weekly circles). */
  renderDayRing?: (args: SinglePrayerDayRingRenderArgs) => ReactNode;
  /** When false, long-press delete chrome is disabled (e.g. mock Quran hours). Default true. */
  allowLogDeletion?: boolean;
  /**
   * Optional delete handler (Quran hours). When set, used instead of prayer
   * frame delete. May return a Promise — selection clears after it resolves.
   */
  onDeleteLog?: (date: string) => void | Promise<void>;
  /** Pending state for `onDeleteLog`. */
  isDeletingLog?: boolean;
  /** When true, activity captions (e.g. j5 / j8*) render green like the Juz pack. */
  greenActivityCaptions?: boolean;
  comparisonVariant?:
    | "onTime"
    | "prayers"
    | "recitations"
    | "quranRecitations"
    | "quranJuz"
    | "quranMemorizations"
    | "hours";
};

export const LOADING_WEEK: SinglePrayerDayProgress[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
].map((day) => ({
  day,
  prayersLogged: 0,
  isLogged: false,
}));

export const CARD_HORIZONTAL_PADDING = 16;
export const WRAPPER_WIDTH_RATIO = 0.92;
export const RING_SIZE_MAX = 24;
