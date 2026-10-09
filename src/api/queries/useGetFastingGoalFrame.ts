import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type FastingGoalFrameStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | string;

export type FastingGoalFrameDayState =
  | "NOT_PLANNED"
  | "PLANNED"
  | "UPCOMING"
  | "DUE"
  | "COMPLETED"
  | "MISSED"
  | "EXCUSED"
  | "MENSTRUATING"
  | "COVERED_EARLY"
  | "MADE_UP"
  | string;

export type FastingGoalFrameDay = {
  date: string;
  dayLabel: string;
  isToday: boolean;
  isPlanned: boolean;
  state: FastingGoalFrameDayState;
  canLog: boolean;
  canDelete: boolean;
  /**
   * Day is booked by another fasting goal (Mon/Thu, White Days, etc.).
   * Drives Today Disabled / Disabled Day (past) in Missed Ramadan Figma.
   */
  bookedForOtherGoal?: boolean;
  isRunStart?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  /** Missed Ramadan: planned date this kept day covers */
  coversDate?: string | null;
  /** Missed Ramadan: day the make-up/early fast was kept */
  keptOn?: string | null;
};

export type FastingGoalFramePill = {
  state?: string | null;
  label?: string | null;
};

export type FastingGoalFrameItem = {
  title?: string | null;
  pill?: FastingGoalFramePill | null;
  canLog?: boolean;
  insightsAvailable?: boolean;
  loggableDates?: string[];
  /** Missed Ramadan: future planned dates that can still be fasted early */
  earlyLoggableDates?: string[];
  /** Missed Ramadan: missed planned dates that can still be made up */
  makeUpLoggableDates?: string[];
};

export type FastingGoalFrameGoal = {
  fastingGoalId?: string | null;
  isActive?: boolean;
  target?: number | null;
  targetLabel?: string | null;
  completed?: number | null;
  missed?: number | null;
  excused?: number | null;
  remaining?: number | null;
  achievementPct?: number | null;
  status?: FastingGoalFrameStatus | null;
  justCompleted?: boolean;
};

export type FastingGoalFrameStreak = {
  count?: number | null;
  unit?: string | null;
  label?: string | null;
};

export type FastingGoalFrameMotivation = {
  key?: string | null;
  message?: string | null;
};

export type FastingGoalFrameWeek = {
  weekNumber: number;
  totalWeeks: number;
  label?: string | null;
  rangeLabel?: string | null;
  weekStart: string;
  weekEnd: string;
  hasPrevious?: boolean;
  hasNext?: boolean;
  days: FastingGoalFrameDay[];
  totalFasts?: number | null;
  totalLabel?: string | null;
  streak?: FastingGoalFrameStreak | null;
  comparison?: unknown;
  motivation?: FastingGoalFrameMotivation | null;
};

export type FastingGoalFrameCycle = {
  id?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  dayNumber?: number | null;
  totalDays?: number | null;
  isEnded?: boolean;
  weekNumber?: number | null;
  totalWeeks?: number | null;
};

export type FastingGoalFrameData = {
  fastingType: string;
  title?: string | null;
  imageUrl?: string | null;
  goal?: FastingGoalFrameGoal | null;
  items?: FastingGoalFrameItem[];
  cycle: FastingGoalFrameCycle;
  week: FastingGoalFrameWeek;
  articles?: unknown[];
};

export const fastingGoalFrameQueryKey = (
  fastingType: string,
  week?: number | "current",
) => ["fasting-goal-frame", fastingType, week ?? "current"] as const;

export const getFastingGoalFrame = async (
  fastingType: string,
  week?: number,
): Promise<FastingGoalFrameData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}/frame`,
    {
      params: week != null ? { week } : undefined,
    },
  );
  console.log(
    "response of the fasting goal frame api",
    JSON.stringify(response.data, null, 2),
  );
  return response.data?.data ?? null;
};

export const useGetFastingGoalFrame = (
  fastingTypeInput: string | null | undefined,
  options?: { enabled?: boolean; weekNumber?: number },
) => {
  const fastingType = fastingTypeInput
    ? resolveFastingType(fastingTypeInput)
    : "";
  const enabled = !!fastingType && (options?.enabled ?? true);

  return useQuery({
    queryKey: fastingGoalFrameQueryKey(
      fastingType,
      options?.weekNumber ?? "current",
    ),
    queryFn: () => getFastingGoalFrame(fastingType, options?.weekNumber),
    enabled,
    placeholderData: keepPreviousData,
  });
};
