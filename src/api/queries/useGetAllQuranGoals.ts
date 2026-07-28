import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { QuranGoalApiItem } from "@/src/utils/quranGoalMap";

const getAllQuranGoals = async (): Promise<QuranGoalApiItem[]> => {
  const response = await api.get("api/goal-cycles/current/quran-goals");
  return response.data?.data ?? [];
};

export const useGetAllQuranGoals = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["all-quran-goals"],
    queryFn: getAllQuranGoals,
    enabled,
  });
};
