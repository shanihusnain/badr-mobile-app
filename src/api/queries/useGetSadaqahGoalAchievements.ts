import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { PAST_ACHIEVEMENT_PERIOD_TO_API } from "./useGetPrayerGoalAchievements";

export type SadaqahAchievementsPeriodCode = "M" | "3M" | "6M";

export type SadaqahAchievementsDelta = {
  direction?: "UP" | "DOWN" | "NEUTRAL" | string;
  pct?: number | null;
  label?: string | null;
} | null;

export type SadaqahAchievementsBucketNarrative = {
  completion?: string | null;
  time?: string | null;
};

export type SadaqahAchievementsBucket = {
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
  narrative?: SadaqahAchievementsBucketNarrative | null;
};

export type SadaqahAchievementsKeyInsight = {
  key: string;
  label?: string | null;
  value?: string | number | null;
  unit?: string | null;
  deltaLabel?: string | null;
  previousLabel?: string | null;
  direction?: "UP" | "DOWN" | "NEUTRAL" | string | null;
  sentiment?: string | null;
};

export type SadaqahAchievementsFilter = {
  code: string;
  label: string;
};

export type SadaqahAchievementsTab = {
  key: string;
  label: string;
};

/**
 * GET api/goal-cycles/current/sadaqah-goals/:sadaqahType/achievements
 * ?period=M|3M|6M&periodStart=&filter=ALL|MEALS|CLOTHING_ITEMS
 */
export type SadaqahGoalAchievementsData = {
  sadaqahType?: string;
  title?: string | null;
  period: SadaqahAchievementsPeriodCode | string;
  periodStart?: string | null;
  periodEnd?: string | null;
  periodLabel?: string | null;
  hasPrevious?: boolean | null;
  hasNext?: boolean | null;
  canNavigateBack?: boolean | null;
  canNavigateForward?: boolean | null;
  tabs?: SadaqahAchievementsTab[] | null;
  /** Active filter code from API (`ALL`, `MEALS`, `CLOTHING_ITEMS`). */
  filter?: string | null;
  filters?: SadaqahAchievementsFilter[] | null;
  isCategoryView?: boolean | null;
  tapHint?: string | null;
  achievementPct?: number | null;
  delta?: SadaqahAchievementsDelta;
  narrative?: string | null;
  currencyCode?: string | null;
  goal?: {
    label?: string | null;
    value?: number | null;
    display?: string | null;
    unit?: string | null;
  } | null;
  totals?: {
    completed?: number | null;
    completedDisplay?: string | null;
    incomplete?: number | null;
    incompleteDisplay?: string | null;
  } | null;
  timeSpent?: {
    pct?: number | null;
    pctDisplay?: string | null;
    delta?: number | null;
    totalMinutes?: number | null;
    totalDisplay?: string | null;
    narrative?: string | null;
  } | null;
  chart?: {
    buckets?: SadaqahAchievementsBucket[] | null;
  } | null;
  keyInsightsHeader?: string | null;
  keyInsights?: SadaqahAchievementsKeyInsight[] | null;
  locked?: boolean | null;
};

const getSadaqahGoalAchievements = async (
  sadaqahType: string,
  period: SadaqahAchievementsPeriodCode,
  periodStart?: string | null,
  filter?: string | null,
): Promise<SadaqahGoalAchievementsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}/achievements`,
    {
      params: {
        period,
        ...(periodStart ? { periodStart } : {}),
        ...(filter && filter !== "ALL" ? { filter } : {}),
      },
    },
  );
  return response.data?.data ?? null;
};

export const useGetSadaqahGoalAchievements = (
  sadaqahTypeInput: string | null | undefined,
  options: {
    period: PastAchievementPeriod;
    periodStart?: string | null;
    /** KAFFARAH: ALL | MEALS | CLOTHING_ITEMS */
    filter?: string | null;
    enabled?: boolean;
  },
) => {
  const sadaqahType = sadaqahTypeInput
    ? resolveSadaqahType(sadaqahTypeInput)
    : "";
  const periodCode = PAST_ACHIEVEMENT_PERIOD_TO_API[options.period];
  const periodStart = options.periodStart ?? null;
  const filter = options.filter?.trim().toUpperCase() || null;
  const enabled = !!sadaqahType && (options.enabled ?? true);

  return useQuery({
    queryKey: [
      "sadaqah-goal-achievements",
      sadaqahType,
      periodCode,
      periodStart ?? "latest",
      filter ?? "ALL",
    ],
    queryFn: () =>
      getSadaqahGoalAchievements(sadaqahType, periodCode, periodStart, filter),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
