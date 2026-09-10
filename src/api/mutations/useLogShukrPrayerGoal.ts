import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type LogShukrPrayerPayload = {
  date: string;
  count: number;
  startTime: string; // HH:mm (24h)
  durationMinutes: number;
};

const logShukrPrayer = async (payload: LogShukrPrayerPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/SHUKR/log",
    payload,
  );
  return response.data;
};

export const useLogShukrPrayerGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logShukrPrayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-day-detail"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-insights"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
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
