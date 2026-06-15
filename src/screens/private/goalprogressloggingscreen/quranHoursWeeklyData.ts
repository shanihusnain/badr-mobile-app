import { QuranHoursGoalId } from "./types";

export type QuranHoursDayProgress = {
  day: string;
  /** Total minutes logged that day. 0 = no time label. */
  minutesLogged: number;
  /** Show filled green circle without a duration (e.g. logged but time not tracked). */
  isLogged?: boolean;
  isBestDay?: boolean;
  /** When false, duration is hidden even if minutesLogged > 0. */
  showDurationLabel?: boolean;
};

export type QuranHoursWeekSummary = {
  weekDays: QuranHoursDayProgress[];
  weekRangeLabel: string;
  weekFraction: string;
  totalMinutesThisWeek: number;
  streakDays: number;
  motivationalQuoteKey: string;
};

const LISTENING_WEEK: QuranHoursWeekSummary = {
  weekFraction: "1/4",
  weekRangeLabel: "Nov 29 — Dec 5",
  totalMinutesThisWeek: 8 * 60 + 55,
  streakDays: 2,
  motivationalQuoteKey: "progressLogging.quranListeningWeekQuote",
  weekDays: [
    { day: "Sun", minutesLogged: 100 },
    { day: "Mon", minutesLogged: 0, isLogged: true, showDurationLabel: false },
    { day: "Tue", minutesLogged: 0 },
    { day: "Wed", minutesLogged: 0 },
    { day: "Thu", minutesLogged: 150 },
    { day: "Fri", minutesLogged: 285, isBestDay: true },
    { day: "Sat", minutesLogged: 0 },
  ],
};

const TAJWEED_WEEK: QuranHoursWeekSummary = {
  weekFraction: "1/4",
  weekRangeLabel: "Nov 29 — Dec 5",
  totalMinutesThisWeek: 4 * 60 + 10,
  streakDays: 1,
  motivationalQuoteKey: "progressLogging.quranTajweedWeekQuote",
  weekDays: [
    { day: "Sun", minutesLogged: 0 },
    { day: "Mon", minutesLogged: 45 },
    { day: "Tue", minutesLogged: 60 },
    { day: "Wed", minutesLogged: 150, isBestDay: true },
    { day: "Thu", minutesLogged: 55 },
    { day: "Fri", minutesLogged: 0 },
    { day: "Sat", minutesLogged: 0 },
  ],
};

export function getQuranHoursWeekSummary(
  goalId: QuranHoursGoalId,
): QuranHoursWeekSummary {
  return goalId === "quran-Tajweed" ? TAJWEED_WEEK : LISTENING_WEEK;
}

export function formatDayDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

export function formatWeeklyHoursTotal(totalMinutes: number): {
  hours: number;
  minutes: number;
} {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}
