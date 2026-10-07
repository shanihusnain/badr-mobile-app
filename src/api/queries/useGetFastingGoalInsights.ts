import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type FastingGoalInsightsStatIcon =
  | "CHECK"
  | "BOLT"
  | "STREAK"
  | "STAR"
  | "CHART"
  | "CLOCK"
  | "TIME"
  | string;

export type FastingGoalInsightsStat = {
  key: string;
  icon?: FastingGoalInsightsStatIcon | null;
  label?: string | null;
  value: string;
};

export type FastingGoalInsightsRing = {
  targetLabel?: string | null;
  achievementPct?: number | null;
  state?: string | null;
};

/**
 * GET api/goal-cycles/current/fasting-goals/:fastingType/insights
 * Collection shape: title, ring, greeting, stats (LONGEST_STREAK, TIME_SPENT).
 */
export type FastingGoalInsightsData = {
  fastingType?: string;
  title?: string | null;
  ring?: FastingGoalInsightsRing | null;
  greeting?: string | null;
  headline?: string | null;
  body?: string | null;
  stats?: FastingGoalInsightsStat[] | null;
};

const getFastingGoalInsights = async (
  fastingType: string,
): Promise<FastingGoalInsightsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}/insights`,
  );
  console.log(
    "response of the insights api",
    JSON.stringify(response.data, null, 2),
  );
  return response.data?.data ?? null;
};

export const useGetFastingGoalInsights = (
  fastingTypeInput: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const fastingType = fastingTypeInput
    ? resolveFastingType(fastingTypeInput)
    : "";
  const enabled = !!fastingType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["fasting-goal-insights", fastingType],
    queryFn: () => getFastingGoalInsights(fastingType),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
