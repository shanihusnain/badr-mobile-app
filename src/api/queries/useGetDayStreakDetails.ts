import { api } from "..";
import { useQuery } from "@tanstack/react-query";

const dayStreakDetails = async ({ date }: { date: string }) => {
  try {
    const response = await api.get(`api/home/streak?date=${date}`);
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const useGetDayStreakDetails = (date: string) => {
  return useQuery({
    queryKey: ["dayStreakDetails", date],
    queryFn: () => dayStreakDetails({ date }),
  });
};
