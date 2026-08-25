import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";

/** Shared + prayer-specific insight stats. Five-daily omits personalBest*; others omit mosque/jumuah. */
export type PrayerGoalInsightsStats = {
  activeDaysCount: number;
  dayGoalCompleted: number | null;
  longestStreak: number;
  weeklyAverage: number;
  timeSpentMinutes: number;
  /** Other prayer goals */
  personalBest?: number;
  personalBestDaysCount?: number;
  /** Five daily prayers */
  allFiveDaysCount?: number;
  mosqueCount?: number;
  /** e.g. "0/2" */
  jumuahFraction?: string;
};

export type PrayerGoalInsightsData = {
  prayerType: string;
  achievementPct: number;
  headline: string;
  body: string;
  motivationalClosing: string;
  stats: PrayerGoalInsightsStats;
};

const getPrayerGoalInsights = async (
  prayerType: string,
): Promise<PrayerGoalInsightsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/prayer-goals/${prayerType}/insights`,
  );
  return response.data?.data ?? null;
};

export const useGetPrayerGoalInsights = (
  prayerTypeInput: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const prayerType = prayerTypeInput ? resolvePrayerType(prayerTypeInput) : "";
  const enabled = !!prayerType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["prayer-goal-insights", prayerType],
    queryFn: () => getPrayerGoalInsights(prayerType),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
