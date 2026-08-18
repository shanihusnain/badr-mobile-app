import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import type { MissedPastPrayerSlotKey } from "@/src/api/queries/useGetMissedPastPrayersSlot";

export type LogMissedPastPrayerSlot = {
  prayerSlot: MissedPastPrayerSlotKey;
  count: number;
};

export type LogMissedPastPrayersPayload = {
  date: string; // YYYY-MM-DD
  slots: LogMissedPastPrayerSlot[];
  startTime: string; // HH:mm (24h)
  durationMinutes: number;
};

const logMissedPastPrayers = async (payload: LogMissedPastPrayersPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/MISSED_PAST_PRAYERS/log",
    payload,
  );
  return response.data;
};

export const useLogMissedPastPrayersGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logMissedPastPrayers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      queryClient.invalidateQueries({ queryKey: ["missed-past-prayers-slot"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-insights"] });
      showToast("success", "Prayer logged successfully");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to log prayer"),
      );
    },
  });
};
