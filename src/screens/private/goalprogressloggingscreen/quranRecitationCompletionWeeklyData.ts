import { Colors } from "@/constants/theme";
import type { QuranRecitationDayType } from "./quranRecitationWeeklyData";

export type CompletionJuzRange = {
  start: number;
  end: number;
};

export type QuranCompletionDayProgress = {
  day: string;
  dayType: QuranRecitationDayType;
  completionNumber: number | null;
  fullJuzRanges: string[];
  partialJuz: string[];
  computedLabel: string;
  hasActivity: boolean;
  isBestDay?: boolean;
  /** Higher = more activity; used for best-day selection. */
  activityScore: number;
  /** Count of distinct juz touched (full ranges + partial). */
  juzCoverageCount: number;
  /** True when the day includes at least one fully completed juz range. */
  hasFullCompletion: boolean;
};

export type QuranCompletionWeekSummary = {
  weekDays: QuranCompletionDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  completionsLoggedThisWeek: number;
  targetCompletions: number;
  streakDays: number;
  motivationalQuoteKey: string;
};

export type QuranCompletionCycleSummary = {
  weeks: QuranCompletionWeekSummary[];
  activeWeekIndex: number;
};

const MOTIVATIONAL_QUOTE_KEY =
  "progressLogging.quranCompletionWeekQuote";

function formatFullJuzRange(range: CompletionJuzRange): string {
  if (range.start === range.end) {
    return `j${range.start}`;
  }
  return `j${range.start}-j${range.end}`;
}

function formatPartialJuz(juz: number): string {
  return `j${juz}`;
}

export function buildCompletionDayLabel(
  fullJuzRanges: string[],
  partialJuz: string[],
): string {
  const partialParts = partialJuz.map((juz) =>
    juz.endsWith("*") ? juz : `${juz}*`,
  );
  return [...fullJuzRanges, ...partialParts].filter(Boolean).join(" ");
}

export function countJuzCoverage(
  fullRanges: CompletionJuzRange[],
  partialJuz: number[],
): number {
  const fullCount = fullRanges.reduce(
    (sum, range) => sum + (range.end - range.start + 1),
    0,
  );
  return fullCount + partialJuz.length;
}

export function computeCompletionActivityScore(
  fullRanges: CompletionJuzRange[],
  partialJuz: number[],
): number {
  const coverage = countJuzCoverage(fullRanges, partialJuz);
  const hasFullCompletion = fullRanges.length > 0;
  return coverage + (hasFullCompletion ? 100 : 0);
}

export function buildCompletionDayProgress(input: {
  day: string;
  dayType: QuranRecitationDayType;
  completionNumber: number | null;
  fullJuzRanges?: CompletionJuzRange[];
  partialJuz?: number[];
}): QuranCompletionDayProgress {
  const fullRanges = input.fullJuzRanges ?? [];
  const partialJuzNumbers = input.partialJuz ?? [];
  const fullJuzRanges = fullRanges.map(formatFullJuzRange);
  const partialJuz = partialJuzNumbers.map(formatPartialJuz);
  const hasActivity = fullJuzRanges.length > 0 || partialJuz.length > 0;
  const juzCoverageCount = countJuzCoverage(fullRanges, partialJuzNumbers);
  const hasFullCompletion = fullRanges.length > 0;
  const activityScore = computeCompletionActivityScore(
    fullRanges,
    partialJuzNumbers,
  );

  return {
    day: input.day,
    dayType: input.dayType,
    completionNumber: hasActivity ? input.completionNumber : null,
    fullJuzRanges,
    partialJuz,
    computedLabel: buildCompletionDayLabel(fullJuzRanges, partialJuz),
    hasActivity,
    activityScore,
    juzCoverageCount,
    hasFullCompletion,
  };
}

export function applyCompletionBestDayFlags(
  days: QuranCompletionDayProgress[],
): QuranCompletionDayProgress[] {
  const activeDays = days.filter((day) => day.hasActivity);
  if (activeDays.length === 0) {
    return days.map((day) => ({ ...day, isBestDay: false }));
  }

  const bestDay = activeDays.reduce((best, current) => {
    if (current.hasFullCompletion && !best.hasFullCompletion) return current;
    if (current.hasFullCompletion !== best.hasFullCompletion) return best;

    if (current.activityScore > best.activityScore) return current;
    if (current.activityScore < best.activityScore) return best;

    if (current.juzCoverageCount > best.juzCoverageCount) return current;
    return best;
  });

  return days.map((day) => ({
    ...day,
    isBestDay: day.hasActivity && day.day === bestDay.day,
  }));
}

