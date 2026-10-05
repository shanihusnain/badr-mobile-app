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
const MOTIVATIONAL_QUOTE_WEEK2_KEY = "progressLogging.quranJuzWeekQuoteWeek2";
const MOTIVATIONAL_QUOTE_WEEK3_KEY = "progressLogging.quranJuzWeekQuoteWeek3";
const MOTIVATIONAL_QUOTE_COMPLETE_KEY =
  "progressLogging.quranJuzWeekQuoteComplete";

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

/**
 * Pack / Figma Revision 7 baselines for RECITATION_JUZ AGGREGATE week strip:
 * Mon j5 · Wed BEST DAY! j6-7 · Fri j8* · 3.4 juz completed this week.
 */
const MOCK_JUZ_WEEKS: QuranCompletionWeekSummary[] = [
  finalizeWeek({
    weekRangeLabel: "Nov 29 — Dec 5",
    weekFraction: "1/4",
    completionsLoggedThisWeek: 3,
    juzCompletedThisWeek: 3.4,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 1,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_KEY,
    vsLastWeek: null,
    weekDays: [
      buildJuzDayProgress({
        day: "Sun",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Mon",
        dayType: "past",
        logSequenceNumber: 1,
        fullJuzRanges: [{ start: 5, end: 5 }],
      }),
      buildJuzDayProgress({
        day: "Tue",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Wed",
        dayType: "past",
        logSequenceNumber: 2,
        fullJuzRanges: [{ start: 6, end: 7 }],
      }),
      buildJuzDayProgress({
        day: "Thu",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Fri",
        dayType: "past",
        logSequenceNumber: 3,
        partialJuz: [8],
      }),
      buildJuzDayProgress({
        day: "Sat",
        dayType: "today",
        logSequenceNumber: null,
      }),
    ],
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 6 — Dec 12",
    weekFraction: "2/4",
    completionsLoggedThisWeek: 2,
    juzCompletedThisWeek: 2.6,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 0,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_WEEK2_KEY,
    vsLastWeek: -0.8,
    weekDays: [
      buildJuzDayProgress({
        day: "Sun",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Mon",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Tue",
        dayType: "past",
        logSequenceNumber: 4,
        fullJuzRanges: [{ start: 9, end: 9 }],
      }),
      buildJuzDayProgress({
        day: "Wed",
        dayType: "past",
        logSequenceNumber: 5,
        fullJuzRanges: [{ start: 8, end: 10 }],
      }),
      buildJuzDayProgress({
        day: "Thu",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Fri",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Sat",
        dayType: "today",
        logSequenceNumber: null,
      }),
    ],
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 13 — Dec 19",
    weekFraction: "3/4",
    completionsLoggedThisWeek: 3,
    juzCompletedThisWeek: 2,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 3,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_WEEK3_KEY,
    vsLastWeek: -0.6,
    weekDays: [
      buildJuzDayProgress({
        day: "Sun",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Mon",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Tue",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Wed",
        dayType: "past",
        logSequenceNumber: 6,
        fullJuzRanges: [{ start: 11, end: 11 }],
      }),
      buildJuzDayProgress({
        day: "Thu",
        dayType: "past",
        logSequenceNumber: 7,
        partialJuz: [12],
      }),
      buildJuzDayProgress({
        day: "Fri",
        dayType: "past",
        logSequenceNumber: 8,
        partialJuz: [12],
      }),
      buildJuzDayProgress({
        day: "Sat",
        dayType: "today",
        logSequenceNumber: null,
      }),
    ],
  }),
  finalizeWeek({
    weekRangeLabel: "Dec 20 — Dec 26",
    weekFraction: "4/4",
    completionsLoggedThisWeek: 1,
    juzCompletedThisWeek: 1,
    targetCompletions: getJuzRecitationProgress().targetJuzCount,
    streakDays: 1,
    motivationalQuoteKey: MOTIVATIONAL_QUOTE_COMPLETE_KEY,
    vsLastWeek: -1,
    weekDays: [
      buildJuzDayProgress({
        day: "Sun",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Mon",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Tue",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Wed",
        dayType: "past",
        logSequenceNumber: 9,
        fullJuzRanges: [{ start: 13, end: 13 }],
      }),
      buildJuzDayProgress({
        day: "Thu",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Fri",
        dayType: "past",
        logSequenceNumber: null,
      }),
      buildJuzDayProgress({
        day: "Sat",
        dayType: "today",
        logSequenceNumber: null,
      }),
    ],
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
  const activeWeekIndex = getQuranJuzCycleSummary().activeWeekIndex;
  return weekIndex < activeWeekIndex;
}

export function getQuranJuzWeekSummary(
  weekIndex?: number,
): QuranCompletionWeekSummary {
  const cycle = getQuranJuzCycleSummary();
  const index = clampJuzWeekIndex(weekIndex ?? cycle.activeWeekIndex);
  return cycle.weeks[index];
}
