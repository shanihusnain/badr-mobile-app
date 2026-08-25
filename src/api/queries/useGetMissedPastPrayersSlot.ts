import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type MissedPastPrayerSlotKey =
  | "FAJR"
  | "DHUHR"
  | "ASR"
  | "MAGHRIB"
  | "ISHA";

export type MissedPastPrayerSlotProgress = {
  completed: number;
  target: number;
};

export type MissedPastPrayersSlotData = {
  slotProgress: Record<MissedPastPrayerSlotKey, MissedPastPrayerSlotProgress>;
  slotTarget: number;
  targetCount: number;
};

const getPastPrayersSlots = async (
  date?: string,
): Promise<MissedPastPrayersSlotData | null> => {
  const response = await api.get(
    "api/goal-cycles/current/prayer-goals/MISSED_PAST_PRAYERS/slot-progress",
    {
      params: date ? { date } : undefined,
    },
  );
  console.log("response of missed past prayer slot data", response.data);
  return response.data?.data ?? null;
};

export const useGetMissedPastPrayersSlot = (date?: string) => {
  return useQuery({
    queryKey: ["missed-past-prayers-slot", date ?? "cycle"],
    queryFn: () => getPastPrayersSlots(date),
  });
};
