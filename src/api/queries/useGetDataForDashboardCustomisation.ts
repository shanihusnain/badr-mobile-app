import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export const DashboardCategoryType = {
  ALL: "ALL",
  PRAYER: "PRAYER",
  QURAN: "QURAN",
  FASTING: "FASTING",
  SADAQAH: "SADAQAH",
  TIME_SPENT: "TIME_SPENT",
} as const;

export type DashboardApiTab =
  (typeof DashboardCategoryType)[keyof typeof DashboardCategoryType];

export type DashboardCustomizeTab = {
  key: DashboardApiTab | string;
  label: string;
};

export type DashboardCustomizeWidgetKind =
  | "GOAL"
  | "FASTING_CALENDAR"
  | "TIME_SPENT"
  | string;

export type DashboardCustomizeWidget = {
  key: string;
  kind: DashboardCustomizeWidgetKind;
  category: string | null;
  goalType: string | null;
  name: string;
  progressLabel: string | null;
  completedPct: number | null;
  tier: string | null;
};

export type DashboardCustomizeData = {
  title: string;
  subtitle?: string;
  tabs: DashboardCustomizeTab[];
  tab: DashboardApiTab | string;
  myDashboard: DashboardCustomizeWidget[];
  addSectionTitle?: string;
  addToMyDashboard: DashboardCustomizeWidget[];
  saveLabel?: string;
  savingLabel?: string;
  savedLabel?: string;
};

export const dashboardCustomisationQueryKey = (
  tab: DashboardApiTab | string,
) => ["home", "dashboard", "customize", tab] as const;

const getDashboardCustomisationData = async (
  tab: DashboardApiTab | string,
): Promise<DashboardCustomizeData | null> => {
  try {
    const response = await api.get(`api/home/dashboard/customize`, {
      params: { tab },
    });
    return response.data?.data ?? response.data ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const useGetDashboardCustomisationData = (
  tab: DashboardApiTab | string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: dashboardCustomisationQueryKey(tab),
    queryFn: () => getDashboardCustomisationData(tab),
    enabled: (options?.enabled ?? true) && Boolean(tab),
  });
};
