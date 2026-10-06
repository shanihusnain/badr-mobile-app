import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";
import { invalidateFastingCaches } from "@/src/utils/invalidateFastingCaches";

export type LogFastingGoalPayload = {
  fastingType: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm (24h) */
  startTime: string;
  /** HH:mm (24h) */
  endTime: string;
};

export type LogFastingGoalResult = {
  date?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
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
 * POST api/goal-cycles/current/fasting-goals/:fastingType/log
 * Re-logging the same planned date replaces times (does not double-count).
 */
const logFastingGoal = async ({
  fastingType: rawType,
  date,
  startTime,
  endTime,
}: LogFastingGoalPayload): Promise<LogFastingGoalResult> => {
  const fastingType = resolveFastingType(rawType);
  const response = await api.post(
    `api/goal-cycles/current/fasting-goals/${fastingType}/log`,
    { date, startTime, endTime },
  );
  return response.data?.data ?? response.data ?? {};
};

export const useLogFastingGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logFastingGoal,
    onSuccess: (_data, variables) => {
      invalidateFastingCaches(queryClient, variables.fastingType);
      showToast("success", "Fast logged successfully");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to log fast"),
      );
    },
  });
};
