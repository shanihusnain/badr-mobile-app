import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type DeleteQuranHoursLogPayload = {
  /** Backend type, e.g. LISTENING / TAJWEED (or UI id — resolved). */
  quranGoalType: string;
  date: string;
};

const deleteQuranHoursLog = async ({
  quranGoalType,
  date,
}: DeleteQuranHoursLogPayload) => {
  const type = resolveQuranType(quranGoalType);
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
