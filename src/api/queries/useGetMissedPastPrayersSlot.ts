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

const getPastPrayersSlots =
  async (): Promise<MissedPastPrayersSlotData | null> => {
    const response = await api.get(
      "api/goal-cycles/current/prayer-goals/MISSED_PAST_PRAYERS/slot-progress",
    );
    return response.data?.data ?? null;
  };

export const useGetMissedPastPrayersSlot = () => {
  return useQuery({
    queryKey: ["missed-past-prayers-slot"],
    queryFn: getPastPrayersSlots,
  });
};
