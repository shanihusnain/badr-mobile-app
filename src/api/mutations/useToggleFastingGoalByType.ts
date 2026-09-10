import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

type ToggleFastingGoalArgs = {
  fastingType: string;
  isActive: boolean;
};

const toggleFastingGoalByType = async ({
  fastingType,
  isActive,
}: ToggleFastingGoalArgs) => {
  const type = resolveFastingType(fastingType);
  const response = await api.patch(
    `api/goal-cycles/current/fasting-goals/${type}/toggle`,
    { isActive },
  );
  return response.data;
};

export const useToggleFastingGoalByType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleFastingGoalByType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-fasting-goals"] });
      queryClient.invalidateQueries({ queryKey: ["fasting-calendar-preview"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
    },
    onError: (error: any) => {
      console.log(
        "error=================>",
        JSON.stringify(error?.response?.data),
      );
      // Caller (GoalPlannerSheet) shows a confirmation modal for conflict errors.
    },
  });
};
