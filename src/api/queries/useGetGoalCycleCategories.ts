import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type GoalCycleCategorySummary = {
  category: string;
  totalGoals: number;
  completedPct: number;
};

const getGoalCycleCategories = async (): Promise<GoalCycleCategorySummary[]> => {
  const response = await api.get("api/goal-cycles/current/categories");
  const categories = response.data?.data?.categories;
  return Array.isArray(categories) ? categories : [];
};

export const GOAL_CYCLE_CATEGORIES_QUERY_KEY = ["goal-cycle-categories"] as const;

export const useGetGoalCycleCategories = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: GOAL_CYCLE_CATEGORIES_QUERY_KEY,
    queryFn: getGoalCycleCategories,
    enabled: options?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
