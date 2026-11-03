import { useMutation } from "@tanstack/react-query";
import { api } from "..";
import { showToast } from "@/src/config/toastConfig";

const deleteDayEntry = async ({ id }: { id: string }) => {
  try {
    const response = await api.delete(`api/home/my-day/entries/${id}`);
    return response?.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const useSwipetoDeleteDayEntry = () => {
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDayEntry({ id }),
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Entry deleted successfully");
    },
  });
};
