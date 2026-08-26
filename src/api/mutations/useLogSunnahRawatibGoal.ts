import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

/** Sunnah Rawatib slot keys expected by the log API. */
export type SunnahRawatibSlot =
  | "BEFORE_FAJR"
  | "BEFORE_DHUHR"
  | "AFTER_DHUHR"
  | "BEFORE_ASR"
  | "AFTER_MAGHRIB"
  | "AFTER_ISHA";

export type LogSunnahRawatibPayload = {
  date: string; // YYYY-MM-DD (same as other prayer logs)
  sunnahSlot: SunnahRawatibSlot;
  /** Prayer count when the slot allows 1 or 2 (e.g. After Dhuhr / Before Asr). */
  count?: number;
  startTime?: string; // HH:mm (24h)
  durationMinutes?: number;
};

const logSunnahRawatib = async (payload: LogSunnahRawatibPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/SUNNAH_RAWATIB/log",
    payload,
  );
  return response.data;
};

export const useLogSunnahRawatibGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logSunnahRawatib,
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
