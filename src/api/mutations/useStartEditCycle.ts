import { useMutation } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: ({ startDate }: { startDate: string }) =>
      useStartEditCycle({ startDate }),
    onSuccess: (response) => {
      showToast("success", response.message);
    },
    onError: (error: any) => {
      showToast("error", error.response?.data?.message);
    },
  });
};
