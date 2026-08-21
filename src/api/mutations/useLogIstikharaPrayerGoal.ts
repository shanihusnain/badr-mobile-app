import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type LogIstikharaPrayerPayload = {
  date: string;
  count: number;
  startTime: string; // HH:mm (24h)
  durationMinutes: number;
};

const logIstikharaPrayer = async (payload: LogIstikharaPrayerPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/ISTIKHARA/log",
    payload,
  );
  return response.data;
};

export const useLogIstikharaPrayerGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logIstikharaPrayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-frame"] });
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
