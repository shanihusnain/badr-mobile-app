import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type JournalCalendarDayItem = {
  date: string;
  answeredCount: number;
  completedCount: number;
  isComplete: boolean;
};

export type JournalCalendarData = {
  from: string;
  to: string;
  selectedBehaviorCount: number;
  days: JournalCalendarDayItem[];
};

export const JOURNAL_CALENDAR_QUERY_KEY = "journal-calendar" as const;

export function journalCalendarQueryKey(from: string, to: string) {
  return [JOURNAL_CALENDAR_QUERY_KEY, from, to] as const;
}

export const getJournalCalendar = async (
  from: string,
  to: string,
): Promise<JournalCalendarData> => {
  const response = await api.get("api/journal/calendar", {
    params: {
      from: from.trim().slice(0, 10),
      to: to.trim().slice(0, 10),
    },
  });
  return response.data?.data;
};

export const useGetJournalCalendar = (
  from: string,
  to: string,
  options?: { enabled?: boolean },
) => {
  const trimmedFrom = from.trim().slice(0, 10);
  const trimmedTo = to.trim().slice(0, 10);

  return useQuery({
    queryKey: journalCalendarQueryKey(trimmedFrom, trimmedTo),
    queryFn: () => getJournalCalendar(trimmedFrom, trimmedTo),
    enabled:
      (options?.enabled ?? true) && Boolean(trimmedFrom) && Boolean(trimmedTo),
  });
};
