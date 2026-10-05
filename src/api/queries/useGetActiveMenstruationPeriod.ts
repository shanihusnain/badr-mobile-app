import { useQuery } from "@tanstack/react-query";
import { api } from "../index";
import type { MenstruationPeriod } from "./useGetMenstruationPeriod";

export type ActiveMenstruationPeriodResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  /** Open period, or `null` when nothing is ongoing. */
  data: MenstruationPeriod | null;
};

export const ACTIVE_MENSTRUATION_QUERY_KEY = [
  "menstruationPeriod",
  "active",
] as const;

const getActiveMenstruationPeriod =
  async (): Promise<ActiveMenstruationPeriodResponse> => {
    const response = await api.get("api/menstruation-periods/active");
    return response.data;
  };

/**
 * Single source of truth for Start vs End button state.
 * Call on mount and after every menstruation mutation.
 */
export const useGetActiveMenstruationPeriod = (enabled = true) => {
  return useQuery({
    queryKey: ACTIVE_MENSTRUATION_QUERY_KEY,
    queryFn: getActiveMenstruationPeriod,
    enabled,
    staleTime: 0,
    refetchOnMount: true,
  });
};
