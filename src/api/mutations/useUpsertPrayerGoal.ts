import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type FiveDailyConfig = {
  fajrTarget: number;
  dhuhrTarget: number;
  asrTarget: number;
  maghribTarget: number;
  ishaTarget: number;
  jumuahTarget: number;
  congregationalTracking: boolean;
};

export type SunnahConfig = {
  beforeFajrTarget: number;
  beforeDhuhrTarget: number;
  afterDhuhrTarget: number;
  afterDhuhrRakahOption: number;
  beforeAsrEnabled: boolean;
  beforeAsrTarget: number;
  beforeAsrRakahOption: number;
  afterMaghribTarget: number;
  afterIshaTarget: number;
};

export type QiyamConfig = {
  isFlexible: boolean;
  unitTarget: number;
  trackTahajjud: boolean;
};

export type UpsertPrayerGoalPayload = {
  prayerType: string;
  isActive: boolean;
  targetCount?: number;
  targetDays?: number;
  sliderValue?: number;
  fiveDailyConfig?: FiveDailyConfig;
  sunnahConfig?: SunnahConfig;
  qiyamConfig?: QiyamConfig;
};

const upsertPrayerGoal = async (payload: UpsertPrayerGoalPayload) => {
  const { prayerType, ...body } = payload;
  const response = await api.put(
    `api/goal-cycles/current/prayer-goals/${prayerType}`,
    { prayerType, ...body },
  );
  return response.data;
};

export const useUpsertPrayerGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertPrayerGoal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
      console.log("data", data);
      showToast("success", data?.data?.message ?? "Goal saved");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to save goal"));
    },
  });
};
