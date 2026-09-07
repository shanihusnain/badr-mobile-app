import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";

/** Sunnah Rawatib — units to remove from a slot. */
export type DeleteSunnahSlotItem = {
  slot: string;
  count: number;
};

export type DeletePrayerSlotPayload = {
  prayerType: string;
  date: string;
  /** Five Daily slot keys (e.g. FAJR, DHUHR). */
  slots?: string[];
  /**
   * Sunnah Rawatib — e.g.
   * `[{ slot: "BEFORE_DHUHR", count: 1 }]`
   * Valid slots: BEFORE_FAJR, BEFORE_DHUHR, AFTER_DHUHR, BEFORE_ASR,
   * AFTER_MAGHRIB, AFTER_ISHA.
   */
  sunnahSlots?: DeleteSunnahSlotItem[];
};

const deletePrayerSlot = async ({
  prayerType,
  date,
  slots,
  sunnahSlots,
}: DeletePrayerSlotPayload) => {
  const resolvedPrayerType = resolvePrayerType(prayerType);
  const data: {
    date: string;
    slots?: string[];
    sunnahSlots?: DeleteSunnahSlotItem[];
  } = { date };

  if (sunnahSlots && sunnahSlots.length > 0) {
    data.sunnahSlots = sunnahSlots;
  } else if (slots && slots.length > 0) {
    data.slots = slots;
  }

  const response = await api.delete(
    `api/goal-cycles/current/prayer-goals/${resolvedPrayerType}/log/items`,
    { data },
  );
  return response.data;
};

export const useDeletePrayerSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePrayerSlot,
    onSuccess: (_data, variables) => {
      const prayerType = resolvePrayerType(variables.prayerType);
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
