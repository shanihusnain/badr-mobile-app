import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

type ToggleJournalingBehaviorParams = {
  behaviorId: string;
  isSelected: boolean;
};

const toggleJournalingBehavior = async ({
  behaviorId,
  isSelected,
}: ToggleJournalingBehaviorParams) => {
  try {
    const response = await api.patch(
      `api/journal/behaviors/${behaviorId}/selection`,
      { isSelected },
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling journaling behavior:", error);
    throw error;
  }
};

export const useToggleTheBehvaior = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleJournalingBehavior,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-behaviors"] });
    },
    onError: (error) => {
      console.error("Error toggling journaling behavior:", error);
    },
  });
};
