import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { PrayerGoalApiItem } from "@/src/utils/prayerGoalMap";

const getAllPrayerGoals = async (): Promise<PrayerGoalApiItem[]> => {
  const response = await api.get("api/goal-cycles/current/prayer-goals");
  return response.data?.data ?? [];
};

export const useGetAllPrayerGoals = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["all-prayer-goals"],
    queryFn: getAllPrayerGoals,
    enabled,
  });
};
