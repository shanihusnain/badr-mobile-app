import type { QuranRecitationDayType } from "./quranRecitationWeeklyData";
import { getJuzRecitationProgress } from "./quranRecitationJuzData";
import {
  applyCompletionBestDayFlags,
  buildCompletionDayLabel,
  buildCompletionDayProgress,
  type CompletionJuzRange,
  type QuranCompletionCycleSummary,
  type QuranCompletionDayProgress,
  type QuranCompletionWeekSummary,
} from "./quranRecitationCompletionWeeklyData";

export type {
  QuranCompletionDayProgress as QuranJuzDayProgress,
  QuranCompletionWeekSummary as QuranJuzWeekSummary,
  QuranCompletionCycleSummary as QuranJuzCycleSummary,
};

export {
  applyCompletionBestDayFlags,
  buildCompletionDayLabel,
  getCompletionDayRingColor,
} from "./quranRecitationCompletionWeeklyData";

const MOTIVATIONAL_QUOTE_KEY = "progressLogging.quranJuzWeekQuote";

/** Deduplicate partial juz numbers so repeated logs show once (e.g. J5*). */
export function dedupePartialJuz(partialJuz: number[]): number[] {
  return [...new Set(partialJuz)];
}

export function buildJuzDayProgress(input: {
  day: string;
  dayType: QuranRecitationDayType;
  logSequenceNumber: number | null;
  fullJuzRanges?: CompletionJuzRange[];
  partialJuz?: number[];
}): QuranCompletionDayProgress {
  return buildCompletionDayProgress({
    day: input.day,
    dayType: input.dayType,
    completionNumber: input.logSequenceNumber,
    fullJuzRanges: input.fullJuzRanges,
    partialJuz: dedupePartialJuz(input.partialJuz ?? []),
  });
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

const MOCK_JUZ_WEEKS: QuranCompletionWeekSummary[] = [
  finalizeWeek({
    weekRangeLabel: "Nov 29 — Dec 5",
    weekFraction: "1/4",
    completionsLoggedThisWeek: 4,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 2,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: [
      buildJuzDayProgress({
        day: "Sun",
        dayType: "past",
        logSequenceNumber: 1,
        fullJuzRanges: [{ start: 1, end: 2 }],
      }),
      buildJuzDayProgress({
        day: "Mon",
        dayType: "past",
        logSequenceNumber: 2,
        partialJuz: [3],
      }),
      buildJuzDayProgress({
        day: "Tue",
        dayType: "past",
        logSequenceNumber: 3,
        fullJuzRanges: [{ start: 22, end: 23 }],
        partialJuz: [4],
      }),
      buildJuzDayProgress({
        day: "Wed",
        dayType: "today",
        logSequenceNumber: 4,
        partialJuz: [5, 5],
      }),
      buildJuzDayProgress({
        day: "Thu",
        dayType: "future",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Fri",
        dayType: "future",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Sat",
        dayType: "future",
        logSequenceNumber: null,
      }),
    ],
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 6 — Dec 12",
    weekFraction: "2/4",
    completionsLoggedThisWeek: 2,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 1,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: [
      buildJuzDayProgress({
        day: "Sun",
        dayType: "past",
        logSequenceNumber: 4,
        fullJuzRanges: [{ start: 5, end: 7 }],
      }),
      buildJuzDayProgress({
        day: "Mon",
        dayType: "past",
        logSequenceNumber: 5,
        partialJuz: [8, 8],
      }),
      buildJuzDayProgress({
        day: "Tue",
        dayType: "today",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Wed",
        dayType: "future",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Thu",
        dayType: "future",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Fri",
        dayType: "future",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Sat",
        dayType: "future",
        logSequenceNumber: null,
      }),
    ],
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 13 — Dec 19",
    weekFraction: "3/4",
    completionsLoggedThisWeek: 0,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 0,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: Array.from({ length: 7 }, (_, index) =>
      buildJuzDayProgress({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
        dayType: "future",
        logSequenceNumber: null,
      }),
    ),
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 20 — Dec 26",
    weekFraction: "4/4",
    completionsLoggedThisWeek: 0,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 0,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    weekDays: Array.from({ length: 7 }, (_, index) =>
      buildJuzDayProgress({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
        dayType: "future",
        logSequenceNumber: null,
      }),
    ),
  }),
];

export function getQuranJuzCycleSummary(): QuranCompletionCycleSummary {
  return {
    weeks: MOCK_JUZ_WEEKS,
    activeWeekIndex: 0,
  };
}

export function clampJuzWeekIndex(weekIndex: number): number {
  return Math.min(Math.max(weekIndex, 0), MOCK_JUZ_WEEKS.length - 1);
}

export function canNavigateJuzWeek(
  weekIndex: number,
  direction: "prev" | "next",
): boolean {
  if (direction === "prev") return weekIndex > 0;
  return weekIndex < MOCK_JUZ_WEEKS.length - 1;
}

export function getQuranJuzWeekSummary(
  weekIndex?: number,
): QuranCompletionWeekSummary {
  const cycle = getQuranJuzCycleSummary();
  const index = clampJuzWeekIndex(weekIndex ?? cycle.activeWeekIndex);
  return cycle.weeks[index];
}
