import { useQuery } from "@tanstack/react-query";
import { api } from "../index";

export type MenstruationPeriod = {
  id: string;
  startDate: string;
  startPrayer: string;
  endDate?: string | null;
  endPrayer?: string | null;
  isOngoing: boolean;
};

export type MenstruationPeriodResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: MenstruationPeriod;
};

const getMenstruationPeriod = async (id: string): Promise<MenstruationPeriodResponse> => {
  const response = await api.get(`api/menstruation-periods/${id}`);
  return response.data;
};

export const useGetMenstruationPeriod = (id?: string | null) => {
  return useQuery({
    queryKey: ["menstruationPeriod", id],
    queryFn: () => getMenstruationPeriod(id!),
    enabled: !!id,         // Only run if an ID is available
    staleTime: 0,          // Always treat data as stale so it refetches on mount
    refetchOnMount: true,
  });
};
