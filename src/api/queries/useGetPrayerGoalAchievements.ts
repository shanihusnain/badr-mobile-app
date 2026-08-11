import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";

export type PrayerAchievementsPeriodCode = "M" | "3M" | "6M";

export type PrayerAchievementsChartItem = {
  weekLabel: string;
  completed: number;
  incomplete: number;
};

export type PrayerAchievementsTimeItem = {
  weekLabel: string;
  minutesSpent: number;
};

export type PrayerGoalAchievementsData = {
  period: PrayerAchievementsPeriodCode | string;
  periodStart: string;
  periodEnd: string;
  activeSlot: string;
  achievementPct: number;
  previousPeriodPct: number;
  delta: number;
  goal: number;
  completedCount: number;
  incompleteCount: number;
  chartData: PrayerAchievementsChartItem[];
  timeData: PrayerAchievementsTimeItem[];
  totalMinutesSpent: number;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
};

export const PAST_ACHIEVEMENT_PERIOD_TO_API: Record<
  PastAchievementPeriod,
  PrayerAchievementsPeriodCode
> = {
  monthly: "M",
  threeMonths: "3M",
  sixMonths: "6M",
};

const getPrayerGoalAchievements = async (
  prayerType: string,
  period: PrayerAchievementsPeriodCode,
  periodStart?: string | null,
): Promise<PrayerGoalAchievementsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/prayer-goals/${prayerType}/achievements`,
    {
      params: {
        period,
        ...(periodStart ? { periodStart } : {}),
      },
    },
  );
  return response.data?.data ?? null;
};

export const useGetPrayerGoalAchievements = (
  prayerTypeInput: string | null | undefined,
  options: {
    period: PastAchievementPeriod;
    periodStart?: string | null;
    enabled?: boolean;
  },
) => {
  const prayerType = prayerTypeInput ? resolvePrayerType(prayerTypeInput) : "";
  const periodCode = PAST_ACHIEVEMENT_PERIOD_TO_API[options.period];
  const periodStart = options.periodStart ?? null;
  const enabled = !!prayerType && (options.enabled ?? true);

  return useQuery({
    queryKey: [
      "prayer-goal-achievements",
      prayerType,
      periodCode,
      periodStart ?? "latest",
    ],
    queryFn: () =>
      getPrayerGoalAchievements(prayerType, periodCode, periodStart),
    enabled,
  });
};
