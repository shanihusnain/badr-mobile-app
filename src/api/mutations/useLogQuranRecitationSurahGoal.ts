import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type LogQuranRecitationSurahEntry = {
  /** Minutes for this single sitting. Optional — 0 is allowed by the API. */
  durationMinutes?: number;
};

export type LogQuranRecitationSurahPayload = {
  /** Backend type — defaults to RECITATION_SURAH. */
  quranGoalType?: string;
  date: string;
  /** 24h HH:mm — optional; omit when the wizard skipped start time. */
  sessionStartTime?: string;
  itemType?: "SURAH";
  /** Quran surah number (1–114). */
  itemNumber: number;
  /**
   * One entry per sitting logged this session.
   * Array length is the recitation count.
   */
  recitations: LogQuranRecitationSurahEntry[];
};

const logQuranRecitationSurah = async ({
  quranGoalType = "RECITATION_SURAH",
  date,
  sessionStartTime,
  itemType = "SURAH",
  itemNumber,
  recitations,
}: LogQuranRecitationSurahPayload) => {
  const type = resolveQuranType(quranGoalType);
  const body: Record<string, unknown> = {
    date,
    itemType,
    itemNumber,
    recitations,
  };
  if (sessionStartTime) {
    body.sessionStartTime = sessionStartTime;
  }

  const response = await api.post(
    `api/goal-cycles/current/quran-goals/${type}/log`,
    body,
  );
  return response.data;
};

export const useLogQuranRecitationSurahGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logQuranRecitationSurah,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quran-goal-frame"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-detail"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["quran-goal-insights"] });
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["goal-cycle-category-goals"],
      });
      showToast(
        "success",
        data?.message ?? data?.data?.message ?? "Recitation logged successfully",
      );
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to log recitation"),
      );
    },
  });
};
