import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type LogDuhaPrayerPayload = {
  date: string;
  count: number;
  startTime: string; // HH:mm (24h)
  durationMinutes: number;
};

const logDuhaPrayer = async (payload: LogDuhaPrayerPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/DUHA/log",
    payload,
  );
  return response.data;
};

export const useLogDuhaPrayerGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logDuhaPrayer,
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
