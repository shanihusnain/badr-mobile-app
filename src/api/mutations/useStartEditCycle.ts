import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { showToast } from "@/src/config/toastConfig";

const useStartEditCycle = async ({ startDate }: { startDate: string }) => {
  try {
    const response = await api.post("api/goal-cycles/init", {
      startDate,
    });

    console.log("================================================");
    console.log(response.data);
    console.log("================================================");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useStartEditCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startDate }: { startDate: string }) =>
      useStartEditCycle({ startDate }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
      queryClient.invalidateQueries({ queryKey: ["all-fasting-goals"] });
      queryClient.invalidateQueries({ queryKey: ["fasting-calendar-preview"] });
      showToast("success", response.message);
    },
    onError: (error: any) => {
      showToast("error", error.response?.data?.message);
    },
  });
};
