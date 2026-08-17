import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type LogTahiyatAlMasjidPayload = {
  date: string;
  count: number;
  prayedAfterEntering: boolean;
  startTime: string;
  durationMinutes: number;
  notes?: string;
};

const logTahiyatAlMasjid = async (payload: LogTahiyatAlMasjidPayload) => {
  const response = await api.post(
    "api/goal-cycles/current/prayer-goals/TAHIYYAT_AL_MASJID/log",
    payload,
  );
  return response.data;
};

export const useLogTahiyatAlMasjidGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logTahiyatAlMasjid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
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
