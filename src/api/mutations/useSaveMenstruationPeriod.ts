import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../index";
import { showToast, getApiErrorMessage } from "@/src/config/toastConfig";
import { getAccessToken } from "@/src/storage/tokenStorage";

export type SaveMenstruationPayload = {
  startDate: string;
  startPrayer: string;
  isOngoing: boolean;
  endDate?: string;
  endPrayer?: string;
};

export type SaveMenstruationResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
};

const saveMenstruationPeriod = async (
  payload: SaveMenstruationPayload
): Promise<SaveMenstruationResponse> => {
  console.log("Saving menstruation period with payload:", payload);
  const response = await api.post("api/menstruation-periods", payload);
  console.log("Response from saveMenstruationPeriod:", response.data);
  return response.data;
};
const  token = getAccessToken();
console.log("Access token in useSaveMenstruationPeriod:", token);

export const useSaveMenstruationPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMenstruationPeriod,
    mutationKey: ["saveMenstruationPeriod"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Menstruation period saved successfully");
      // Invalidate so the next visit to the screen refetches fresh data
      queryClient.invalidateQueries({ queryKey: ["getMe"] });
      queryClient.invalidateQueries({ queryKey: ["menstruationPeriod"] });
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to save menstruation period"));
    },
  });
};
