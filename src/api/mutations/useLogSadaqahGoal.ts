import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";
import { invalidateSadaqahCaches } from "@/src/utils/invalidateSadaqahCaches";

export type LogSadaqahGoalPayload = {
  sadaqahType: string;
  /** YYYY-MM-DD */
  logDate: string;
  /** Amount fulfilled (currency units). */
  amount: number;
  /** HH:mm (24h) */
  startTime: string;
  durationMinutes: number;
};

export type LogSadaqahGoalResult = {
  logDate?: string;
  date?: string;
  amount?: number;
  startTime?: string;
  durationMinutes?: number;
  goal?: {
    completed?: number;
    completedAmount?: number;
    remaining?: number;
    remainingAmount?: number;
    target?: number;
    targetAmount?: number;
    achievementPct?: number;
    status?: string;
    justCompleted?: boolean;
  };
};

/**
 * POST api/goal-cycles/current/sadaqah-goals/:sadaqahType/logs
 * Body: { logDate, amount, startTime, durationMinutes }
 */
const logSadaqahGoal = async ({
  sadaqahType: rawType,
  logDate,
  amount,
  startTime,
  durationMinutes,
}: LogSadaqahGoalPayload): Promise<LogSadaqahGoalResult> => {
  const sadaqahType = resolveSadaqahType(rawType);
  const body = { logDate, amount, startTime, durationMinutes };
  const response = await api.post(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}/logs`,
    body,
  );
  return response.data?.data ?? response.data ?? {};
};

export const useLogSadaqahGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logSadaqahGoal,
    onSuccess: (_data, variables) => {
      invalidateSadaqahCaches(queryClient, variables.sadaqahType);
      showToast("success", "Sadaqah logged successfully");
    },
    onError: (error: any) => {
      showToast("error", getApiErrorMessage(error, "Failed to log sadaqah"));
    },
  });
};
