import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

type DeletePrayerGoalArgs = {
  prayerType: string;
  suppressSuccessToast?: boolean;
};

/**
 * Prayer goals have no DELETE-by-type route on the API.
 * Removing a goal = deactivate via PATCH .../toggle { isActive: false }.
 */
const deletePrayerGoalByType = async ({ prayerType }: DeletePrayerGoalArgs) => {
  const response = await api.patch(
    `api/goal-cycles/current/prayer-goals/${prayerType}/toggle`,
    { isActive: false },
  );
  return response.data;
};

export const useDeletePrayerGoalByType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePrayerGoalByType,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      if (!variables.suppressSuccessToast) {
        showToast("success", "Prayer goal removed");
      }
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to remove prayer goal"),
      );
    },
  });
};
