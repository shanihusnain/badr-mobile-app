import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type HomeDashboardTabKey =
  | "ALL"
  | "PRAYER"
  | "QURAN"
  | "FASTING"
  | "SADAQAH"
  | string;

export type HomeDashboardTab = {
  key: HomeDashboardTabKey;
  label: string;
};

export type HomeDashboardWidgetKind = "GOAL" | "TIME_SPENT" | string;

export type HomeDashboardWidget = {
  key: string;
  kind: HomeDashboardWidgetKind;
  category: string | null;
  goalType: string | null;
  name: string;
  progressLabel: string | null;
  completedPct: number | null;
  tier: string | null;
};

export type HomeDashboardData = {
  title: string;
  customizeLabel: string;
  tabs: HomeDashboardTab[];
  tab: HomeDashboardTabKey;
  widgets: HomeDashboardWidget[];
  visibleCount: number;
  showMoreLabel: string;
};

const getHomeDashboard = async (
  tab: HomeDashboardTabKey,
): Promise<HomeDashboardData> => {
  const response = await api.get(`api/home/dashboard`, {
    params: { tab },
  });
  return response.data?.data ?? response.data;
};

export const useGetHomeDashboard = (
  tab: HomeDashboardTabKey,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["home", "dashboard", tab],
    queryFn: () => getHomeDashboard(tab),
    enabled: (options?.enabled ?? true) && Boolean(tab),
  });
};
