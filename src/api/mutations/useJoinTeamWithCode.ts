import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { showToast } from "@/src/config/toastConfig";

const joinTeamWithCode = async (code: String) => {
  try {
    const response = await api.post(`api/connect/teams/join`, { code });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useJoinTeamWithCode = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinTeamWithCode,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      showToast("success", data.message);
      options?.onSuccess?.();
    },
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};
