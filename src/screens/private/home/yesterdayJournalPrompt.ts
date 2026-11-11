import type { HomeJournalCard } from "@/src/api/queries/useGetDashboardDataForDate";
import {
  addDays,
  parseDateKey,
  toDateKey,
} from "@/src/screens/private/journalfilling/journalFillingDateUtils";

export type YesterdayJournalPrompt = {
  /** Date to open in journal filling (YYYY-MM-DD). */
  date: string;
};

/**
 * Backend `journalCard` is source of truth for journal opt-in.
 * Show the "what happened yesterday" prompt when the user has journaling
 * set up and yesterday is not logged.
 */
export function resolveYesterdayJournalPrompt(
  journalCard: HomeJournalCard | null | undefined,
  todayKey: string,
): YesterdayJournalPrompt | null {
  if (!journalCard) return null;

  const today = parseDateKey(todayKey);
  if (Number.isNaN(today.getTime())) return null;

  const yesterdayKey = toDateKey(addDays(today, -1));
  const week = Array.isArray(journalCard.week) ? journalCard.week : [];
  const yesterdayInWeek = week.find(
    (day) => typeof day?.date === "string" && day.date.trim() === yesterdayKey,
  );

  if (yesterdayInWeek) {
    if (yesterdayInWeek.isFuture || yesterdayInWeek.logged) return null;
    return { date: yesterdayKey };
  }

  // Fallback when week omits yesterday: journalDate + filledToday from API.
  const journalDate = journalCard.journalDate?.trim() ?? "";
  if (!journalCard.filledToday && journalDate === yesterdayKey) {
    return { date: yesterdayKey };
  }

  return null;
}
