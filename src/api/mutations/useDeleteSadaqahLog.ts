import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";
import { invalidateSadaqahCaches } from "@/src/utils/invalidateSadaqahCaches";

export type DeleteSadaqahLogPayload = {
  sadaqahType: string;
  /** YYYY-MM-DD */
  logDate: string;
  suppressSuccessToast?: boolean;
};

export type DeleteSadaqahLogResult = {
  deletedCount?: number;
  goal?: {
    completed?: number;
    completedAmount?: number;
    remaining?: number;
    remainingAmount?: number;
    target?: number;
    targetAmount?: number;
    achievementPct?: number;
    status?: string;
  };
};

/**
 * DELETE api/goal-cycles/current/sadaqah-goals/:sadaqahType/logs?logDate=
 */
const deleteSadaqahLog = async ({
  sadaqahType: rawType,
  logDate,
}: DeleteSadaqahLogPayload): Promise<DeleteSadaqahLogResult> => {
  const sadaqahType = resolveSadaqahType(rawType);
  const params = new URLSearchParams({ logDate });
  const response = await api.delete(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}/logs?${params.toString()}`,
  );
  return response.data?.data ?? response.data ?? {};
};

export const useDeleteSadaqahLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSadaqahLog,
    onSuccess: (_data, variables) => {
      invalidateSadaqahCaches(queryClient, variables.sadaqahType);
      if (!variables.suppressSuccessToast) {
        showToast("success", "Sadaqah log deleted");
      }
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to delete sadaqah log"),
      );
    },
  });
};
