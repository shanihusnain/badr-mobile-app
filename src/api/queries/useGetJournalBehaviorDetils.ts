import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type BehaviorDetailDayStatus =
  | "DONE"
  | "MISSED"
  | "NOT_STARTED"
  | "PARTIAL"
  | (string & {});

export type BehaviorDetailApiDay = {
  date: string;
  weekday: string;
  dayOfMonth: number;
  status: BehaviorDetailDayStatus;
};

export type BehaviorDetailChartPoint = {
  startDate: string;
  endDate: string;
  label: string;
  completedDays: number;
};

export type BehaviorDetailContentBlockType =
  | "PARAGRAPH"
  | "HADITH"
  | "QURAN"
  | "HEADING"
  | "BULLET"
  | (string & {});

export type BehaviorDetailContentBlock = {
  type: BehaviorDetailContentBlockType;
  text: string;
};

export type BehaviorDetailStreakInfo = {
  count: number;
  tier: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
};

export type BehaviorDetailApiData = {
  behaviorId: string;
  title: string;
  image?: {
    key: string;
    url: string;
    blurhash?: string | null;
  } | null;
  category: string;
  categoryTitle: string;
  isTracked: boolean;
  period: string;
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
    completedDays: number;
    trackedDays: number;
    hasComparison: boolean;
    badge: string | null;
  };
  message: string;
  /** Present for weekly windows; null for M / 3M / 6M. */
  days: BehaviorDetailApiDay[] | null;
  /** Present for M / 3M / 6M; null for weekly. */
  chart: BehaviorDetailChartPoint[] | null;
  streaks: {
    current: BehaviorDetailStreakInfo;
    longest: BehaviorDetailStreakInfo;
  };
  impact: {
    title: string;
    blocks: BehaviorDetailContentBlock[];
  };
  recommendations: {
    title: string;
    blocks: BehaviorDetailContentBlock[];
  };
};

const getJournalBehaviorDetils = async (
  behaviorId: string,
  period: string,
  endDate: string,
): Promise<BehaviorDetailApiData> => {
  const response = await api.get(
    `api/journal/insights/behaviors/${behaviorId}`,
    {
      params: {
        period,
        endDate: endDate.trim(),
      },
    },
  );
  return response.data?.data;
};

export const useGetJournalBehaviorDetils = (
  behaviorId: string,
  period: string,
  endDate: string,
) => {
  const trimmedEndDate = endDate.trim();

  return useQuery({
    queryKey: ["journal-behavior-details", behaviorId, period, trimmedEndDate],
    queryFn: () => getJournalBehaviorDetils(behaviorId, period, trimmedEndDate),
    enabled: Boolean(behaviorId && period && trimmedEndDate),
  });
};
