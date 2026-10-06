import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";
import { invalidateFastingCaches } from "@/src/utils/invalidateFastingCaches";

export type DeleteFastingLogPayload = {
  fastingType: string;
  /** YYYY-MM-DD */
  date: string;
  suppressSuccessToast?: boolean;
};

export type DeleteFastingLogResult = {
  deletedCount?: number;
  goal?: {
    completed?: number;
    missed?: number;
    remaining?: number;
    excused?: number;
    target?: number;
    achievementPct?: number;
    status?: string;
  };
};

/**
 * DELETE api/goal-cycles/current/fasting-goals/:fastingType/log?date=
 */
const deleteFastingLog = async ({
  fastingType: rawType,
  date,
}: DeleteFastingLogPayload): Promise<DeleteFastingLogResult> => {
  const fastingType = resolveFastingType(rawType);
  const params = new URLSearchParams({ date });
  const response = await api.delete(
    `api/goal-cycles/current/fasting-goals/${fastingType}/log?${params.toString()}`,
  );
  return response.data?.data ?? response.data ?? {};
};

export const useDeleteFastingLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFastingLog,
    onSuccess: (_data, variables) => {
      invalidateFastingCaches(queryClient, variables.fastingType);
      if (!variables.suppressSuccessToast) {
        showToast("success", "Fast log deleted");
      }
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to delete fast log"),
      );
    },
  });
};
