import { api } from "..";
import { useQuery } from "@tanstack/react-query";

export type DayStreakStat = {
  value: string | number;
  label: string;
};

export type DayStreakWeekDay = {
  date: string;
  label: string;
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
};

export type DayStreakThisWeek = {
  label: string;
  days: DayStreakWeekDay[];
};

export type DayStreakMilestone = {
  current: number;
  next: number;
  remainingLabel: string;
  suffix: string;
};

export type DayStreakCard = {
  title: string;
  description: string;
};

export type DayStreakDetailsData = {
  title: string;
  streak: number;
  dayStreakLabel: string;
  started: DayStreakStat;
  top: DayStreakStat;
  max: DayStreakStat;
  thisWeek: DayStreakThisWeek;
  milestone: DayStreakMilestone;
  card: DayStreakCard;
};

export type DayStreakDetailsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: DayStreakDetailsData;
};

const dayStreakDetails = async ({
  date,
}: {
  date: string;
}): Promise<DayStreakDetailsResponse> => {
  try {
    const response = await api.get(`api/home/streak?date=${date}`);
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const useGetDayStreakDetails = (date: string) => {
  return useQuery({
    queryKey: ["dayStreakDetails", date],
    queryFn: () => dayStreakDetails({ date }),
  });
};
