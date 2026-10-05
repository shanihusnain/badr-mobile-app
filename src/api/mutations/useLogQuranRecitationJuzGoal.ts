import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "..";
import { showToast } from "@/src/config/toastConfig";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type LogQuranRecitationJuzPayload = {
  /** Backend type — defaults to RECITATION_JUZ. */
  quranGoalType?: string;
  date: string;
  /** 24h HH:mm — optional; omit when the wizard skipped start time. */
  sessionStartTime?: string;
  /** Minutes for this verse-range sitting. */
  durationMinutes?: number;
  itemType?: "JUZ";
  /** Quran juz number (1–30). */
  itemNumber: number;
  /** 1-based position within the juz (not global ayah id). */
  fromAyah: number;
  toAyah: number;
};

export const logQuranRecitationJuz = async ({
  quranGoalType = "RECITATION_JUZ",
  date,
  sessionStartTime,
  durationMinutes,
  itemType = "JUZ",
  itemNumber,
  fromAyah,
  toAyah,
}: LogQuranRecitationJuzPayload) => {
  const type = resolveQuranType(quranGoalType);
  const body: Record<string, unknown> = {
    date,
    itemType,
    itemNumber,
    fromAyah,
    toAyah,
  };
  if (sessionStartTime) {
    body.sessionStartTime = sessionStartTime;
  }
  if (typeof durationMinutes === "number") {
    body.durationMinutes = durationMinutes;
  }

  const response = await api.post(
    `api/goal-cycles/current/quran-goals/${type}/log`,
    body,
  );
  return response.data;
};

/** Sequential verse-range posts (full range = one POST per juz). Toast once. */
export const logQuranRecitationJuzBatch = async (
  payloads: LogQuranRecitationJuzPayload[],
) => {
  if (payloads.length === 0) {
    throw new Error("No juz recitation payloads to log");
  }
  let last: unknown;
  for (const payload of payloads) {
    last = await logQuranRecitationJuz(payload);
  }
  return last;
};

export const useLogQuranRecitationJuzGoal = () => {
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
    mutationFn: (
      input: LogQuranRecitationJuzPayload | LogQuranRecitationJuzPayload[],
    ) =>
      Array.isArray(input)
        ? logQuranRecitationJuzBatch(input)
        : logQuranRecitationJuz(input),
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
      // Prefer backend `message` only — no frontend copy.
      if (axios.isAxiosError(error)) {
        console.log("error", error?.response?.data);
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