function finalizeWeek(
  week: Omit<QuranCompletionWeekSummary, "weekDays"> & {
    weekDays: QuranCompletionDayProgress[];
  },
): QuranCompletionWeekSummary {
  return {
    ...week,
    weekDays: applyCompletionBestDayFlags(week.weekDays),
  };
}

const MOCK_COMPLETION_WEEKS: QuranCompletionWeekSummary[] = [
  finalizeWeek({
    weekRangeLabel: "Nov 29 — Dec 5",
    weekFraction: "1/4",
    completionsLoggedThisWeek: 1,
    targetCompletions: 3,
    streakDays: 2,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: [
      buildCompletionDayProgress({
        day: "Sun",
        dayType: "past",
        completionNumber: 1,
        fullJuzRanges: [{ start: 1, end: 2 }],
      }),
      buildCompletionDayProgress({
        day: "Mon",
        dayType: "past",
        completionNumber: 1,
        partialJuz: [3],
      }),
      buildCompletionDayProgress({
        day: "Tue",
        dayType: "past",
        completionNumber: 1,
        fullJuzRanges: [{ start: 22, end: 23 }],
        partialJuz: [4],
      }),
      buildCompletionDayProgress({
        day: "Wed",
        dayType: "today",
        completionNumber: null,
      }),
      buildCompletionDayProgress({
        day: "Thu",
        dayType: "future",
        completionNumber: null,
      }),
      buildCompletionDayProgress({
        day: "Fri",
        dayType: "future",
        completionNumber: null,
      }),
      buildCompletionDayProgress({
        day: "Sat",
        dayType: "future",
        completionNumber: null,
      }),
    ],
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 6 — Dec 12",
    weekFraction: "2/4",
    completionsLoggedThisWeek: 0,
    targetCompletions: 3,
    streakDays: 0,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: [
      buildCompletionDayProgress({
        day: "Sun",
        dayType: "past",
        completionNumber: 2,
        fullJuzRanges: [{ start: 5, end: 7 }],
      }),
      buildCompletionDayProgress({
        day: "Mon",
        dayType: "past",
        completionNumber: 2,
        partialJuz: [8],
      }),
      buildCompletionDayProgress({
        day: "Tue",
        dayType: "today",
        completionNumber: null,
      }),
      buildCompletionDayProgress({
        day: "Wed",
        dayType: "future",
        completionNumber: null,
      }),
      buildCompletionDayProgress({
        day: "Thu",
        dayType: "future",
        completionNumber: null,
      }),
      buildCompletionDayProgress({
        day: "Fri",
        dayType: "future",
        completionNumber: null,
      }),
      buildCompletionDayProgress({
        day: "Sat",
        dayType: "future",
        completionNumber: null,
      }),
    ],
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 13 — Dec 19",
    weekFraction: "3/4",
    completionsLoggedThisWeek: 0,
    targetCompletions: 3,
    streakDays: 0,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: Array.from({ length: 7 }, (_, index) =>
      buildCompletionDayProgress({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
        dayType: "future",
        completionNumber: null,
      }),
    ),
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 20 — Dec 26",
    weekFraction: "4/4",
    completionsLoggedThisWeek: 0,
    targetCompletions: 3,
    streakDays: 0,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: Array.from({ length: 7 }, (_, index) =>
      buildCompletionDayProgress({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
        dayType: "future",
        completionNumber: null,
      }),
    ),
  }),
];

export function getQuranCompletionCycleSummary(): QuranCompletionCycleSummary {
  return {
    weeks: MOCK_COMPLETION_WEEKS,
    activeWeekIndex: 0,
  };
}

export function clampCompletionWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), MOCK_COMPLETION_WEEKS.length - 1);
}

export function canNavigateCompletionWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < MOCK_COMPLETION_WEEKS.length - 1;
}

export function getQuranCompletionWeekSummary(
  weekIndex?: number,
): QuranCompletionWeekSummary {
  const cycle = getQuranCompletionCycleSummary();
  const index = clampCompletionWeekIndex(weekIndex ?? cycle.activeWeekIndex);
  return cycle.weeks[index];
}

export function getCompletionDayRingColor(
  hasActivity: boolean,
  dayType: QuranRecitationDayType,
): string {
  if (hasActivity) {
    return Colors.light.green;
  }

  return Colors.light.calendarBg;
}
