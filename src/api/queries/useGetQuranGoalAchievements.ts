import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveQuranType } from "@/src/utils/quranGoalMap";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { PAST_ACHIEVEMENT_PERIOD_TO_API } from "./useGetPrayerGoalAchievements";

export type QuranAchievementsPeriodCode = "M" | "3M" | "6M";

export type QuranAchievementsDelta = {
  direction?: "UP" | "DOWN" | "NEUTRAL" | string;
  pct?: number;
  label?: string;
} | null;

export type QuranAchievementsBucket = {
  start: string | null;
  end: string | null;
  label?: string;
  range?: string;
  /** Hours goals use minutes; memorisation may reuse this field for ayah counts. */
  completedMinutes: number;
  incompleteMinutes: number;
  /** Explicit verse/ayah fields when the backend sends them. */
  completedVerses?: number | null;
  incompleteVerses?: number | null;
  completedAyahs?: number | null;
  incompleteAyahs?: number | null;
  timeSpentMinutes?: number | null;
  completedLabel?: string | null;
  incompleteLabel?: string | null;
  goalMinutes?: number | null;
  goalHours?: number | null;
  goalAyahs?: number | null;
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
  periodStart: string | null;
  periodEnd: string | null;
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
    /** Memorisation / verse goals. */
    completedVerses?: number;
    incompleteVerses?: number;
    completedAyahs?: number;
    incompleteAyahs?: number;
    timeSpentMinutes?: number;
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

export type QuranAchievementsChartMode =
  | "COMPLETED_VS_INCOMPLETE"
  | "COMPLETED_VS_TIME"
  | string;

const getQuranGoalAchievements = async (
  quranGoalType: string,
  period: QuranAchievementsPeriodCode,
  options?: {
    periodStart?: string | null;
    itemNumber?: number | null;
    chart?: QuranAchievementsChartMode | null;
  },
): Promise<QuranGoalAchievementsData | null> => {
  const periodStart = options?.periodStart ?? null;
  const itemNumber = options?.itemNumber ?? null;
  const chart = options?.chart ?? null;

  const response = await api.get(
    `api/goal-cycles/current/quran-goals/${quranGoalType}/achievements`,
    {
      params: {
        period,
        ...(periodStart ? { periodStart } : {}),
        ...(itemNumber != null ? { itemNumber } : {}),
        ...(chart ? { chart } : {}),
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
    /** Surah / juz / hizb number for multi-item goals (e.g. MEMORIZATION_SURAH). */
    itemNumber?: number | null;
    /**
     * Chart mode for memorisation etc.
     * e.g. COMPLETED_VS_TIME — omit for default completed vs incomplete.
     */
    chart?: QuranAchievementsChartMode | null;
    enabled?: boolean;
  },
) => {
  const quranGoalType = quranGoalTypeInput
    ? resolveQuranType(quranGoalTypeInput)
    : "";
  const periodCode = PAST_ACHIEVEMENT_PERIOD_TO_API[options.period];
  const periodStart = options.periodStart ?? null;
  const itemNumber = options.itemNumber ?? null;
  const chart = options.chart ?? null;
  const enabled = !!quranGoalType && (options.enabled ?? true);

  return useQuery({
    queryKey: [
      "quran-goal-achievements",
      quranGoalType,
      periodCode,
      periodStart ?? "latest",
      itemNumber ?? "all",
      chart ?? "COMPLETED_VS_INCOMPLETE",
    ],
    queryFn: () =>
      getQuranGoalAchievements(quranGoalType, periodCode, {
        periodStart,
        itemNumber,
        chart,
      }),
    enabled,
  });
};
