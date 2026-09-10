import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { showToast } from "@/src/config/toastConfig";

type TogglePrayerGoalArgs = {
  prayerType: string;
  isActive: boolean;
};

const togglePrayerGoalByType = async ({
  prayerType,
  isActive,
}: TogglePrayerGoalArgs) => {
  const response = await api.patch(
    `api/goal-cycles/current/prayer-goals/${prayerType}/toggle`,
    { isActive },
  );
  return response.data;
};

export const useTogglePrayerGoalByType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePrayerGoalByType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
    },
    onError: (error: any) => {
      showToast("error", error.response?.data?.message);
    },
  });
};
