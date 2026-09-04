import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";

export type DeletePrayerLogPayload = {
  prayerType: string;
  date: string;
  /** Five Daily — remove a single slot for the day (omit to clear the whole day). */
  prayerSlot?: string;
  /** Sunnah Rawatib — remove a single slot for the day. */
  sunnahSlot?: string;
  /** Sunnah — how many units to remove from that slot (1 or 2). */
  count?: number;
  /** When true, skip the success toast (e.g. mid multi-slot delete). */
  suppressSuccessToast?: boolean;
};

const deletePrayerLog = async ({
  prayerType,
  date,
  prayerSlot,
  sunnahSlot,
  count,
}: DeletePrayerLogPayload) => {
  const resolvedPrayerType = resolvePrayerType(prayerType);
  const params = new URLSearchParams({ date });
  if (prayerSlot) params.set("prayerSlot", prayerSlot);
  if (sunnahSlot) params.set("sunnahSlot", sunnahSlot);
  if (typeof count === "number" && count > 0) {
    params.set("count", String(count));
  }
  const response = await api.delete(
    `api/goal-cycles/current/prayer-goals/${resolvedPrayerType}/log?${params.toString()}`,
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
      queryClient.invalidateQueries({
        queryKey: ["prayer-goal-day-detail", prayerType],
      });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-insights"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-logs"] });
      if (!variables.suppressSuccessToast) {
        showToast("success", "Prayer log deleted");
      }
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to delete prayer log"),
      );
    },
  });
};
