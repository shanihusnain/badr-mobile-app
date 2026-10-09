import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { PAST_ACHIEVEMENT_PERIOD_TO_API } from "./useGetPrayerGoalAchievements";

export type FastingAchievementsPeriodCode = "M" | "3M" | "6M";

export type FastingAchievementsDelta = {
  direction?: "UP" | "DOWN" | "NEUTRAL" | string;
  pct?: number | null;
  label?: string | null;
} | null;

export type FastingAchievementsBucketNarrative = {
  completion?: string | null;
  time?: string | null;
};

export type FastingAchievementsBucket = {
  number?: number | null;
  start?: string | null;
  end?: string | null;
  label?: string | null;
  goal?: number | null;
  completed?: number | null;
  incomplete?: number | null;
  achievementPct?: number | null;
  achievementDelta?: number | null;
  minutes?: number | null;
  timeLabel?: string | null;
  timeDisplay?: string | null;
  timePct?: number | null;
  timeDelta?: number | null;
  hasData?: boolean | null;
  narrative?: FastingAchievementsBucketNarrative | null;
};

export type FastingAchievementsCalendarDay = {
  date?: string | null;
  dayLabel?: string | null;
  dayOfMonth?: number | null;
  hijriDay?: number | null;
  /** e.g. COMPLETED | MISSED | UPCOMING | EXCUSED */
  marker?: string | null;
  isRunStart?: boolean | null;
};

export type FastingAchievementsKeyInsight = {
  key: string;
  label?: string | null;
  value?: string | number | null;
  unit?: string | null;
  previousLabel?: string | null;
  direction?: "UP" | "DOWN" | "NEUTRAL" | string | null;
  sentiment?: string | null;
};

/**
 * GET api/goal-cycles/current/fasting-goals/:fastingType/achievements?period=M|3M|6M
 */
export type FastingGoalAchievementsData = {
  fastingType?: string;
  title?: string | null;
  period: FastingAchievementsPeriodCode | string;
  periodStart?: string | null;
  periodEnd?: string | null;
  periodLabel?: string | null;
  hasPrevious?: boolean | null;
  hasNext?: boolean | null;
  canNavigateBack?: boolean | null;
  canNavigateForward?: boolean | null;
  achievementPct?: number | null;
  delta?: FastingAchievementsDelta;
  narrative?: string | null;
  goal?: {
    label?: string | null;
    value?: number | null;
    unit?: string | null;
  } | null;
  totals?: {
    completed?: number | null;
    incomplete?: number | null;
    excused?: number | null;
  } | null;
  timeSpent?: {
    pct?: number | null;
    delta?: number | null;
    totalMinutes?: number | null;
    totalDisplay?: string | null;
    narrative?: string | null;
  } | null;
  chart?: {
    buckets?: FastingAchievementsBucket[] | null;
  } | null;
  calendar?: FastingAchievementsCalendarDay[] | null;
  hijriFootnote?: string | null;
  keyInsightsHeader?: string | null;
  keyInsights?: FastingAchievementsKeyInsight[] | null;
  /** New users stay locked until registered for two windows. */
  locked?: boolean | null;
};

const getFastingGoalAchievements = async (
  fastingType: string,
  period: FastingAchievementsPeriodCode,
  periodStart?: string | null,
): Promise<FastingGoalAchievementsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}/achievements`,
    {
      params: {
        period,
        ...(periodStart ? { periodStart } : {}),
      },
    },
  );
  console.log(
    "response of fasting goal achievements api",
    JSON.stringify(response.data?.data, null, 2),
  );
  return response.data?.data ?? null;
};

export const useGetFastingGoalAchievements = (
  fastingTypeInput: string | null | undefined,
  options: {
    period: PastAchievementPeriod;
    periodStart?: string | null;
    enabled?: boolean;
  },
) => {
  const fastingType = fastingTypeInput
    ? resolveFastingType(fastingTypeInput)
    : "";
  const periodCode = PAST_ACHIEVEMENT_PERIOD_TO_API[options.period];
  const periodStart = options.periodStart ?? null;
  const enabled = !!fastingType && (options.enabled ?? true);

  return useQuery({
    queryKey: [
      "fasting-goal-achievements",
      fastingType,
      periodCode,
      periodStart ?? "latest",
    ],
    queryFn: () =>
      getFastingGoalAchievements(fastingType, periodCode, periodStart),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
