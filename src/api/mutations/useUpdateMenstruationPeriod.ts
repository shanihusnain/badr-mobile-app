import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { showToast, getApiErrorMessage } from "@/src/config/toastConfig";
import { SaveMenstruationPayload, SaveMenstruationResponse } from "./useSaveMenstruationPeriod";

export type UpdateMenstruationPayload = SaveMenstruationPayload;

const updateMenstruationPeriod = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateMenstruationPayload;
}): Promise<SaveMenstruationResponse> => {
  // Backend uses POST to the base endpoint with menstruationPeriodId in the body
  const response = await api.post(`api/menstruation-periods`, { ...payload, menstruationPeriodId: id });
  return response.data;
};

export const useUpdateMenstruationPeriod = () => {
  return useMutation({
    mutationFn: updateMenstruationPeriod,
    mutationKey: ["updateMenstruationPeriod"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Menstruation period updated successfully");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to update menstruation period"));
    },
  });
};
