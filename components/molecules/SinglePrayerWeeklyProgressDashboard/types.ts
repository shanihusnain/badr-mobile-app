export type SinglePrayerDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
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
  motivationalQuote?: string;
  defaultMotivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  /** When true, remaining unlogged cycle days render as empty outlined circles. */
  isGoalCompleted?: boolean;
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
