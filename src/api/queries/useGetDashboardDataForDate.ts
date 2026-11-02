import { api } from "..";
import { useQuery } from "@tanstack/react-query";

export type HomeDashboardHeader = {
  isToday: boolean;
  dateLabel: string;
  streak: number;
  avatarName: string;
};

export type HomePrayerTimelineItem = {
  key: string;
  label: string;
  time: string;
  passed: boolean;
};

export type HomePrayerTimesCard = {
  upcomingLabel: string;
  upcoming: {
    key: string;
    name: string;
    time: string;
  } | null;
  hijriDate: string;
  gregorianDate: string;
  timeline: HomePrayerTimelineItem[];
};

export type HomeDashboardCategory = {
  category: string;
  label: string;
  totalGoals: number;
  completedPct: number;
  tier: string;
};

export type HomeGreetingCard = {
  title: string;
  description: string;
};

export type HomeMoonCard = {
  daysLeftLabel: string;
  dayLabel: string;
  day: number;
  overallProgressLabel: string;
  overallPct: number;
  phase: string;
};

export type HomeDailyContentItem = {
  type: string;
  title: string;
  /** Full body — quote + trailing reference in parentheses when present. */
  text: string;
};

export type HomeDashboardData = {
  date: string;
  header: HomeDashboardHeader;
  prayerTimesCard?: HomePrayerTimesCard | null;
  categories?: HomeDashboardCategory[] | null;
  greetingCard?: HomeGreetingCard | null;
  moonCard?: HomeMoonCard | null;
  dailyContent?: HomeDailyContentItem[] | null;
  /** Remaining payload keys left for later wiring steps. */
  [key: string]: unknown;
};

const getDashboardDataForDate = async (
  date: string,
): Promise<HomeDashboardData> => {
  const response = await api.get(`api/home`, {
    params: {
      date, // YYYY-MM-DD — same date selected in the home header
    },
  });
  return response.data?.data ?? response.data;
};

export const useGetDashboardDataForDate = (date: string) => {
  return useQuery({
    queryKey: ["dashboard-data-for-date", date],
    queryFn: () => getDashboardDataForDate(date),
    enabled: Boolean(date?.trim()),
  });
};
