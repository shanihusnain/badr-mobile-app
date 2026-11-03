import { useQuery } from "@tanstack/react-query";
import { api } from "..";

const getTimeSpent = async ({
  period,
  category,
  endDate,
}: {
  period: string;
  category: string;
  endDate: string;
}) => {
  try {
    const response = await api.get(
      `api/home/time-spent?period=${period}&category=${category}&endDate=${endDate}`,
    );
    return response.data?.data;
  } catch (error) {
    throw error;
  }
};

export const useGetHomeScreenTimeSpent = ({
  period,
  category,
  endDate,
}: {
  period: string;
  category: string;
  endDate: string;
}) => {
  return useQuery({
    queryKey: ["home-screen-time-spent", period, category, endDate],
    queryFn: () =>
      getTimeSpent({
        period,
        category,
        endDate,
      }),
    enabled: !!endDate,
  });
};
