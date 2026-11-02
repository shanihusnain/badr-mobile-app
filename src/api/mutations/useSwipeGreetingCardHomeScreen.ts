import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

const swipeGreetingCard = async (cardType: string) => {
  try {
    const response = await api.put(`api/home/dismissed-cards`, {
      cardType,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
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
