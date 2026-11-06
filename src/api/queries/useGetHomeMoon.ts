import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { HomeMoonCard } from "./useGetDashboardDataForDate";

export type HomeMoonCycle = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dayNumber: number;
  daysLeft: number;
  rangeLabel: string;
  hijriRangeLabel: string;
};

export type HomeMoonNavigation = {
  isCurrent: boolean;
  previousCycleId: string | null;
  nextCycleId: string | null;
};

export type HomeMoonStatBucket = {
  label: string;
  value: number;
};

export type HomeMoonCategory = {
  category: string;
  label: string;
  goalsLabel: string;
  completedPct: number;
  tier: string;
  notStarted: HomeMoonStatBucket;
  inProgress: HomeMoonStatBucket;
  completed: HomeMoonStatBucket;
};

export type HomeMoonData = {
  cycle: HomeMoonCycle;
  navigation: HomeMoonNavigation;
  moonCard: HomeMoonCard;
  committedTitle: string;
  message: string;
  categories: HomeMoonCategory[];
};

export const homeMoonQueryKey = (date: string) =>
  ["home", "moon", date] as const;

const getHomeMoon = async (date: string): Promise<HomeMoonData> => {
  const response = await api.get(`api/home/moon`, {
    params: { date },
  });
  return response.data?.data ?? response.data;
};

export const useGetHomeMoon = (
  date: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: homeMoonQueryKey(date),
    queryFn: () => getHomeMoon(date),
    enabled: (options?.enabled ?? true) && Boolean(date?.trim()),
  });
};
