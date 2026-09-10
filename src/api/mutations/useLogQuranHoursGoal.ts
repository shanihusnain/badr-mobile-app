import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type LogQuranHoursPayload = {
  /** Backend type, e.g. LISTENING / TAJWEED (or UI id — resolved). */
  quranGoalType: string;
  date: string;
  /** 24h HH:mm */
  sessionStartTime: string;
  durationMinutes: number;
};

const logQuranHours = async ({
  quranGoalType,
  date,
  sessionStartTime,
  durationMinutes,
}: LogQuranHoursPayload) => {
  const type = resolveQuranType(quranGoalType);
  const response = await api.post(
    `api/goal-cycles/current/quran-goals/${type}/log`,
    {
      date,
      sessionStartTime,
      durationMinutes,
    },
  );
  return response.data;
};

export const useLogQuranHoursGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logQuranHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
      showToast("success", "Session logged successfully");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to log session"),
      );
    },
  });
};
