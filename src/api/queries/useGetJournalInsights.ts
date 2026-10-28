import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type JournalInsightsCategory = {
  key: string;
  title: string;
  pct: number;
  tier: string;
  behaviorCount: number;
};

export type JournalInsightsData = {
  period: string;
  intro: string;
  window: {
    startDate: string;
    endDate: string;
    label: string;
  };
  navigation: {
    previousEndDate: string | null;
    nextEndDate: string | null;
  };
  consistency: {
    pct: number;
    tier: string;
    badge: string | null;
    behaviorCount: number;
    completedDays: number;
    trackedDays: number;
    hasComparison: boolean;
  };
  categories: JournalInsightsCategory[];
  addBehaviorsCard?: {
    title: string;
    body: string;
    cta: string;
  };
};

const getJournalInsights = async (
  period: string,
  endDate: string,
): Promise<JournalInsightsData> => {
  const response = await api.get("api/journal/insights", {
    params: {
      period,
      endDate: endDate.trim(),
    },
  });

  return response.data?.data;
};

export const useGetJournalInsights = (period: string, endDate: string) => {
  const trimmedEndDate = endDate.trim();

  return useQuery({
    queryKey: ["journalInsights", period, trimmedEndDate],
    queryFn: () => getJournalInsights(period, trimmedEndDate),
    enabled: Boolean(period && trimmedEndDate),
  });
};
