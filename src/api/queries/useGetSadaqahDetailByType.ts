import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { GoalInfo } from "@/src/translations/types";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";

export type SadaqahDetailApiData = GoalInfo & {
  sadaqahType: string;
  isActive?: boolean;
  title?: string;
  description?: string;
  targetAmount?: number | null;
  targetUnit?: string | null;
  currencyCode?: string | null;
  kaffarahSubtype?: string | null;
  kaffarahMealsTarget?: number | null;
  kaffarahItemsTarget?: number | null;
  causeCategory?: string | null;
};

const getSadaqahDetailByType = async (
  type: string,
): Promise<SadaqahDetailApiData | null> => {
  const sadaqahType = resolveSadaqahType(type);
  if (!sadaqahType) return null;

  const response = await api.get(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}`,
  );
  return response.data?.data ?? null;
};

export const useGetSadaqahDetailByType = (
  type: string,
  options?: { enabled?: boolean },
) => {
  const sadaqahType = resolveSadaqahType(type);
  const enabled = !!sadaqahType && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["sadaqah-detail", sadaqahType],
    queryFn: () => getSadaqahDetailByType(sadaqahType),
    enabled,
  });
};
