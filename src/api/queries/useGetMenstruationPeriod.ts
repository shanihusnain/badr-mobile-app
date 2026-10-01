import { useQuery } from "@tanstack/react-query";
import { api } from "../index";

export type MenstruationPrayerSlot =
  | "FAJR"
  | "DHUHR"
  | "ASR"
  | "MAGHRIB"
  | "ISHA";

export type MenstruationPeriod = {
  id: string;
  userId?: string;
  cycleId?: string | null;
  startDate: string;
  startPrayer: MenstruationPrayerSlot | string;
  endDate?: string | null;
  endPrayer?: MenstruationPrayerSlot | string | null;
  /** Derived server-side — always agrees with whether `endDate` is set. */
  isOngoing: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MenstruationPeriodResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: MenstruationPeriod;
};

const getMenstruationPeriod = async (
  id: string,
): Promise<MenstruationPeriodResponse> => {
  const response = await api.get(`api/menstruation-periods/${id}`);
  return response.data;
};

export const useGetMenstruationPeriod = (id?: string | null) => {
  return useQuery({
    queryKey: ["menstruationPeriod", id],
    queryFn: () => getMenstruationPeriod(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
};
