import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { SadaqahGoalApiItem } from "@/src/utils/sadaqahGoalMap";

export type CyclePrayerGoal = {
  id: string;
  prayerType: string;
  targetCount?: number | null;
  baseTargetCount?: number | null;
  targetDays?: number | null;
  completedCount?: number;
  congregationalTracking?: boolean;
  isActive: boolean;
  fiveDailyConfig?: {
    fajrTarget?: number;
    dhuhrTarget?: number;
    asrTarget?: number;
    maghribTarget?: number;
    ishaTarget?: number;
    jumuahTarget?: number;
    congregationalTracking?: boolean;
  } | null;
  sunnahRawatibConfig?: {
    beforeFajrTarget?: number;
    beforeDhuhrTarget?: number;
    afterDhuhrTarget?: number;
    afterDhuhrRakahOption?: number;
    beforeAsrEnabled?: boolean;
    beforeAsrTarget?: number;
    beforeAsrRakahOption?: number;
    afterMaghribTarget?: number;
    afterIshaTarget?: number;
  } | null;
  qiyamConfig?: {
    isFlexible?: boolean;
    unitTarget?: number;
    trackTahajjud?: boolean;
  } | null;
};

export type CycleQuranGoalItem = {
  id: string;
  itemType: string;
  itemNumber: number;
  surahName?: string | null;
  verseStart?: number | null;
  verseEnd?: number | null;
  targetCount?: number;
  completedCount?: number;
  status?: string;
};

export type CycleQuranGoal = {
  id: string;
  quranGoalType: string;
  trackingMetric?: string;
  targetValue?: string | number | null;
  completedValue?: string | number | null;
  frequency?: string;
  isActive: boolean;
  goalItems?: CycleQuranGoalItem[];
};

export type CycleFastingPlan = {
  id: string;
  plannedDate: string;
  fastingType: string;
  status?: string;
};

export type CycleFastingGoal = {
  id: string;
  fastingType: string;
  targetCount?: number | null;
  completedCount?: number;
  dawoodStartDay?: number | null;
  isActive: boolean;
  fastingPlans?: CycleFastingPlan[];
  plannedDates?: string[];
};

export type CycleSadaqahGoal = SadaqahGoalApiItem & {
  id?: string;
};

export type GoalCycleDetail = {
  id: string;
  startDate: string;
  endDate: string;
  status?: string;
  totalDays?: number;
  committedAt?: string | null;
  prayerGoals?: CyclePrayerGoal[];
  quranGoals?: CycleQuranGoal[];
  fastingGoals?: CycleFastingGoal[];
  sadaqahGoals?: CycleSadaqahGoal[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Normalize GET api/goal-cycles/:id → cycle detail */
export function normalizeGoalCycleResponse(
  axiosData: unknown,
): GoalCycleDetail | null {
  const root = asRecord(axiosData);
  const payload = asRecord(root?.data) ?? root;
  if (!payload || typeof payload.id !== "string") return null;
  if (typeof payload.startDate !== "string") return null;
  if (typeof payload.endDate !== "string") return null;
  return payload as unknown as GoalCycleDetail;
}

const getGoalCycleById = async (
  goalCycleId: string,
): Promise<GoalCycleDetail | null> => {
  const response = await api.get(`api/goal-cycles/${goalCycleId}`);
  return normalizeGoalCycleResponse(response.data);
};

export const useGetGoalCycleById = (
  goalCycleId: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["goal-cycle", goalCycleId],
    queryFn: () => getGoalCycleById(goalCycleId!),
    enabled: (options?.enabled ?? true) && !!goalCycleId,
  });
};
