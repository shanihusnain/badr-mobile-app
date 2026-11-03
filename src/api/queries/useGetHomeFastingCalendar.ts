import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type HomeFastingCalendarTab = {
  key: string;
  label: string;
};

export type HomeFastingCalendarView = {
  key: string;
  label: string;
};

export type HomeFastingCalendarStat = {
  label: string;
  value: number;
  unit: string;
};

export type HomeFastingCalendarMark = {
  fastingType: string;
  status: string;
  name: string;
  label: string;
  description: string;
};

export type HomeFastingCalendarLegendItem = {
  key: string;
  label: string;
  plannedLabel?: string;
  completedLabel?: string;
  color?: string;
};

export type HomeFastingCalendarDay = {
  date: string;
  day: number;
  hijriDay: number;
  isToday: boolean;
  mark: HomeFastingCalendarMark | string | null;
};

export type HomeFastingCalendarData = {
  title: string;
  description: string;
  introDismissed: boolean;
  legendDismissed: boolean;
  hasCalendar: boolean;
  tabs: HomeFastingCalendarTab[];
  tab: string;
  views: HomeFastingCalendarView[];
  view: string;
  goal: HomeFastingCalendarStat;
  completed: HomeFastingCalendarStat;
  rangeLabel: string;
  hijriRangeLabel: string;
  legend: HomeFastingCalendarLegendItem[];
  weekdays: string[];
  leadingBlankDays: number;
  days: HomeFastingCalendarDay[];
  footnote: string | null;
};

const getHomeFastingCalendar = async (
  tab: string,
  view: string,
  date: string,
): Promise<HomeFastingCalendarData> => {
  const response = await api.get(`api/home/fasting-calendar`, {
    params: { tab, view, date },
  });
  return response.data?.data ?? response.data;
};

export const useGetHomeFastingCalendar = (
  tab: string,
  view: string,
  date: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["home", "fasting-calendar", tab, view, date],
    queryFn: () => getHomeFastingCalendar(tab, view, date),
    enabled: (options?.enabled ?? true) && Boolean(tab && view && date),
  });
};
