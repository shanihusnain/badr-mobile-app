import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { GoalInfo } from "@/src/translations/types";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type QuranDetailApiData = GoalInfo & {
  quranGoalType: string;
  isActive?: boolean;
  title?: string;
  description?: string;
};

const getQuranDetailByType = async (
  type: string,
): Promise<QuranDetailApiData | null> => {
  const quranGoalType = resolveQuranType(type);
  if (!quranGoalType) return null;

  const response = await api.get(
    `api/goal-cycles/current/quran-goals/${quranGoalType}`,
  );

  console.log("response", response.data);
  return response.data?.data ?? null;
};

export const useGetQuranDetailByType = (
  type: string,
  options?: { enabled?: boolean },
) => {
  const quranGoalType = resolveQuranType(type);
  const enabled = !!quranGoalType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["quran-detail", quranGoalType],
    queryFn: () => getQuranDetailByType(quranGoalType),
    enabled,
  });
};
