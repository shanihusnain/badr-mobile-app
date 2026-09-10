import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveQuranType } from "@/src/utils/quranGoalMap";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { PAST_ACHIEVEMENT_PERIOD_TO_API } from "./useGetPrayerGoalAchievements";
import { CrossBox } from "@/assets/icons";

export type QuranAchievementsPeriodCode = "M" | "3M" | "6M";

export type QuranAchievementsDelta = {
  direction?: "UP" | "DOWN" | "NEUTRAL" | string;
  pct?: number;
  label?: string;
} | null;

export type QuranAchievementsBucket = {
  start: string;
  end: string;
  label?: string;
  range?: string;
  completedMinutes: number;
  completedLabel?: string | null;
  incompleteMinutes: number;
  incompleteLabel?: string | null;
  goalMinutes?: number | null;
  goalHours?: number | null;
  achievementPct?: number | null;
  delta?: QuranAchievementsDelta;
  narrative?: string | null;
};

export type QuranAchievementsKeyInsight = {
  key: string;
  label?: string;
  value?: string | number | null;
  unit?: string | null;
  previousLabel?: string | null;
  direction?: "UP" | "DOWN" | "NEUTRAL" | string;
};

export type QuranGoalAchievementsData = {
  quranGoalType?: string;
  period: QuranAchievementsPeriodCode | string;
  periodStart: string;
  periodEnd: string;
  periodLabel?: string | null;
  hasPrevious?: boolean;
  hasNext?: boolean;
  /** Prefer these when present; fall back to hasPrevious / hasNext. */
  canNavigateBack?: boolean;
  canNavigateForward?: boolean;
  achievementPct: number;
  delta?: QuranAchievementsDelta;
  narrative?: string | null;
  goal?: {
    label?: string;
    value?: number;
    unit?: string;
  } | null;
  totals?: {
    completedMinutes?: number;
    completedDisplay?: string | null;
    incompleteMinutes?: number;
    incompleteDisplay?: string | null;
  } | null;
  chart?: {
    mode?: string;
    yAxisMax?: number;
    yAxisUnit?: string;
    buckets?: QuranAchievementsBucket[];
  } | null;
  keyInsightsHeader?: string | null;
  keyInsights?: QuranAchievementsKeyInsight[] | null;
};

const getQuranGoalAchievements = async (
  quranGoalType: string,
  period: QuranAchievementsPeriodCode,
  periodStart?: string | null,
): Promise<QuranGoalAchievementsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/quran-goals/${quranGoalType}/achievements`,
    {
      params: {
        period,
        ...(periodStart ? { periodStart } : {}),
      },
    },
  );
  console.log(
    "response.data of the quran goal achievements",
    JSON.stringify(response.data?.data, null, 2),
  );
  return response.data?.data ?? null;
};

export const useGetQuranGoalAchievements = (
  quranGoalTypeInput: string | null | undefined,
  options: {
    period: PastAchievementPeriod;
    periodStart?: string | null;
    enabled?: boolean;
  },
) => {
  const quranGoalType = quranGoalTypeInput
    ? resolveQuranType(quranGoalTypeInput)
    : "";
  const periodCode = PAST_ACHIEVEMENT_PERIOD_TO_API[options.period];
  const periodStart = options.periodStart ?? null;
  const enabled = !!quranGoalType && (options.enabled ?? true);

  return useQuery({
    queryKey: [
      "quran-goal-achievements",
      quranGoalType,
      periodCode,
      periodStart ?? "latest",
    ],
    queryFn: () =>
      getQuranGoalAchievements(quranGoalType, periodCode, periodStart),
    enabled,
  });
};
