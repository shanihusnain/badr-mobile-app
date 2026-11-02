import type {
  MyDayDetailsData,
  MyDayEntry,
  MyDayFilter,
} from "@/src/api/queries/useGetMyDayDetails";
import type { TodayGoalProgressEntry } from "./todayGoalsProgress";
import {
  DASHBOARD_FILTER_TABS,
  type DashboardFilterTab,
} from "./dashboardSubGoals";

const API_CATEGORY_TO_TAB: Record<string, Exclude<DashboardFilterTab, "All">> =
  {
    PRAYER: "Prayer",
    QURAN: "Quran",
    FASTING: "Fasting",
    SADAQAH: "Sadaqah",
  };

export function mapMyDayCategoryToTab(
  category: string | undefined,
): Exclude<DashboardFilterTab, "All"> | null {
  const key = (category ?? "").trim().toUpperCase();
  return API_CATEGORY_TO_TAB[key] ?? null;
}

export function mapMyDayEntryToProgress(
  entry: MyDayEntry,
): TodayGoalProgressEntry {
  const tab = mapMyDayCategoryToTab(entry.category) ?? "Prayer";
  const timeRange = entry.timeRange;

  return {
    id: entry.id,
    category: tab,
    apiCategory: (entry.category ?? "").toUpperCase(),
    goalTitle: entry.goalName,
    description: entry.line,
    loggedAt: entry.time || undefined,
    duration: timeRange
      ? {
          startTime: timeRange.start || undefined,
          endTime: timeRange.end || undefined,
          label: timeRange.duration || undefined,
        }
      : undefined,
    deleteAction: entry.delete,
  };
}

export function mapMyDayEntries(
  entries: MyDayEntry[] | null | undefined,
): TodayGoalProgressEntry[] {
  if (!entries?.length) return [];
  return [...entries]
    .sort((a, b) => (a.sortMinute ?? 0) - (b.sortMinute ?? 0))
    .map(mapMyDayEntryToProgress);
}

export function resolveMyDayFilters(
  filters: MyDayFilter[] | null | undefined,
): MyDayFilter[] {
  if (filters?.length) return filters;
  return DASHBOARD_FILTER_TABS.filter((tab) => tab !== "Time Spent").map(
    (tab) => ({
      key: tab === "All" ? "ALL" : tab.toUpperCase(),
      label: tab,
    }),
  );
}

export function getVisibleMyDayEntries(
  entries: TodayGoalProgressEntry[],
  selectedFilterKey: string,
): TodayGoalProgressEntry[] {
  const key = selectedFilterKey.trim().toUpperCase();
  if (!key || key === "ALL") return entries;
  return entries.filter(
    (entry) => (entry.apiCategory ?? entry.category).toUpperCase() === key,
  );
}

export function isMyDayHidden(data: MyDayDetailsData | undefined): boolean {
  return Boolean(data?.hidden);
}
