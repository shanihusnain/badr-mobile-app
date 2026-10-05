import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type LogQuranMemorisationHizbPayload = {
  /** Backend type — defaults to MEMORIZATION_HIZB. */
  quranGoalType?: string;
  date: string;
  /** 24h HH:mm */
  sessionStartTime: string;
  durationMinutes: number;
  itemType?: "HIZB";
  /** Quran hizb number (1–60) */
  itemNumber: number;
  fromAyah: number;
  toAyah: number;
};

const logQuranMemorisationHizb = async ({
  quranGoalType = "MEMORIZATION_HIZB",
  date,
  sessionStartTime,
  durationMinutes,
  itemType = "HIZB",
  itemNumber,
  fromAyah,
  toAyah,
}: LogQuranMemorisationHizbPayload) => {
  const type = resolveQuranType(quranGoalType);
  const response = await api.post(
    `api/goal-cycles/current/quran-goals/${type}/log`,
    {
      date,
      sessionStartTime,
      durationMinutes,
      itemType,
      itemNumber,
      fromAyah,
      toAyah,
    },
  );
  return response.data;
};

export const useLogQuranMemorisationHizbGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logQuranMemorisationHizb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-detail"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-insights"] });
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["goal-cycle-category-goals"],
      });
      // showToast("success", "Memorisation logged successfully");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to log memorisation"),
      );
    },
  });
};
