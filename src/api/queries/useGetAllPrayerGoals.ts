import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { PrayerGoalApiItem } from "@/src/utils/prayerGoalMap";

const getAllPrayerGoals = async (): Promise<PrayerGoalApiItem[]> => {
  const response = await api.get("api/goal-cycles/current/prayer-goals/mapped");

  console.log(
    "response of the prayer goals mapped",
    JSON.stringify(response.data?.data, null, 2),
  );
  return response.data?.data ?? [];
};

export const useGetAllPrayerGoals = ({
  enabled,
  userId,
}: {
  enabled: boolean;
  userId?: string | null;
}) => {
  return useQuery({
    queryKey: ["all-prayer-goals", userId ?? "anonymous"],
    queryFn: getAllPrayerGoals,
    enabled,
  });
};
