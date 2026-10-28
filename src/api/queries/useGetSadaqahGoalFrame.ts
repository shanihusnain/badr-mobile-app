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

export type SadaqahGoalFrameDayLog = {
  logId?: string | null;
  amount?: number | null;
  amountDisplay?: string | null;
  category?: string | null;
  categoryLabel?: string | null;
  kaffarahSubtype?: string | null;
  kaffarahSubtypeLabel?: string | null;
  kaffarahReason?: string | null;
  durationMinutes?: number | null;
  startTime?: string | null;
  icon?: string | null;
};

export type SadaqahGoalFrameDay = {
  date: string;
  dayLabel: string;
  isToday: boolean;
  isPlanned?: boolean;
  state: SadaqahGoalFrameDayState;
  canLog?: boolean;
  canDelete?: boolean;
  /** Amount logged on this day (currency units / meal-clothing count). */
  amount?: number | null;
  amountLogged?: number | null;
  amountDisplay?: string | null;
  completedAmount?: number | null;
  isBestDay?: boolean;
  isBlurred?: boolean;
  icon?: string | null;
  categories?: string[] | null;
  minutes?: number | null;
  logs?: SadaqahGoalFrameDayLog[] | null;
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
  measure?: string | null;
  unit?: string | null;
  target?: number | null;
  targetAmount?: number | null;
  targetLabel?: string | null;
  /** Prefixed amount from API, e.g. "AED 200". */
  targetDisplay?: string | null;
  completed?: number | null;
  completedAmount?: number | null;
  completedDisplay?: string | null;
  remaining?: number | null;
  remainingAmount?: number | null;
  remainingDisplay?: string | null;
  achievementPct?: number | null;
  currencyCode?: string | null;
  status?: SadaqahGoalFrameStatus | null;
  justCompleted?: boolean;
  /** KAFFARAH nested progress (meals + clothing). */
  kaffarah?: {
    meals?: { target?: number | null; completed?: number | null } | null;
    clothing?: { target?: number | null; completed?: number | null } | null;
  } | null;
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
  total?: number | null;
  totalDisplay?: string | null;
  totalLabel?: string | null;
  totalSpent?: number | null;
  totalAmount?: number | null;
  streak?: number | SadaqahGoalFrameStreak | null;
  streakLabel?: string | null;
  /**
   * Present on weeks after week 1. Example:
   * `{ current: 28, previous: 172, delta: 144, direction: "DOWN", label: "AED 144 vs. last week" }`
   */
  comparison?: {
    current?: number | null;
    previous?: number | null;
    delta?: number | null;
    direction?: "UP" | "DOWN" | "FLAT" | string | null;
    label?: string | null;
  } | null;
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
  options?: {
    enabled?: boolean;
    weekNumber?: number;
    /** Keep prior week/type data while the key changes (week browse). */
    keepPrevious?: boolean;
  },
) => {
  const sadaqahType = sadaqahTypeInput
    ? resolveSadaqahType(sadaqahTypeInput)
    : "";
  const enabled = !!sadaqahType && (options?.enabled ?? true);
  const keepPrevious = options?.keepPrevious ?? true;

  return useQuery({
    queryKey: sadaqahGoalFrameQueryKey(
      sadaqahType,
      options?.weekNumber ?? "current",
    ),
    queryFn: () => getSadaqahGoalFrame(sadaqahType, options?.weekNumber),
    enabled,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  });
};
