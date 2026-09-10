import { Colors } from "@/constants/theme";
import {
  DAILY_CYCLE_DAYS,
  WEEKLY_CYCLE_WEEKS,
  type SurahRecitationGoalId,
} from "./quranRecitationTarget";
import { getSurahRecitationGoals, getSurahRecitationGoalById } from "./quranRecitationSurahGoals";

export type QuranRecitationDayType = "past" | "today" | "future";

export type RecitationSegmentVisualState =
  | "completed"
  | "missed"
  | "pending"
  | "future";

export type QuranRecitationDayProgress = {
  day: string;
  recitationsCompleted: number;
  dayType: QuranRecitationDayType;
  isBestDay?: boolean;
};

export type RecitationProgressFrequency = "daily" | "weekly";

export type QuranRecitationWeekSummary = {
  weekDays: QuranRecitationDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalRecitationsThisWeek: number;
  /** Per-day recitation target for ring segments (1–5). */
  dailyTarget: number;
  /**
   * Weekly quota denominator for the stats row.
   * When set (weekly goals), stats show total/weekRecitationTarget.
   * When omitted (daily goals), stats use dailyTarget × 7.
   */
  weekRecitationTarget?: number;
  frequency?: RecitationProgressFrequency;
  streakDays: number;
  motivationalQuoteKey: string;
  /**
   * Delta vs previous week. `null` on week 1 (no comparison row).
   * Weeks 2–4 show the vs-last-week footer layout.
   */
  vsLastWeek?: number | null;
};

export type RecitationCycleWeekRecord = {
  weekNumber: number;
  completed: number;
  weekRangeLabel: string;
  weekFraction: string;
  weekDays: QuranRecitationDayProgress[];
  streakDays: number;
};

export type WeeklySurahRecitationCycle = {
  surahName: string;
  type: "weekly";
  weeklyTarget: number;
  cycleDays: number;
  weeks: RecitationCycleWeekRecord[];
  totalTarget: number;
  totalCompleted: number;
  activeWeekIndex: number;
};

export type DailySurahRecitationCycle = {
  type: "daily";
  dailyTarget: number;
  cycleDays: number;
  weeks: RecitationCycleWeekRecord[];
  totalTarget: number;
  totalCompleted: number;
  activeWeekIndex: number;
};

export type QuranRecitationCycleSummary =
  | WeeklySurahRecitationCycle
  | DailySurahRecitationCycle;

export type WeeklySurahDayStatus = "completed" | "not_logged" | "pending";

export type WeeklySurahDayRecord = {
  day: string;
  dayIndex: number;
  status: WeeklySurahDayStatus;
};

export type WeeklySurahDashboardItem = {
  surahId: string;
  surahName: string;
  type: "weekly";
  weeklyTarget: number;
  weekDays: WeeklySurahDayRecord[];
  completedThisWeek: number;
};

const SEGMENT_COLORS: Record<RecitationSegmentVisualState, string> = {
  completed: Colors.light.green,
  missed: Colors.light.yellow,
  pending: "rgba(255, 255, 255, 0.85)",
  future: "rgba(255, 255, 255, 0.18)",
};

const MOTIVATIONAL_QUOTE_KEY =
  "progressLogging.quranRecitationSurahWeekQuote";

export const RECITATION_DASHBOARD_WIDTH_RATIO = 0.92;
export const RECITATION_DASHBOARD_HORIZONTAL_PADDING = 16;
export const RECITATION_DAY_RING_SIZE_MAX = 24;
export const RECITATION_DAYS_PER_WEEK = 7;

export function getRecitationDashboardAvailableWidth(screenWidth: number): number {
  return (
    screenWidth * RECITATION_DASHBOARD_WIDTH_RATIO -
    RECITATION_DASHBOARD_HORIZONTAL_PADDING
  );
}

export function getRecitationDayRingSize(screenWidth: number): number {
  const availableWidth = getRecitationDashboardAvailableWidth(screenWidth);
  return Math.min(
    RECITATION_DAY_RING_SIZE_MAX,
    Math.floor((availableWidth / RECITATION_DAYS_PER_WEEK) * 0.62),
  );
}

export function clampDailyRecitationTarget(target: number): number {
  return Math.min(Math.max(Math.round(target), 1), 5);
}

