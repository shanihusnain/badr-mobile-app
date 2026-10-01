import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "../index";
import { showToast, getApiErrorMessage } from "@/src/config/toastConfig";
import { invalidateMenstruationRelatedQueries } from "./invalidateMenstruationCaches";
import type { MenstruationPeriod } from "@/src/api/queries/useGetMenstruationPeriod";

/**
 * Unified POST body for start / end / backfill / correct.
 * Do **not** send `isOngoing` — derived server-side.
 *
 * - Start: `{ startDate, startPrayer }`
 * - End open period: `{ endDate, endPrayer }` (+ optional start corrections)
 * - Backfill: `{ startDate, endDate, startPrayer, endPrayer }` when nothing open
 * - Correct: `{ id, …fields }`
 */
export type SaveMenstruationPayload = {
  id?: string;
  startDate?: string;
  startPrayer?: string;
  endDate?: string;
  endPrayer?: string;
};

export type SaveMenstruationResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: MenstruationPeriod;
};

/**
 * Build a DATE-safe ISO string from a local `YYYY-MM-DD`.
 * Avoids `new Date(ymd).toISOString()` which shifts the calendar day in
 * positive UTC offsets.
 */
export function toMenstruationApiDate(localDateYmd: string): string {
  const ymd = localDateYmd.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return localDateYmd;
  }
  return `${ymd}T00:00:00.000Z`;
}

export function getMenstruationApiErrorStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  const status = error.response?.status;
  return typeof status === "number" ? status : null;
}

const saveMenstruationPeriod = async (
  payload: SaveMenstruationPayload,
): Promise<SaveMenstruationResponse> => {
  const response = await api.post("api/menstruation-periods", payload);
  return response.data;
};

export const useSaveMenstruationPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMenstruationPeriod,
    mutationKey: ["saveMenstruationPeriod"],
    onSuccess: (data) => {
      showToast(
        "success",
        data?.message ?? "Menstruation period saved successfully",
      );
      invalidateMenstruationRelatedQueries(queryClient);
    },
    onError: (error) => {
      const status = getMenstruationApiErrorStatus(error);
      // 409 / 404: caller should refetch /active; still show the API message.
      if (status === 409 || status === 404) {
        invalidateMenstruationRelatedQueries(queryClient);
      }
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to save menstruation period"),
      );
    },
  });
};
