import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type LogTahiyatAlWudhuPayload = {
  date: string; // YYYY-MM-DD
  count: number;
  prayedAfterWudhu: boolean;
  startTime: string; // HH:mm (24h)
  durationMinutes: number;
  notes?: string;
};

const logTahiyatAlWudhu = async (payload: LogTahiyatAlWudhuPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/TAHIYYAT_AL_WUDHU/log",
    payload,
  );
  return response.data;
};

export const useLogTahiyatAlWudhuGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logTahiyatAlWudhu,
    onSuccess: () => {
      // Green card (frame/week) and dashboard should update after logging.
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

