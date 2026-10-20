import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";

export type SadaqahGoalInsightsStatIcon =
  | "CHECK"
  | "BOLT"
  | "STREAK"
  | "STAR"
  | "CHART"
  | "CLOCK"
  | "TIME"
  | "SCALE"
  | string;

export type SadaqahGoalInsightsStat = {
  key: string;
  icon?: SadaqahGoalInsightsStatIcon | null;
  label?: string | null;
  value: string;
};

export type SadaqahGoalInsightsRing = {
  targetLabel?: string | null;
  achievementPct?: number | null;
  state?: string | null;
};

/**
 * GET api/goal-cycles/current/sadaqah-goals/:sadaqahType/insights
 * Same collection shape as fasting insights: title, ring, greeting, headline, body, stats.
 */
export type SadaqahGoalInsightsData = {
  sadaqahType?: string;
  title?: string | null;
  ring?: SadaqahGoalInsightsRing | null;
  greeting?: string | null;
  headline?: string | null;
  body?: string | null;
  stats?: SadaqahGoalInsightsStat[] | null;
  currencyCode?: string | null;
};

const getSadaqahGoalInsights = async (
  sadaqahType: string,
): Promise<SadaqahGoalInsightsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}/insights`,
  );
  return response.data?.data ?? null;
};

export const useGetSadaqahGoalInsights = (
  sadaqahTypeInput: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const sadaqahType = sadaqahTypeInput
    ? resolveSadaqahType(sadaqahTypeInput)
    : "";
  const enabled = !!sadaqahType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["sadaqah-goal-insights", sadaqahType],
    queryFn: () => getSadaqahGoalInsights(sadaqahType),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
