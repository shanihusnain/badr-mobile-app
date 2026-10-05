import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../index";
import { showToast, getApiErrorMessage } from "@/src/config/toastConfig";
import { invalidateMenstruationRelatedQueries } from "./invalidateMenstruationCaches";

export type DeleteMenstruationResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: { message?: string; id?: string };
};

const deleteMenstruationPeriod = async (
  id: string,
): Promise<DeleteMenstruationResponse> => {
  const response = await api.delete(`api/menstruation-periods/${id}`);
  return response.data;
};

export const useDeleteMenstruationPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMenstruationPeriod,
    mutationKey: ["deleteMenstruationPeriod"],
    onSuccess: (data) => {
      showToast(
        "success",
        data?.message ??
          data?.data?.message ??
          "Menstruation period deleted",
      );
      invalidateMenstruationRelatedQueries(queryClient);
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to delete menstruation period"),
      );
    },
  });
};