export function getRecitationSegmentStates(
  completed: number,
  dailyTarget: number,
  dayType: QuranRecitationDayType,
): RecitationSegmentVisualState[] {
  const target = clampDailyRecitationTarget(dailyTarget);
  const clampedCompleted = Math.min(Math.max(completed, 0), target);

  return Array.from({ length: target }, (_, index) => {
    if (dayType === "future") return "future";
    if (index < clampedCompleted) return "completed";
    if (dayType === "past") return "missed";
    return "pending";
  });
}

export function getRecitationSegmentColor(
  state: RecitationSegmentVisualState,
): string {
  return SEGMENT_COLORS[state];
}

export function getSolidRecitationFillColor(
  completed: number,
  dailyTarget: number,
  dayType: QuranRecitationDayType,
): string {
  const target = clampDailyRecitationTarget(dailyTarget);

  if (dayType === "future") {
    return Colors.light.calendarBg;
  }

  if (completed >= target) {
    return Colors.light.green;
  }

  if (dayType === "past" && completed === 0) {
    return Colors.light.yellow;
  }

  return Colors.light.calendarBg;
}

export function mapDayProgressToWeeklyStatus(
  day: QuranRecitationDayProgress,
): WeeklySurahDayStatus {
  if (day.recitationsCompleted > 0) {
    return "completed";
  }

  if (day.dayType === "future" || day.dayType === "today") {
    return "pending";
  }

  return "not_logged";
}

export function getWeeklyDayCircleColors(status: WeeklySurahDayStatus): {
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
} {
  switch (status) {
    case "completed":
      return {
        backgroundColor: Colors.light.green,
        borderWidth: 0,
        borderColor: "transparent",
      };
    case "pending":
      return {
        backgroundColor: Colors.light.calendarBg,
        borderWidth: 1.5,
        borderColor: Colors.light.dullWhite,
      };
    case "not_logged":
      return {
        backgroundColor: Colors.light.calendarBg,
        borderWidth: 0,
        borderColor: "transparent",
      };
  }
}

function sumWeekCompletions(weeks: RecitationCycleWeekRecord[]): number {
  return weeks.reduce((sum, week) => sum + week.completed, 0);
}

function cycleWeekToSummary(
  week: RecitationCycleWeekRecord,
  ringTarget: number,
  frequency: RecitationProgressFrequency,
  weekRecitationTarget?: number,
  vsLastWeek: number | null = null,
): QuranRecitationWeekSummary {
  return {
    weekDays: week.weekDays,
    weekRangeLabel: week.weekRangeLabel,
    weekFraction: week.weekFraction,
    totalRecitationsThisWeek: week.completed,
    dailyTarget: ringTarget,
    weekRecitationTarget,
    frequency,
    streakDays: week.streakDays,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    vsLastWeek,
  };
}

/** Week 1 → null; weeks 2–4 → current completed − previous completed. */
export function getRecitationVsLastWeek(
  weeks: RecitationCycleWeekRecord[],
  weekIndex: number,
): number | null {
  if (weekIndex <= 0) return null;
  const current = weeks[weekIndex];
  const previous = weeks[weekIndex - 1];
  if (!current || !previous) return null;
  return current.completed - previous.completed;
}

