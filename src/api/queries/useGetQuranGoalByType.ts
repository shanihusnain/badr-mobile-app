import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { QuranGoalDetail } from "@/src/utils/quranGoalMap";

const getQuranGoalByType = async (
  quranGoalType: string,
): Promise<QuranGoalDetail | null> => {
  const response = await api.get(
    `api/goal-cycles/current/quran-goals/${quranGoalType}`,
  );
  return response.data?.data ?? null;
};

export const useGetQuranGoalByType = (
  quranGoalType: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const enabled = !!quranGoalType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["quran-goal-detail", quranGoalType],
    queryFn: () => getQuranGoalByType(quranGoalType!),
    enabled,
  });
};
