import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "..";
import { showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

/**
 * RECITATION_COMPLETION log body — shape is implied by which fields are sent
 * (no separate `mode` field):
 *   Full     fromItemNumber + toItemNumber
 *   Partial  itemNumber + fromAyah + toAyah
 *   Both     all five
 */
export type LogQuranRecitationCompletionPayload = {
  quranGoalType?: string;
  date: string;
  /** 24h HH:mm — optional. */
  sessionStartTime?: string;
  durationMinutes?: number;
  /** Full / Both — inclusive whole-juz range. */
  fromItemNumber?: number;
  toItemNumber?: number;
  /** Partial / Both — open juz number. */
  itemNumber?: number;
  fromAyah?: number;
  toAyah?: number;
};

export const logQuranRecitationCompletion = async ({
  quranGoalType = "RECITATION_COMPLETION",
  date,
  sessionStartTime,
  durationMinutes,
  fromItemNumber,
  toItemNumber,
  itemNumber,
  fromAyah,
  toAyah,
}: LogQuranRecitationCompletionPayload) => {
  const type = resolveQuranType(quranGoalType);
  const body: Record<string, unknown> = { date };

  if (sessionStartTime) {
    body.sessionStartTime = sessionStartTime;
  }
  if (typeof durationMinutes === "number") {
    body.durationMinutes = durationMinutes;
  }

  if (
    typeof fromItemNumber === "number" &&
    typeof toItemNumber === "number"
  ) {
    body.fromItemNumber = fromItemNumber;
    body.toItemNumber = toItemNumber;
  }

  if (
    typeof itemNumber === "number" &&
    typeof fromAyah === "number" &&
    typeof toAyah === "number"
  ) {
    body.itemNumber = itemNumber;
    body.fromAyah = fromAyah;
    body.toAyah = toAyah;
  }

  const response = await api.post(
    `api/goal-cycles/current/quran-goals/${type}/log`,
    body,
  );
  return response.data;
};

export const useLogQuranRecitationCompletionGoal = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["quran-goal-frame"] });
    queryClient.invalidateQueries({ queryKey: ["quran-goal-detail"] });
    queryClient.invalidateQueries({ queryKey: ["quran-goal-achievements"] });
    queryClient.invalidateQueries({ queryKey: ["quran-goal-insights"] });
    queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
    queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
    queryClient.invalidateQueries({
      queryKey: ["goal-cycle-category-goals"],
    });
  };

  return useMutation({
    mutationFn: logQuranRecitationCompletion,
    onSuccess: (data) => {
      invalidate();
      const payload = data as {
        message?: string;
        data?: { message?: string };
      };
      const message =
        (typeof payload?.message === "string" && payload.message.trim()) ||
        (typeof payload?.data?.message === "string" &&
          payload.data.message.trim()) ||
        "";
      if (message) {
        showToast("success", message);
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { message?: string | string[] }
          | undefined;
        if (Array.isArray(data?.message) && data.message.length > 0) {
          showToast("error", data.message.join(", "));
          return;
        }
        if (typeof data?.message === "string" && data.message.trim()) {
          showToast("error", data.message.trim());
        }
      }
    },
  });
};
