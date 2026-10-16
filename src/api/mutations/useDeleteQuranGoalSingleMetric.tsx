import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type DeleteQuranGoalMetricArgs = {
  quranGoalType: string;
  /**
   * Item-level delete (SURAH / JUZ / HIZB only — backend QuranItemType).
   * Omit both for whole-goal delete (e.g. RECITATION_COMPLETION has no items).
   */
  itemType?: string;
  itemNumber?: string | number;
};

const deleteSingleQuranGoalMetric = async ({
  quranGoalType,
  itemType,
  itemNumber,
}: DeleteQuranGoalMetricArgs) => {
  const hasItem =
    itemType != null &&
    String(itemType).length > 0 &&
    itemNumber != null &&
    itemNumber !== "";
  const response = await api.delete(
    `api/goal-cycles/current/quran-goals/${quranGoalType}`,
    hasItem
      ? {
          params: {
            itemType,
            itemNumber,
          },
        }
      : undefined,
  );
  return response.data;
};

export const useDeleteQuranGoalSingleMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSingleQuranGoalMetric,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({
        queryKey: ["quran-goal-detail", variables.quranGoalType],
      });
      showToast("success", "Goal item removed");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to remove goal item"),
      );
    },
  });
};
