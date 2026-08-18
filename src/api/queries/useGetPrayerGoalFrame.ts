import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";
import type { PrayerGoalFrameStatus } from "@/src/utils/prayerGoalFrameMap";

export type PrayerGoalFrameDay = {
  date: string;
  dayLabel: string;
  count: number;
  isBestDay: boolean;
  isToday: boolean;
  isFuture: boolean;
};

export type PrayerGoalFrameData = {
  prayerType: string;
  title: string;
  imageUrl: string | null;
  goal: {
    targetCount: number;
    completedCount: number;
    achievementPct: number;
    status: PrayerGoalFrameStatus | string;
    label: string;
  };
  cycle: {
    id: string;
    weekNumber: number;
    totalWeeks: number;
    weekStart: string;
    weekEnd: string;
    cycleStart: string;
    cycleEnd: string;
  };
  week: {
    thisWeekTotal: number;
    vsLastWeek: number;
    currentStreak: number;
    motivationalMessage: string;
    days: PrayerGoalFrameDay[];
  };
  articles: unknown[];
};

const getPrayerGoalFrame = async (
  prayerType: string,
  week?: number,
): Promise<PrayerGoalFrameData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/prayer-goals/${prayerType}/frame`,
    {
      params: week != null ? { week } : undefined,
    },
  );
  console.log("response", response.data?.data);
  return response.data?.data ?? null;
};

export const useGetPrayerGoalFrame = (
  prayerTypeInput: string | null | undefined,
  options?: { enabled?: boolean; weekNumber?: number },
) => {
  const prayerType = prayerTypeInput ? resolvePrayerType(prayerTypeInput) : "";
  const enabled = !!prayerType && (options?.enabled ?? true);

  return useQuery({
    queryKey: [
      "prayer-goal-frame",
      prayerType,
      options?.weekNumber ?? "current",
    ],
    queryFn: () => getPrayerGoalFrame(prayerType, options?.weekNumber),
    enabled,
    placeholderData: keepPreviousData,
  });
};
