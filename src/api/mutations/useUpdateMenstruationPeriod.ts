import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSaveMenstruationPeriod,
  type SaveMenstruationPayload,
  type SaveMenstruationResponse,
} from "./useSaveMenstruationPeriod";
import { invalidateMenstruationRelatedQueries } from "./invalidateMenstruationCaches";
import { api } from "../index";
import { showToast, getApiErrorMessage } from "@/src/config/toastConfig";

export type UpdateMenstruationPayload = SaveMenstruationPayload;

/**
 * Correct an existing period by `id` via the unified POST endpoint.
 * Prefer `useSaveMenstruationPeriod` with `{ id, … }` for new call sites.
 */
const updateMenstruationPeriod = async ({
  id,
  payload,
}: {
  id: string;
  payload: Omit<UpdateMenstruationPayload, "id">;
}): Promise<SaveMenstruationResponse> => {
  const response = await api.post(`api/menstruation-periods`, {
    ...payload,
    id,
  });
  return response.data;
};

export const useUpdateMenstruationPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMenstruationPeriod,
    mutationKey: ["updateMenstruationPeriod"],
    onSuccess: (data) => {
      showToast(
        "success",
        data?.message ?? "Menstruation period updated successfully",
      );
      invalidateMenstruationRelatedQueries(queryClient);
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to update menstruation period"),
      );
      invalidateMenstruationRelatedQueries(queryClient);
    },
  });
};

/** @deprecated Prefer `useSaveMenstruationPeriod` with `{ id, … }`. */
export { useSaveMenstruationPeriod };