const DAILY_CYCLE_WEEKS: RecitationCycleWeekRecord[] = [
  {
    weekNumber: 1,
    completed: 7,
    weekFraction: "1/4",
    weekRangeLabel: "Nov 29 — Dec 5",
    streakDays: 2,
    weekDays: [
      { day: "Sun", recitationsCompleted: 3, dayType: "past", isBestDay: true },
      { day: "Mon", recitationsCompleted: 1, dayType: "past" },
      { day: "Tue", recitationsCompleted: 2, dayType: "past" },
      { day: "Wed", recitationsCompleted: 1, dayType: "today" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
  {
    weekNumber: 2,
    completed: 5,
    weekFraction: "2/4",
    weekRangeLabel: "Dec 6 — Dec 12",
    streakDays: 1,
    weekDays: [
      { day: "Sun", recitationsCompleted: 2, dayType: "past" },
      { day: "Mon", recitationsCompleted: 1, dayType: "past" },
      { day: "Tue", recitationsCompleted: 2, dayType: "past" },
      { day: "Wed", recitationsCompleted: 0, dayType: "today" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
  {
    weekNumber: 3,
    completed: 0,
    weekFraction: "3/4",
    weekRangeLabel: "Dec 13 — Dec 19",
    streakDays: 0,
    weekDays: [
      { day: "Sun", recitationsCompleted: 0, dayType: "future" },
      { day: "Mon", recitationsCompleted: 0, dayType: "future" },
      { day: "Tue", recitationsCompleted: 0, dayType: "future" },
      { day: "Wed", recitationsCompleted: 0, dayType: "future" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
  {
    weekNumber: 4,
    completed: 0,
    weekFraction: "4/4",
    weekRangeLabel: "Dec 20 — Dec 26",
    streakDays: 0,
    weekDays: [
      { day: "Sun", recitationsCompleted: 0, dayType: "future" },
      { day: "Mon", recitationsCompleted: 0, dayType: "future" },
      { day: "Tue", recitationsCompleted: 0, dayType: "future" },
      { day: "Wed", recitationsCompleted: 0, dayType: "future" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
];

const DAILY_CYCLE_WEEKS_SINGLE_TARGET: RecitationCycleWeekRecord[] = [
  {
    ...DAILY_CYCLE_WEEKS[0],
    completed: 4,
    weekDays: [
      { day: "Sun", recitationsCompleted: 1, dayType: "past" },
      { day: "Mon", recitationsCompleted: 0, dayType: "past" },
      { day: "Tue", recitationsCompleted: 1, dayType: "past" },
      { day: "Wed", recitationsCompleted: 0, dayType: "today" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
  {
    ...DAILY_CYCLE_WEEKS[1],
    completed: 3,
    weekDays: [
      { day: "Sun", recitationsCompleted: 1, dayType: "past" },
      { day: "Mon", recitationsCompleted: 1, dayType: "past" },
      { day: "Tue", recitationsCompleted: 1, dayType: "past" },
      { day: "Wed", recitationsCompleted: 0, dayType: "today" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
  DAILY_CYCLE_WEEKS[2],
  DAILY_CYCLE_WEEKS[3],
];

const WEEKLY_AL_BAQARAH_CYCLE_WEEKS: RecitationCycleWeekRecord[] = [
  {
    weekNumber: 1,
    completed: 3,
    weekFraction: "1/4",
    weekRangeLabel: "Nov 29 — Dec 5",
    streakDays: 2,
    weekDays: [
      { day: "Sun", recitationsCompleted: 1, dayType: "past" },
      { day: "Mon", recitationsCompleted: 1, dayType: "past", isBestDay: true },
      { day: "Tue", recitationsCompleted: 1, dayType: "past" },
      { day: "Wed", recitationsCompleted: 0, dayType: "past" },
      { day: "Thu", recitationsCompleted: 0, dayType: "past" },
      { day: "Fri", recitationsCompleted: 0, dayType: "past" },
      { day: "Sat", recitationsCompleted: 0, dayType: "past" },
    ],
  },
  {
    weekNumber: 2,
    completed: 2,
    weekFraction: "2/4",
    weekRangeLabel: "Dec 6 — Dec 12",
    streakDays: 1,
    weekDays: [
      { day: "Sun", recitationsCompleted: 1, dayType: "past" },
      { day: "Mon", recitationsCompleted: 0, dayType: "past" },
      { day: "Tue", recitationsCompleted: 1, dayType: "past" },
      { day: "Wed", recitationsCompleted: 0, dayType: "today" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
  {
    weekNumber: 3,
    completed: 0,
    weekFraction: "3/4",
    weekRangeLabel: "Dec 13 — Dec 19",
    streakDays: 0,
    weekDays: [
      { day: "Sun", recitationsCompleted: 0, dayType: "future" },
      { day: "Mon", recitationsCompleted: 0, dayType: "future" },
      { day: "Tue", recitationsCompleted: 0, dayType: "future" },
      { day: "Wed", recitationsCompleted: 0, dayType: "future" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
  {
    weekNumber: 4,
    completed: 0,
    weekFraction: "4/4",
    weekRangeLabel: "Dec 20 — Dec 26",
    streakDays: 0,
    weekDays: [
      { day: "Sun", recitationsCompleted: 0, dayType: "future" },
      { day: "Mon", recitationsCompleted: 0, dayType: "future" },
      { day: "Tue", recitationsCompleted: 0, dayType: "future" },
      { day: "Wed", recitationsCompleted: 0, dayType: "future" },
      { day: "Thu", recitationsCompleted: 0, dayType: "future" },
      { day: "Fri", recitationsCompleted: 0, dayType: "future" },
      { day: "Sat", recitationsCompleted: 0, dayType: "future" },
    ],
  },
];

export const MOCK_WEEKLY_AL_BAQARAH_CYCLE: WeeklySurahRecitationCycle = {
  surahName: "Al-Baqarah",
  type: "weekly",
  weeklyTarget: 3,
  cycleDays: DAILY_CYCLE_DAYS,
  weeks: WEEKLY_AL_BAQARAH_CYCLE_WEEKS,
  totalTarget: 3 * WEEKLY_CYCLE_WEEKS,
  totalCompleted: sumWeekCompletions(WEEKLY_AL_BAQARAH_CYCLE_WEEKS),
  activeWeekIndex: 1,
};

const WEEKLY_SURAH_WEEK_DATA: Record<string, RecitationCycleWeekRecord[]> = {
  "surah-ya-sin": WEEKLY_AL_BAQARAH_CYCLE_WEEKS,
  "surah-al-baqarah": WEEKLY_AL_BAQARAH_CYCLE_WEEKS,
};

function buildWeeklySurahDashboardItem(
  surahId: string,
  surahName: string,
  weeklyTarget: number,
  week: RecitationCycleWeekRecord,
): WeeklySurahDashboardItem {
  return {
    surahId,
    surahName,
    type: "weekly",
    weeklyTarget,
    completedThisWeek: week.completed,
    weekDays: week.weekDays.map((day, dayIndex) => ({
      day: day.day,
      dayIndex,
      status: mapDayProgressToWeeklyStatus(day),
    })),
  };
}

export function getWeeklySurahDashboardItems(
  weekIndex: number,
): WeeklySurahDashboardItem[] {
  const cycle = MOCK_WEEKLY_AL_BAQARAH_CYCLE;
  const clampedWeekIndex = clampRecitationWeekIndex(weekIndex, cycle);
  const fallbackWeek = cycle.weeks[clampedWeekIndex];

  return getSurahRecitationGoals()
    .filter((goal) => goal.frequency === "weekly")
    .map((goal) => {
      const surahWeeks = WEEKLY_SURAH_WEEK_DATA[goal.id];
      const week = surahWeeks?.[clampedWeekIndex] ?? fallbackWeek;

      return buildWeeklySurahDashboardItem(
        goal.id,
        goal.surahName,
        goal.quantity,
        week,
      );
    });
}

export function getWeeklySurahDashboardItemForSurah(
  surahId: string,
  weekIndex: number,
): WeeklySurahDashboardItem | undefined {
  return getWeeklySurahDashboardItems(weekIndex).find(
    (item) => item.surahId === surahId,
  );
}

const DAILY_SURAH_WEEK_DATA: Record<string, RecitationCycleWeekRecord[]> = {
  "surah-al-mulk": [
    {
      ...DAILY_CYCLE_WEEKS[0],
      completed: 0,
      streakDays: 0,
      weekDays: DAILY_CYCLE_WEEKS[0].weekDays.map((day) => ({
        ...day,
        recitationsCompleted: 0,
        isBestDay: false,
      })),
    },
    ...DAILY_CYCLE_WEEKS.slice(1),
  ],
  "surah-al-baqarah": DAILY_CYCLE_WEEKS,
  "surah-al-kahf": [
    {
      ...DAILY_CYCLE_WEEKS[0],
      completed: 11,
      streakDays: 4,
      weekDays: [
        { day: "Sun", recitationsCompleted: 2, dayType: "past", isBestDay: true },
        { day: "Mon", recitationsCompleted: 2, dayType: "past" },
        { day: "Tue", recitationsCompleted: 1, dayType: "past" },
        { day: "Wed", recitationsCompleted: 2, dayType: "today" },
        { day: "Thu", recitationsCompleted: 2, dayType: "future" },
        { day: "Fri", recitationsCompleted: 1, dayType: "future" },
        { day: "Sat", recitationsCompleted: 1, dayType: "future" },
      ],
    },
    ...DAILY_CYCLE_WEEKS.slice(1),
  ],
};

export function getDailySurahRecitationWeekSummary(
  surahId: string,
  cycle: DailySurahRecitationCycle,
  weekIndex: number,
): QuranRecitationWeekSummary {
  const surahWeeks = DAILY_SURAH_WEEK_DATA[surahId] ?? cycle.weeks;
  const clampedIndex = clampRecitationWeekIndex(weekIndex, cycle);
  const week = surahWeeks[clampedIndex] ?? cycle.weeks[clampedIndex];
  const goal = getSurahRecitationGoalById(surahId);

  return cycleWeekToSummary(
    week,
    goal?.quantity ?? cycle.dailyTarget,
    "daily",
    undefined,
    getRecitationVsLastWeek(surahWeeks, clampedIndex),
  );
}

function buildDailyCycle(dailyTarget: number): DailySurahRecitationCycle {
  const weeks =
    dailyTarget === 1 ? DAILY_CYCLE_WEEKS_SINGLE_TARGET : DAILY_CYCLE_WEEKS;

  return {
    type: "daily",
    dailyTarget,
    cycleDays: DAILY_CYCLE_DAYS,
    weeks,
    totalTarget: dailyTarget * DAILY_CYCLE_DAYS,
    totalCompleted: sumWeekCompletions(weeks),
    activeWeekIndex: 0,
  };
}

export function hasWeeklySurahRecitationGoal(): boolean {
  return getSurahRecitationGoals().some((goal) => goal.frequency === "weekly");
}

export function getWeeklySurahRecitationGoal() {
  return getSurahRecitationGoals().find((goal) => goal.frequency === "weekly");
}

export function clampRecitationWeekIndex(
  weekIndex: number,
  cycle: QuranRecitationCycleSummary,
): number {
  return Math.min(Math.max(weekIndex, 0), cycle.weeks.length - 1);
}

export function canNavigateRecitationWeek(
  weekIndex: number,
  cycle: QuranRecitationCycleSummary,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") {
    return weekIndex > 0;
  }
  return weekIndex < cycle.weeks.length - 1;
}

export function getQuranRecitationCycleSummary(
  _goalId: SurahRecitationGoalId,
  options?: {
    singleTargetDemo?: boolean;
    forceWeekly?: boolean;
    forceDaily?: boolean;
  },
): QuranRecitationCycleSummary {
  if (options?.forceDaily) {
    const dailyTarget = options.singleTargetDemo ? 1 : 4;
    return buildDailyCycle(dailyTarget);
  }

  if (options?.forceWeekly) {
    return MOCK_WEEKLY_AL_BAQARAH_CYCLE;
  }

  if (hasWeeklySurahRecitationGoal()) {
    return MOCK_WEEKLY_AL_BAQARAH_CYCLE;
  }

  const dailyTarget = options?.singleTargetDemo ? 1 : 4;
  return buildDailyCycle(dailyTarget);
}

export function cycleSummaryToWeekSummary(
  cycle: QuranRecitationCycleSummary,
  weekIndex: number,
): QuranRecitationWeekSummary {
  const clampedIndex = clampRecitationWeekIndex(weekIndex, cycle);
  const week = cycle.weeks[clampedIndex];
  const vsLastWeek = getRecitationVsLastWeek(cycle.weeks, clampedIndex);

  if (cycle.type === "weekly") {
    return cycleWeekToSummary(
      week,
      cycle.weeklyTarget,
      "weekly",
      cycle.weeklyTarget,
      vsLastWeek,
    );
  }

  return cycleWeekToSummary(
    week,
    cycle.dailyTarget,
    "daily",
    undefined,
    vsLastWeek,
  );
}

/** @deprecated Use getQuranRecitationCycleSummary + cycleSummaryToWeekSummary */
export function getQuranRecitationWeekSummary(
  goalId: SurahRecitationGoalId,
  options?: {
    singleTargetDemo?: boolean;
    weekIndex?: number;
    forceWeekly?: boolean;
  },
): QuranRecitationWeekSummary {
  const cycle = getQuranRecitationCycleSummary(goalId, options);
  const weekIndex = options?.weekIndex ?? cycle.activeWeekIndex;
  return cycleSummaryToWeekSummary(cycle, weekIndex);
}
