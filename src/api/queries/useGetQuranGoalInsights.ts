import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type QuranGoalInsightsStatIcon =
  | "CHECK"
  | "BOLT"
  | "STAR"
  | "CHART"
  | string;

export type QuranGoalInsightsStat = {
  key: string;
  icon: QuranGoalInsightsStatIcon;
  label: string;
  value: string;
};

export type QuranGoalInsightsRing = {
  targetLabel: string;
  achievementPct: number;
  state?: string;
};

export type QuranGoalInsightsData = {
  quranGoalType: string;
  itemNumber?: number | null;
  itemName?: string | null;
  title?: string | null;
  ring: QuranGoalInsightsRing;
  greeting: string;
  headline: string;
  body: string;
  stats: QuranGoalInsightsStat[];
};

const getQuranGoalInsights = async (
  quranGoalType: string,
): Promise<QuranGoalInsightsData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/quran-goals/${quranGoalType}/insights`,
  );
  console.log(
    "response of quran goal insights",
    JSON.stringify(response.data, null, 2),
  );
  return response.data?.data ?? null;
};

export const useGetQuranGoalInsights = (
  quranGoalTypeInput: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const quranGoalType = quranGoalTypeInput
    ? resolveQuranType(quranGoalTypeInput)
    : "";
  const enabled = !!quranGoalType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["quran-goal-insights", quranGoalType],
    queryFn: () => getQuranGoalInsights(quranGoalType),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
