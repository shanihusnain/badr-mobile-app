import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type HabitDetailDayStatus =
  | "DONE"
  | "MISSED"
  | "NOT_STARTED"
  | "PARTIAL"
  | (string & {});

export type HabitDetailDay = {
  date: string;
  weekday: string;
  dayOfMonth: number;
  status: HabitDetailDayStatus;
};

export type HabitDetailBehavior = {
  behaviorId: string;
  title: string;
  summary: string;
  displayOrder: number;
  completedDays: number;
  tier?: string;
  /** Present for weekly windows; null for M / 3M / 6M. */
  days: HabitDetailDay[] | null;
};

export type HabitDetailData = {
  period: string;
  category: string;
  title: string;
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
    behaviorCount: number;
  };
  headline: string;
  message: string;
  behaviors: HabitDetailBehavior[];
};

const getHabitDetail = async (
  habitCategory: string,
  period: string,
  endDate: string,
): Promise<HabitDetailData> => {
  const response = await api.get(
    `api/journal/insights/categories/${habitCategory}`,
    {
      params: {
        period,
        endDate: endDate.trim(),
      },
    },
  );
  return response.data?.data;
};

export const useGetHabitDetail = (
  habitCategory: string,
  period: string,
  endDate: string,
) => {
  const trimmedEndDate = endDate.trim();

  return useQuery({
    queryKey: ["habit-detail", habitCategory, period, trimmedEndDate],
    queryFn: () => getHabitDetail(habitCategory, period, trimmedEndDate),
    enabled: Boolean(habitCategory && period && trimmedEndDate),
  });
};
