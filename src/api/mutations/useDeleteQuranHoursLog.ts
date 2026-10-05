import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

/**
 * Goal types that support DELETE .../log/items (day + catalog item).
 * Everything else must use whole-day DELETE .../log?date=...
 */
const ITEM_SCOPED_DELETE_TYPES = new Set([
  "RECITATION_SURAH",
  "MEMORIZATION_SURAH",
  "MEMORIZATION_HIZB",
]);

export type DeleteQuranHoursLogPayload = {
  /** Backend type, e.g. LISTENING / TAJWEED / RECITATION_SURAH (or UI id — resolved). */
  quranGoalType: string;
  date: string;
  /**
   * Required for RECITATION_SURAH / MEMORIZATION_SURAH / MEMORIZATION_HIZB —
   * sent to DELETE .../log/items. Ignored for whole-day deletes
   * (LISTENING, TAJWEED, RECITATION_JUZ, RECITATION_COMPLETION, MEMORIZATION_JUZ).
   */
  itemNumber?: number | null;
  itemType?: "SURAH" | "JUZ" | "HIZB" | string | null;
};

function defaultItemTypeForGoal(type: string): "SURAH" | "HIZB" {
  return type === "MEMORIZATION_HIZB" ? "HIZB" : "SURAH";
}

const deleteQuranHoursLog = async ({
  quranGoalType,
  date,
  itemNumber,
  itemType,
}: DeleteQuranHoursLogPayload) => {
  const type = resolveQuranType(quranGoalType);
  const resolvedItemNumber =
    itemNumber != null && Number.isFinite(Number(itemNumber))
      ? Number(itemNumber)
      : null;

  if (ITEM_SCOPED_DELETE_TYPES.has(type)) {
    if (resolvedItemNumber == null || resolvedItemNumber <= 0) {
      throw new Error(
        "itemNumber is required to delete a session for this goal type",
      );
    }

    const resolvedItemType = (
      (itemType && String(itemType).trim()) ||
      defaultItemTypeForGoal(type)
    ).toUpperCase();

    const response = await api.delete(
      `api/goal-cycles/current/quran-goals/${type}/log/items`,
      {
        data: {
          date,
          itemType: resolvedItemType,
          itemNumber: resolvedItemNumber,
        },
      },
    );
    return response.data;
  }

  // LISTENING, TAJWEED, RECITATION_JUZ, RECITATION_COMPLETION, MEMORIZATION_JUZ
  const params = new URLSearchParams({ date });
  const response = await api.delete(
    `api/goal-cycles/current/quran-goals/${type}/log?${params.toString()}`,
  );
  return response.data;
};

export const useDeleteQuranHoursLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuranHoursLog,
    onSuccess: (_data, variables) => {
      const type = resolveQuranType(variables.quranGoalType);
      queryClient.invalidateQueries({
        queryKey: ["quran-goal-frame", type],
      });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-insights", type] });
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["goal-cycle-category-goals"],
      });
      showToast("success", "Session deleted");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to delete session"),
      );
    },
  });
};
