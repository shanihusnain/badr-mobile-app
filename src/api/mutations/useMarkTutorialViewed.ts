import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import type { TutorialsData } from "@/src/api/queries/useGetTutorials";

const markTutorialViewed = async (key: string): Promise<TutorialsData> => {
  const response = await api.post(`api/more/tutorials/${key}/viewed`);
  return response.data?.data;
};

export const useMarkTutorialViewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTutorialViewed,
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["tutorials"], data);
      } else {
        void queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      }
    },
  });
};
