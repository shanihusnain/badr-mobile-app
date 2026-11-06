import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

export type HomeDismissedCard =
  | "PRAYER_TIMES"
  | "GREETING"
  | "FASTING_CALENDAR_INTRO"
  | "FASTING_CALENDAR_LEGEND"
  | "TIME_SPENT_INTRO";

const swipeGreetingCard = async (card: HomeDismissedCard | string) => {
  const response = await api.put(`api/home/dismissed-cards`, {
    card,
  });
  return response.data;
};

export const useSwipeGreetingCardHomeScreen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: swipeGreetingCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
