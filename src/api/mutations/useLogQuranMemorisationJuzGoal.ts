import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type LogQuranMemorisationJuzPayload = {
  /** Backend type — defaults to MEMORIZATION_JUZ. */
  quranGoalType?: string;
  date: string;
  /** 24h HH:mm */
  sessionStartTime: string;
  durationMinutes: number;
  itemType?: "JUZ";
  /** Quran juz number (1–30) */
  itemNumber: number;
  fromAyah: number;
  toAyah: number;
};

const logQuranMemorisationJuz = async ({
  quranGoalType = "MEMORIZATION_JUZ",
  date,
  sessionStartTime,
  durationMinutes,
  itemType = "JUZ",
  itemNumber,
  fromAyah,
  toAyah,
}: LogQuranMemorisationJuzPayload) => {
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

export const useLogQuranMemorisationJuzGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logQuranMemorisationJuz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-detail"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-insights"] });
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
      showToast("success", "Memorisation logged successfully");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to log memorisation"),
      );
    },
  });
};
