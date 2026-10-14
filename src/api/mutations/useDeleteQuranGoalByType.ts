import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

type DeleteQuranGoalArgs = {
  quranGoalType: string;
  suppressSuccessToast?: boolean;
};

/**
 * Whole Quran goal removal uses toggle off.
 * (Item-level DELETE with itemType/itemNumber still exists separately.)
 */
const deleteQuranGoalByType = async ({
  quranGoalType,
}: DeleteQuranGoalArgs) => {
  const response = await api.patch(
    `api/goal-cycles/current/quran-goals/${quranGoalType}/toggle`,
    { isActive: false },
  );
  return response.data;
};

export const useDeleteQuranGoalByType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuranGoalByType,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      queryClient.invalidateQueries({
        queryKey: ["quran-goal-detail", variables.quranGoalType],
      });
      if (!variables.suppressSuccessToast) {
        showToast("success", "Quran goal removed");
      }
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to remove quran goal"),
      );
    },
  });
};
