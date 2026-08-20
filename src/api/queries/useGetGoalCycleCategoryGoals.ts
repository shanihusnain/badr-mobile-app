import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type GoalCycleCategoryGoal = {
  goalType: string;
  displayName: string;
  completed: number;
  target: number;
  completedPct: number;
  unit: string;
};

export type GoalCycleCategoryGoalsData = {
  category: string;
  goals: GoalCycleCategoryGoal[];
};

const getGoalCycleCategoryGoals = async (
  category: string,
): Promise<GoalCycleCategoryGoalsData> => {
  const response = await api.get(
    `api/goal-cycles/current/categories/${category}`,
  );
  const data = response.data?.data;
  return {
    category: typeof data?.category === "string" ? data.category : category,
    goals: Array.isArray(data?.goals) ? data.goals : [],
  };
};

export const goalCycleCategoryGoalsQueryKey = (category: string) =>
  ["goal-cycle-category-goals", category] as const;

export const useGetGoalCycleCategoryGoals = (
  category: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const slug = category?.toLowerCase() ?? "";
  const enabled = !!slug && (options?.enabled ?? true);

  return useQuery({
    queryKey: goalCycleCategoryGoalsQueryKey(slug),
    queryFn: () => getGoalCycleCategoryGoals(slug),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
