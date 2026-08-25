import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";

export type PrayerAchievementsPeriodCode = "M" | "3M" | "6M";

/** Legacy chart series (non–five-daily / older payloads). */
export type PrayerAchievementsChartItem = {
  weekLabel: string;
  completed: number;
  incomplete: number;
  completedDeltaPct: number | null;
  hasCycleData?: boolean;
};

export type PrayerAchievementsTimeItem = {
  weekLabel: string;
  minutesSpent: number;
  timeSpentDeltaPct?: number | null;
};

export type FiveDailyOnTimeVsQadhaItem = {
  weekLabel: string;
  bucketStartDate?: string;
  bucketEndDate?: string;
  onTime: number;
  qadha: number;
  incomplete?: number;
  bucketGoal?: number | null;
  hasCycleData?: boolean;
  bucketPct?: number | null;
  completedDeltaPct?: number | null;
  bucketSummaryText?: string | null;
  menstruationDays?: number;
};

export type FiveDailyMosqueVsHomeItem = {
  weekLabel: string;
  bucketStartDate?: string;
  bucketEndDate?: string;
  mosque: number;
  home: number;
  bucketSummaryText?: string | null;
  menstruationDays?: number;
};

export type FiveDailyTimeSpentItem = {
  weekLabel: string;
  bucketStartDate?: string;
  bucketEndDate?: string;
  onTime?: number;
  qadha?: number;
  barLabel?: string;
  minutesSpent: number;
  bucketTimeSpentPct?: number | null;
  timeSpentDeltaPct?: number | null;
  bucketTimeSpentSummaryText?: string | null;
  menstruationDays?: number;
};

export type FiveDailyChartViews = {
  onTimeVsQadha?: FiveDailyOnTimeVsQadhaItem[];
  inMosqueVsHome?: FiveDailyMosqueVsHomeItem[];
  timeSpent?: FiveDailyTimeSpentItem[];
};

export type PrayerAchievementsKeyInsights = {
  activeDaysCount?: number | null;
  activeDaysDelta?: number | null;
  goalTrackedMonths?: number | null;
  goalTrackedDelta?: number | null;
  longestStreak?: number | null;
  longestStreakDelta?: number | null;
  bestDayCount?: number | null;
  bestDay?: number | null;
  personalBest?: number | null;
  bestDayDelta?: number | null;
  personalBestDelta?: number | null;
  weeklyAverage?: number | null;
  weeklyAverageDelta?: number | null;
  monthlyAverage?: number | null;
  monthlyAverageDelta?: number | null;
  timeSpentMinutes?: number | null;
  timeSpentDeltaMinutes?: number | null;
  timeSpentDelta?: number | null;
  periodMadeUpDays?: number | null;
  periodMadeUpDelta?: number | null;
};

export type PrayerGoalAchievementsData = {
  prayerType?: string;
  period: PrayerAchievementsPeriodCode | string;
  periodStart: string;
  periodEnd: string;
  activeSlot?: string;
  achievementPct: number;
  previousPeriodPct: number;
  delta: number | null;
  goal: number;
  completedCount: number;
  incompleteCount: number;
  qadhaCount?: number;
  mosqueCount?: number;
  homeCount?: number;
  /** Legacy series — still used by non–five-daily goals. */
  chartData?: PrayerAchievementsChartItem[];
  timeData?: PrayerAchievementsTimeItem[];
  /** Five-daily (and newer) view-specific chart series. */
  chartViews?: FiveDailyChartViews | null;
  summaryText?: string | null;
  mosqueSummaryText?: string | null;
  timeSpentSummaryText?: string | null;
  totalMinutesSpent: number;
  timeSpentPct?: number | null;
  keyInsights?: PrayerAchievementsKeyInsights | null;
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
  slot?: string | null,
): Promise<PrayerGoalAchievementsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/prayer-goals/${prayerType}/achievements`,
    {
      params: {
        period,
        ...(periodStart ? { periodStart } : {}),
        ...(slot ? { slot } : {}),
      },
    },
  );
  console.log(
    "response of past achievement",
    JSON.stringify(response.data?.data, null, 2),
  );
  return response.data?.data ?? null;
};

export const useGetPrayerGoalAchievements = (
  prayerTypeInput: string | null | undefined,
  options: {
    period: PastAchievementPeriod;
    periodStart?: string | null;
    /** Five-daily filter: all | FAJR | DHUHR | ASR | MAGHRIB | ISHA */
    slot?: string | null;
    enabled?: boolean;
  },
) => {
  const prayerType = prayerTypeInput ? resolvePrayerType(prayerTypeInput) : "";
  const periodCode = PAST_ACHIEVEMENT_PERIOD_TO_API[options.period];
  const periodStart = options.periodStart ?? null;
  const slot = options.slot ?? null;
  const enabled = !!prayerType && (options.enabled ?? true);

  return useQuery({
    queryKey: [
      "prayer-goal-achievements",
      prayerType,
      periodCode,
      periodStart ?? "latest",
      slot ?? "all",
    ],
    queryFn: () =>
      getPrayerGoalAchievements(prayerType, periodCode, periodStart, slot),
    enabled,
  });
};
