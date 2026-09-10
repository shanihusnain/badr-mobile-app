import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type UpsertFastingGoalPayload = {
  fastingType: string;
  /** Required for MISSED_RAMADAN */
  targetCount?: number;
  /** Explicit dates (YYYY-MM-DD). Required for date-based fasting goals. */
  plannedDates?: string[];
  /** PROPHET_DAWOOD: 1 = start day 1, 2 = start day 2 */
  dawoodStartDay?: 1 | 2;
};

/**
 * PUT api/goal-cycles/current/fasting-goals/:fastingType
 * Goal must already be toggled on. Body is config only (no isActive).
 */
const upsertFastingGoals = async ({
  fastingType: rawType,
  plannedDates,
  targetCount,
  dawoodStartDay,
}: UpsertFastingGoalPayload) => {
  const fastingType = resolveFastingType(rawType);
  const body: Record<string, unknown> = {};
  if (plannedDates !== undefined) body.plannedDates = plannedDates;
  if (targetCount !== undefined) body.targetCount = targetCount;
  if (dawoodStartDay !== undefined) body.dawoodStartDay = dawoodStartDay;

  const response = await api.put(
    `api/goal-cycles/current/fasting-goals/${fastingType}`,
    body,
  );
  return response.data;
};

export const useUpsertFastingGoals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertFastingGoals,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-fasting-goals"] });
      queryClient.invalidateQueries({ queryKey: ["fasting-calendar-preview"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      showToast("success", data?.message ?? "Fasting goal saved");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to save fasting goal"),
      );
    },
  });
};
