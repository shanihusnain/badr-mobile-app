import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type QuranGoalItemPayload = {
  itemType: "SURAH" | "JUZ" | "HIZB" | "VERSE";
  itemNumber?: number;
  surahName?: string;
  verseStart?: number;
  verseEnd?: number;
  targetCount?: number;
};

export type UpsertQuranGoalPayload = {
  quranGoalType: string;
  isActive?: boolean;
  frequency?: string;
  targetHours?: number;
  completionTarget?: number;
  items?: QuranGoalItemPayload[];
};

export type BulkUpsertQuranGoalsPayload = {
  goals: UpsertQuranGoalPayload[];
};

/** Preferred: can upsert one or many goal types; auto-activates each type. */
const bulkUpsertQuranGoals = async (payload: BulkUpsertQuranGoalsPayload) => {
  console.log("payload of the bulk upsert quran goals", payload);
  const response = await api.put(
    "api/goal-cycles/current/quran-goals/bulk",
    payload,
  );
  return response.data;
};

/** Legacy single upsert — requires the goal to already be toggled on. */
const upsertQuranGoal = async (payload: UpsertQuranGoalPayload) => {
  const { quranGoalType, ...body } = payload;
  const response = await api.put(
    `api/goal-cycles/current/quran-goals/${quranGoalType}`,
    { quranGoalType, ...body },
  );
  return response.data;
};

export const useBulkUpsertQuranGoals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUpsertQuranGoals,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      for (const goal of variables.goals) {
        queryClient.invalidateQueries({
          queryKey: ["quran-goal-detail", goal.quranGoalType],
        });
      }
      showToast("success", data?.data?.message ?? "Quran goals saved");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to save goal"));
    },
  });
};

export const useUpsertQuranGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertQuranGoal,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      queryClient.invalidateQueries({
        queryKey: ["quran-goal-detail", variables.quranGoalType],
      });
      showToast("success", data?.data?.message ?? "Goal saved");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to save goal"));
    },
  });
};
