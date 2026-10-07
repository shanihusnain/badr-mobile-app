import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";
import { invalidateFastingCaches } from "@/src/utils/invalidateFastingCaches";

export type LogFastingGoalMode =
  | "PLANNED_DATE"
  | "EARLIER_THAN_PLANNED"
  | "MAKE_UP"
  | string;

export type LogFastingGoalPayload = {
  fastingType: string;
  /** YYYY-MM-DD — the day the fast was kept */
  date: string;
  /** HH:mm (24h) */
  startTime: string;
  /** HH:mm (24h) */
  endTime: string;
  /**
   * Missed Ramadan branches:
   * - omit / PLANNED_DATE: log on a planned date
   * - EARLIER_THAN_PLANNED: requires plannedDate
   * - MAKE_UP: covers the earliest missed planned fast
   */
  mode?: LogFastingGoalMode;
  /** Required when mode is EARLIER_THAN_PLANNED */
  plannedDate?: string;
};

export type LogFastingGoalResult = {
  date?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  mode?: string;
  plannedDate?: string;
  goal?: {
    completed?: number;
    missed?: number;
    remaining?: number;
    excused?: number;
    target?: number;
    achievementPct?: number;
    status?: string;
    justCompleted?: boolean;
  };
};

/**
 * POST api/goal-cycles/current/fasting-goals/:fastingType/log
 * Re-logging the same kept date replaces times (does not double-count).
 */
const logFastingGoal = async ({
  fastingType: rawType,
  date,
  startTime,
  endTime,
  mode,
  plannedDate,
}: LogFastingGoalPayload): Promise<LogFastingGoalResult> => {
  const fastingType = resolveFastingType(rawType);
  const body: Record<string, string> = { date, startTime, endTime };
  if (mode && mode !== "PLANNED_DATE") {
    body.mode = mode;
  }
  if (plannedDate) {
    body.plannedDate = plannedDate;
  }
  const response = await api.post(
    `api/goal-cycles/current/fasting-goals/${fastingType}/log`,
    body,
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
