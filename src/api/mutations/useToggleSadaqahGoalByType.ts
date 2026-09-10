import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";

type ToggleSadaqahGoalArgs = {
  sadaqahType: string;
  isActive: boolean;
};

const toggleSadaqahGoalByType = async ({
  sadaqahType,
  isActive,
}: ToggleSadaqahGoalArgs) => {
  const type = resolveSadaqahType(sadaqahType);
  const response = await api.patch(
    `api/goal-cycles/current/sadaqah-goals/${type}/toggle`,
    { isActive },
  );
  return response.data;
};

export const useToggleSadaqahGoalByType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleSadaqahGoalByType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-sadaqah-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
    },
    onError: (error: any) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to update sadaqah goal"),
      );
    },
  });
};
