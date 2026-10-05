import { useQuery } from "@tanstack/react-query";
import { api } from "../index";
import type { MenstruationPeriod } from "./useGetMenstruationPeriod";

export type MenstruationPeriodsListData = {
  total: number;
  periods: MenstruationPeriod[];
};

export type MenstruationPeriodsListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: MenstruationPeriodsListData;
};

export const MENSTRUATION_PERIODS_LIST_QUERY_KEY = [
  "menstruationPeriods",
] as const;

const getMenstruationPeriods =
  async (): Promise<MenstruationPeriodsListResponse> => {
    const response = await api.get("api/menstruation-periods");
    return response.data;
  };

/** History list — newest first by startDate. At most one `isOngoing: true`. */
export const useGetMenstruationPeriods = (enabled = true) => {
  return useQuery({
    queryKey: MENSTRUATION_PERIODS_LIST_QUERY_KEY,
    queryFn: getMenstruationPeriods,
    enabled,
    staleTime: 0,
    refetchOnMount: true,
  });
};
