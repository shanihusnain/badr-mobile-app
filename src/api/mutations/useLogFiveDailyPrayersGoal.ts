import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type FiveDailyPrayerSlot =
  | "FAJR"
  | "DHUHR"
  | "ASR"
  | "MAGHRIB"
  | "ISHA";

export type LogFiveDailyPrayersPayload = {
  date: string; // YYYY-MM-DD
  prayerSlot: FiveDailyPrayerSlot;
  prayedOnTime: boolean;
  wasQadha: boolean;
  wasCongregational: boolean;
  startTime: string; // HH:mm (24h)
  durationMinutes: number;
};

const logFiveDailyPrayers = async (payload: LogFiveDailyPrayersPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/FIVE_DAILY_PRAYERS/log",
    payload,
  );
  return response.data;
};

export const useLogFiveDailyPrayersGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logFiveDailyPrayers,
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
