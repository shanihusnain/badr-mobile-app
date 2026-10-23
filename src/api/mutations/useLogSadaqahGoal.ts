import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";
import { invalidateSadaqahCaches } from "@/src/utils/invalidateSadaqahCaches";

export type LogSadaqahKaffarahSubtype = "MEALS" | "CLOTHING_ITEMS";
export type LogSadaqahKaffarahReason = "BROKEN_FAST" | "BROKEN_OATH";

export type LogSadaqahGoalPayload = {
  sadaqahType: string;
  /** YYYY-MM-DD */
  logDate: string;
  /** Amount fulfilled (currency units, meals, clothing pieces, hours, …). */
  amount: number;
  /** HH:mm (24h) */
  startTime: string;
  durationMinutes: number;
  /** KAFFARAH only — meals vs clothing. */
  kaffarahSubtype?: LogSadaqahKaffarahSubtype;
  /** KAFFARAH only — why kaffarah is owed. */
  kaffarahReason?: LogSadaqahKaffarahReason;
  /**
   * LILLAH / SADAQAH_JARIYAH / VOLUNTEERING category.
   * Backend enum e.g. FOOD_RELIEF, HONORING_PARENTS, DISTRIBUTING_FOOD.
   */
  causeCategory?: string;
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
 * FIDYA / KAFFARAH meals: `amount` is a meal (or clothing) count.
 * VOLUNTEERING: `amount` is hours (durationMinutes / 60).
 * KAFFARAH also sends kaffarahSubtype + kaffarahReason when provided.
 * LILLAH / JARIYAH / VOLUNTEERING may send causeCategory.
 */
const logSadaqahGoal = async ({
  sadaqahType: rawType,
  logDate,
  amount,
  startTime,
  durationMinutes,
  kaffarahSubtype,
  kaffarahReason,
  causeCategory,
}: LogSadaqahGoalPayload): Promise<LogSadaqahGoalResult> => {
  const sadaqahType = resolveSadaqahType(rawType);
  const body: Record<string, unknown> = {
    logDate,
    amount,
    startTime,
    durationMinutes,
  };
  if (kaffarahSubtype) body.kaffarahSubtype = kaffarahSubtype;
  if (kaffarahReason) body.kaffarahReason = kaffarahReason;
  if (causeCategory) body.causeCategory = causeCategory;
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
