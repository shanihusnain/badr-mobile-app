import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type DeleteQuranHoursLogPayload = {
  /** Backend type, e.g. LISTENING / TAJWEED / MEMORIZATION_SURAH (or UI id — resolved). */
  quranGoalType: string;
  date: string;
  /**
   * Intended for multi-item goals (active surah / juz / hizb).
   * NOT sent yet — DELETE .../log only accepts `date`; backend rejects
   * `itemNumber` / `itemType` ("property … should not exist").
   * Keep on the payload so we can wire them once the API allows them.
   */
  itemNumber?: number | null;
  itemType?: "SURAH" | "JUZ" | "HIZB" | string | null;
};

const deleteQuranHoursLog = async ({
  quranGoalType,
  date,
}: DeleteQuranHoursLogPayload) => {
  const type = resolveQuranType(quranGoalType);
  // Backend delete DTO currently whitelists only `date`.
  // Sending itemNumber/itemType returns: "property itemNumber should not exist…"
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
