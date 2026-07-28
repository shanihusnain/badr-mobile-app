import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { showToast } from "@/src/config/toastConfig";

type ToggleQuranGoalArgs = {
  quranGoalType: string;
  isActive: boolean;
};

const toggleQuranGoalByType = async ({
  quranGoalType,
  isActive,
}: ToggleQuranGoalArgs) => {
  const response = await api.patch(
    `api/goal-cycles/current/quran-goals/${quranGoalType}/toggle`,
    { isActive },
  );
  return response.data;
};

export const useToggleQuranGoalByType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleQuranGoalByType,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-quran-goals"] });
      queryClient.invalidateQueries({
        queryKey: ["quran-goal-detail", variables.quranGoalType],
      });
    },
    onError: (error: any) => {
      console.log("now we are in error block", error);
      showToast("error", error.response?.data?.message);
    },
  });
};
