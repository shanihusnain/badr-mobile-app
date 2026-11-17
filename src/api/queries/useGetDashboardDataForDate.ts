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

export type HomeJournalWeekDay = {
  date: string;
  dayLabel: string;
  dayNumber: number;
  logged: boolean;
  isSelected: boolean;
  /** Optional — API may omit for past/current days. */
  isFuture?: boolean;
};

export type HomeJournalCard = {
  title: string;
  journalDate: string;
  filledToday: boolean;
  button: string;
  week: HomeJournalWeekDay[];
};

/** Prompts user to set up journal behaviors — hide home block when null. */
export type HomeCustomizeJournalCard = {
  title?: string | null;
  description?: string | null;
  subtitle?: string | null;
  button?: string | null;
};

export type HomeObligatoryPrayerSlot = {
  logged?: boolean;
  prayedOnTime?: boolean;
  wasCongregational?: boolean;
  wasQadha?: boolean;
  isAutoQadha?: boolean;
  isMenstruationSlot?: boolean;
  message?: string | null;
};

export type HomeObligatoryPrayerDay = {
  date: string;
  dayLabel: string;
  slotsOnTime?: number;
  slotsQadha?: number;
  slotsAutoQadha?: number;
  totalLogged?: number;
  allFiveOnTime?: boolean;
  hasQadha?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
  isFutureDay?: boolean;
  isJumuahDay?: boolean;
  hasActivity?: boolean;
  isMenstruationDay?: boolean;
  slots?: Partial<
    Record<
      "FAJR" | "DHUHR" | "ASR" | "MAGHRIB" | "ISHA",
      HomeObligatoryPrayerSlot
    >
  >;
};

export type HomeObligatoryPrayersCard = {
  weekNumber: number;
  totalWeeks: number;
  weekStart: string;
  weekEnd: string;
  weekLabel?: string | null;
  days: HomeObligatoryPrayerDay[];
  thisWeekOnTime?: number;
  onTimeLabel?: string | null;
  currentStreak?: number;
  streakLabel?: string | null;
  motivationalMessage?: string | null;
  vsLastWeek?: number | null;
};

/** Five Daily Prayers block on home — hide when null. */
export type HomeObligatoryPrayers = {
  title?: string | null;
  addButton?: string | null;
  emptyText?: string | null;
  hasGoal?: boolean;
  card?: HomeObligatoryPrayersCard | null;
};

export type HomeDashboardData = {
  date: string;
  header: HomeDashboardHeader;
  prayerTimesCard?: HomePrayerTimesCard | null;
  categories?: HomeDashboardCategory[] | null;
  greetingCard?: HomeGreetingCard | null;
  moonCard?: HomeMoonCard | null;
  dailyContent?: HomeDailyContentItem[] | null;
  journalCard?: HomeJournalCard | null;
  customizeJournalCard?: HomeCustomizeJournalCard | null;
  obligatoryPrayers?: HomeObligatoryPrayers | null;
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
