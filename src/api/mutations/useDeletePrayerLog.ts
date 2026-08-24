import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";

export type DeletePrayerLogPayload = {
  prayerType: string;
  date: string;
};

const deletePrayerLog = async ({
  prayerType,
  date,
}: DeletePrayerLogPayload) => {
  const resolvedPrayerType = resolvePrayerType(prayerType);
  const response = await api.delete(
    `api/goal-cycles/current/prayer-goals/${resolvedPrayerType}/log?date=${date}`,
  );
  return response.data;
};

export const useDeletePrayerLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePrayerLog,
    onSuccess: (_data, variables) => {
      const prayerType = resolvePrayerType(variables.prayerType);
      // Invalidate this prayer goal's frame queries only — the active
      // week stays in PrayerGoalFrameProvider (`weekNumber` / query key).
      queryClient.invalidateQueries({
        queryKey: ["prayer-goal-frame", prayerType],
      });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-insights"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-logs"] });
      showToast("success", "Prayer log deleted");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to delete prayer log"),
      );
    },
  });
};
