import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";

export type KaffarahSubtype = "MEALS" | "CLOTHING_ITEMS";
export type SadaqahTargetUnit = "CURRENCY" | "MEALS" | "ITEMS" | "HOURS";

export type UpsertSadaqahGoalPayload = {
  sadaqahType: string;
  targetAmount?: number;
  targetUnit?: SadaqahTargetUnit;
  currencyCode?: string;
  kaffarahSubtype?: KaffarahSubtype;
  kaffarahMealsTarget?: number;
  kaffarahItemsTarget?: number;
  causeCategory?: string;
  notes?: string;
};

/**
 * PUT api/goal-cycles/current/sadaqah-goals/:sadaqahType
 * Goal must already be toggled on. Body is config only (no isActive).
 */
const upsertSadaqahGoal = async ({
  sadaqahType: rawType,
  targetAmount,
  targetUnit,
  currencyCode,
  kaffarahSubtype,
  kaffarahMealsTarget,
  kaffarahItemsTarget,
  causeCategory,
  notes,
}: UpsertSadaqahGoalPayload) => {
  const sadaqahType = resolveSadaqahType(rawType);
  const body: Record<string, unknown> = {};
  if (targetAmount !== undefined) body.targetAmount = targetAmount;
  if (targetUnit !== undefined) body.targetUnit = targetUnit;
  if (currencyCode !== undefined) body.currencyCode = currencyCode;
  if (kaffarahSubtype !== undefined) body.kaffarahSubtype = kaffarahSubtype;
  if (kaffarahMealsTarget !== undefined) {
    body.kaffarahMealsTarget = kaffarahMealsTarget;
  }
  if (kaffarahItemsTarget !== undefined) {
    body.kaffarahItemsTarget = kaffarahItemsTarget;
  }
  if (causeCategory !== undefined) body.causeCategory = causeCategory;
  if (notes !== undefined) body.notes = notes;

  const response = await api.put(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}`,
    body,
  );
  return response.data;
};

export const useUpsertSadaqahGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertSadaqahGoal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-sadaqah-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      queryClient.invalidateQueries({ queryKey: ["sadaqah-detail"] });
      showToast(
        "success",
        data?.data?.message ?? data?.message ?? "Sadaqah goal saved",
      );
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to save sadaqah goal"),
      );
    },
  });
};
