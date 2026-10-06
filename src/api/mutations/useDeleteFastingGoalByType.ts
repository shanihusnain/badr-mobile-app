import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";
import { invalidateFastingCaches } from "@/src/utils/invalidateFastingCaches";

type DeleteFastingGoalArgs = {
  fastingType: string;
  /** When true, treat 404 as success (already removed). */
  allowNotFound?: boolean;
  suppressSuccessToast?: boolean;
};

/**
 * DELETE api/goal-cycles/current/fasting-goals/:fastingType
 */
const deleteFastingGoalByType = async ({
  fastingType: rawType,
  allowNotFound = true,
}: DeleteFastingGoalArgs) => {
  const fastingType = resolveFastingType(rawType);
  try {
    const response = await api.delete(
      `api/goal-cycles/current/fasting-goals/${fastingType}`,
    );
    return response.data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (allowNotFound && status === 404) {
      return { success: true, statusCode: 404 };
    }
    throw error;
  }
};

export const useDeleteFastingGoalByType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFastingGoalByType,
    onSuccess: (_data, variables) => {
      invalidateFastingCaches(queryClient, variables.fastingType);
      if (!variables.suppressSuccessToast) {
        showToast("success", "Fasting goal removed");
      }
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to remove fasting goal"),
      );
    },
  });
};
