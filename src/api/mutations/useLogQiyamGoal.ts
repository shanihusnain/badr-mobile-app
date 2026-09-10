import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type QiyamSessionType = "AFTER_ISHA" | "TAHAJJUD" | "BOTH";

export type LogQiyamPayload = {
  date: string;
  count: number;
  sessionType: QiyamSessionType;
  includesWitr: boolean;
  /** HH:mm (24h) */
  startTime?: string;
  durationMinutes?: number;
};

const logQiyam = async (payload: LogQiyamPayload) => {
  console.log("payload", payload);
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/QIYAM_AL_LAYL/log",
    payload,
  );
  return response.data;
};

export const useLogQiyamGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logQiyam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-day-detail"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-insights"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["goal-cycle-category-goals"],
      });
      showToast("success", "Prayer logged successfully");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to log prayer"));
    },
  });
};
