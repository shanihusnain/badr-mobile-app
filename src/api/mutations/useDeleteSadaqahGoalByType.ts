import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";

type DeleteSadaqahGoalArgs = {
  sadaqahType: string;
  suppressSuccessToast?: boolean;
};

/**
 * Sadaqah goals have no DELETE-by-type route on the API.
 * Removing a goal = deactivate via PATCH .../toggle { isActive: false }.
 */
const deleteSadaqahGoalByType = async ({
  sadaqahType: rawType,
}: DeleteSadaqahGoalArgs) => {
  const sadaqahType = resolveSadaqahType(rawType);
  const response = await api.patch(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}/toggle`,
    { isActive: false },
  );
  return response.data;
};

export const useDeleteSadaqahGoalByType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSadaqahGoalByType,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-sadaqah-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      queryClient.removeQueries({
        queryKey: ["sadaqah-detail", resolveSadaqahType(variables.sadaqahType)],
      });
      if (!variables.suppressSuccessToast) {
        showToast("success", "Sadaqah goal removed");
      }
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to remove sadaqah goal"),
      );
    },
  });
};
