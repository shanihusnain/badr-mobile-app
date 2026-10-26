import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type JournalDayBehaviorStatus = "COMPLETED" | "INCOMPLETE" | null;

export type JournalDayBehavior = {
  behaviorId: string;
  title: string;
  description: string;
  displayOrder: number;
  status: JournalDayBehaviorStatus;
};

export type JournalDayCategory = {
  key: string;
  label: string;
  behaviors: JournalDayBehavior[];
};

export type JournalDayData = {
  date: string;
  totalBehaviors: number;
  answeredCount: number;
  completedCount: number;
  isComplete: boolean;
  note: string;
  lastSavedAt: string | null;
  categories: JournalDayCategory[];
};

export const JOURNAL_DAY_QUERY_KEY = "journal-day" as const;

export function journalDayQueryKey(date: string) {
  return [JOURNAL_DAY_QUERY_KEY, date] as const;
}

export const getJournalDay = async (date: string): Promise<JournalDayData> => {
  const response = await api.get(`api/journal/days/${date}`);
  return response.data?.data;
};

export const useGetJournalDay = (
  date: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: journalDayQueryKey(date),
    queryFn: () => getJournalDay(date),
    enabled: (options?.enabled ?? true) && Boolean(date),
  });
};
