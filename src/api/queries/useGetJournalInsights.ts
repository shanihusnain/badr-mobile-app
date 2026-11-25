import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
    badge: {
      direction: "UP" | "DOWN" | (string & {});
      changePct: number;
      label: string;
    } | null;
    behaviorCount: number;
    completedDays: number;
    trackedDays: number;
    hasComparison: boolean;
  };
  categories: JournalInsightsCategory[];
  /**
   * Present when the user has not customized journal behaviors yet.
   * Same null-hide pattern as home `customizeJournalCard`.
   */
  customizeJournalCard?: {
    title?: string | null;
    description?: string | null;
    subtitle?: string | null;
    body?: string | null;
    button?: string | null;
    cta?: string | null;
  } | null;
  /** Present when customized — “add more behaviors” CTA. */
  addBehaviorsCard?: {
    title: string;
    body: string;
    cta: string;
  } | null;
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
    // Keep prior period on screen so consistency % / habit rings show loading
    // placeholders instead of unmounting while W/M/3M/6M refetch.
    placeholderData: keepPreviousData,
  });
};
