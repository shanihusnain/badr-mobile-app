import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";

export type SadaqahGoalFrameStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | string;

export type SadaqahGoalFrameDayState =
  | "NOT_PLANNED"
  | "PLANNED"
  | "UPCOMING"
  | "DUE"
  | "COMPLETED"
  | "LOGGED"
  | "MISSED"
  | "SKIPPED"
  | string;

export type SadaqahGoalFrameDay = {
  date: string;
  dayLabel: string;
  isToday: boolean;
  isPlanned?: boolean;
  state: SadaqahGoalFrameDayState;
  canLog?: boolean;
  canDelete?: boolean;
  /** Amount logged on this day (currency units). */
  amount?: number | null;
  amountLogged?: number | null;
  completedAmount?: number | null;
  isBestDay?: boolean;
};

export type SadaqahGoalFramePill = {
  state?: string | null;
  label?: string | null;
};

export type SadaqahGoalFrameItem = {
  title?: string | null;
  pill?: SadaqahGoalFramePill | null;
  canLog?: boolean;
  insightsAvailable?: boolean;
};

export type SadaqahGoalFrameGoal = {
  sadaqahGoalId?: string | null;
  isActive?: boolean;
  target?: number | null;
  targetAmount?: number | null;
  targetLabel?: string | null;
  completed?: number | null;
  completedAmount?: number | null;
  remaining?: number | null;
  remainingAmount?: number | null;
  achievementPct?: number | null;
  currencyCode?: string | null;
  status?: SadaqahGoalFrameStatus | null;
  justCompleted?: boolean;
};

export type SadaqahGoalFrameStreak = {
  count?: number | null;
  unit?: string | null;
  label?: string | null;
};

export type SadaqahGoalFrameMotivation = {
  key?: string | null;
  message?: string | null;
};

export type SadaqahGoalFrameWeek = {
  weekNumber: number;
  totalWeeks: number;
  label?: string | null;
  rangeLabel?: string | null;
  weekStart: string;
  weekEnd: string;
  hasPrevious?: boolean;
  hasNext?: boolean;
  days: SadaqahGoalFrameDay[];
  totalSpent?: number | null;
  totalAmount?: number | null;
  streak?: SadaqahGoalFrameStreak | null;
  comparison?: unknown;
  motivation?: SadaqahGoalFrameMotivation | null;
};

export type SadaqahGoalFrameCycle = {
  id?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  dayNumber?: number | null;
  totalDays?: number | null;
  isEnded?: boolean;
  weekNumber?: number | null;
  totalWeeks?: number | null;
};

export type SadaqahGoalFrameData = {
  sadaqahType: string;
  title?: string | null;
  imageUrl?: string | null;
  goal?: SadaqahGoalFrameGoal | null;
  items?: SadaqahGoalFrameItem[];
  cycle: SadaqahGoalFrameCycle;
  week: SadaqahGoalFrameWeek;
  articles?: unknown[];
};

export const sadaqahGoalFrameQueryKey = (
  sadaqahType: string,
  week?: number | "current",
) => ["sadaqah-goal-frame", sadaqahType, week ?? "current"] as const;

export const getSadaqahGoalFrame = async (
  sadaqahType: string,
  week?: number,
): Promise<SadaqahGoalFrameData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/sadaqah-goals/${sadaqahType}/frame`,
    {
      params: week != null ? { week } : undefined,
    },
  );
  return response.data?.data ?? null;
};

export const useGetSadaqahGoalFrame = (
  sadaqahTypeInput: string | null | undefined,
  options?: { enabled?: boolean; weekNumber?: number },
) => {
  const sadaqahType = sadaqahTypeInput
    ? resolveSadaqahType(sadaqahTypeInput)
    : "";
  const enabled = !!sadaqahType && (options?.enabled ?? true);

  return useQuery({
    queryKey: sadaqahGoalFrameQueryKey(
      sadaqahType,
      options?.weekNumber ?? "current",
    ),
    queryFn: () => getSadaqahGoalFrame(sadaqahType, options?.weekNumber),
    enabled,
    placeholderData: keepPreviousData,
  });
};
