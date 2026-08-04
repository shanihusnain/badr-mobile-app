import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { GoalInfo } from "@/src/translations/types";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type FastingDetailApiData = GoalInfo & {
  fastingType: string;
  isActive?: boolean;
  title?: string;
  description?: string;
  targetCount?: number | null;
  dawoodStartDay?: number | null;
  plannedCount?: number;
  plannedDates?: string[];
};

const getFastingDetailByType = async (
  type: string,
): Promise<FastingDetailApiData | null> => {
  const fastingType = resolveFastingType(type);
  if (!fastingType) return null;

  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}`,
  );
  return response.data?.data ?? null;
};

export const useGetFastingDetailByType = (
  type: string,
  options?: { enabled?: boolean },
) => {
  const fastingType = resolveFastingType(type);
  const enabled = !!fastingType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["fasting-detail", fastingType],
    queryFn: () => getFastingDetailByType(fastingType),
    enabled,
  });
};
