import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type DeleteQuranGoalMetricArgs = {
  quranGoalType: string;
  itemType: string;
  itemNumber: string | number;
};

const deleteSingleQuranGoalMetric = async ({
  quranGoalType,
  itemType,
  itemNumber,
}: DeleteQuranGoalMetricArgs) => {
  const response = await api.delete(
    `api/goal-cycles/current/quran-goals/${quranGoalType}`,
    {
      params: {
        itemType,
        itemNumber,
      },
    },
  );
  return response.data;
};

export const useDeleteQuranGoalSingleMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSingleQuranGoalMetric,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({
        queryKey: ["quran-goal-detail", variables.quranGoalType],
      });
      showToast("success", "Goal item removed");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to remove goal item"),
      );
    },
  });
};
