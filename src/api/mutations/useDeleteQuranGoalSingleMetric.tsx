import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

const deleteSingleQuranGoalMetric = async (
  quranGoalType: string,
  itemtype: string,
  itemNumber: string | number,
) => {
  try {
    const response = await api.delete(
      `api/goal-cycles/current/quran-goals/${quranGoalType}?itemType=${itemtype}&itemNumber=${itemNumber}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const useDeleteQuranGoalSingleMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quranGoalType,
      itemtype,
      itemNumber,
    }: {
      quranGoalType: string;
      itemtype: string;
      itemNumber: string | number;
    }) => deleteSingleQuranGoalMetric(quranGoalType, itemtype, itemNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-goals"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
