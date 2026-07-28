import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { GoalInfo } from "@/src/translations/types";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";

export type PrayerDetailApiData = GoalInfo & {
  prayerType: string;
  isActive?: boolean;
  title?: string;
  description?: string;
};

const getPrayerDetailByType = async (
  type: string,
): Promise<PrayerDetailApiData | null> => {
  const prayerType = resolvePrayerType(type);
  const response = await api.get(
    `api/goal-cycles/current/prayer-goals/${prayerType}`,
  );
  return response.data?.data ?? null;
};

export const useGetPrayerDetailByType = (type: string) => {
  const prayerType = resolvePrayerType(type);

  return useQuery({
    queryKey: ["prayer-detail", prayerType],
    queryFn: () => getPrayerDetailByType(prayerType),
    enabled: !!prayerType,
  });
};
