import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveQuranType } from "@/src/utils/quranGoalMap";

export type QuranGoalFrameStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type QuranGoalFrameDayState =
  | "BEST_DAY"
  | "LOGGED"
  | "COMPLETE"
  | "PARTIAL"
  | "MISSED"
  | "UPCOMING"
  | "EMPTY"
  | string;

/** Week-over-week delta from LISTENING / TAJWEED frame. */
export type QuranGoalFrameVsLastWeek = {
  direction?: "UP" | "DOWN" | "NEUTRAL" | string;
  /** Absolute minutes difference vs last week. */
  value?: number;
  /** e.g. "2h 0m" */
  display?: string;
  /** e.g. "2h 0m vs. last week" */
  label?: string;
};

export type QuranGoalFrameDay = {
  date: string;
  dayLabel: string;
  /** Minutes logged that day. */
  value: number;
  valueDisplay?: string | null;
  fulfilment?: string | null;
  target?: number | null;
  state?: QuranGoalFrameDayState;
  isToday: boolean;
  isBestDay?: boolean;
  canDelete?: boolean;
};

export type QuranGoalFrameItem = {
  itemId?: string | null;
  itemNumber?: number | null;
  title?: string | null;
  subtitle?: string | null;
  icon?: string | null;
  pill?: {
    state?: string;
    label?: string;
  } | null;
  achievementPct?: number;
  dailyTarget?: number | null;
  canLog?: boolean;
  showInsights?: boolean;
};

export type QuranGoalFrameData = {
  quranGoalType: string;
  title?: string;
  imageUrl?: string | null;
  goal: {
    quranGoalId?: string;
    isActive?: boolean;
    /** Hours target for LISTENING / TAJWEED. */
    target: number;
    targetLabel?: string;
    /** Minutes completed toward the goal. */
    completed: number;
    completedDisplay?: string;
    achievementPct: number;
    status: QuranGoalFrameStatus | string;
  };
  items?: QuranGoalFrameItem[];
  cycle: {
    id: string;
    startDate: string;
    endDate: string;
    dayNumber?: number;
    totalDays?: number;
    isEnded?: boolean;
  };
  week: {
    weekNumber: number;
    totalWeeks: number;
    label?: string;
    rangeLabel?: string;
    weekStart: string;
    weekEnd: string;
    hasPrevious?: boolean;
    hasNext?: boolean;
    days: QuranGoalFrameDay[];
    totalMinutes?: number;
    totalDisplay?: string;
    weeklyTarget?: number | null;
    totalLabel?: string;
    streak?: {
      count?: number;
      unit?: string;
      label?: string;
    } | null;
    /** `null` on week 1; object from week 2 onward. */
    vsLastWeek?: QuranGoalFrameVsLastWeek | number | null;
    motivation?: {
      key?: string;
      message?: string;
    } | null;
  };
  streaks?: {
    unit?: string;
    currentStreak?: number;
    weekStreak?: number;
    cycleLongestStreak?: number;
    weeks?: Array<{
      weekNumber: number;
      weekStart: string;
      weekEnd: string;
      streak: number;
      isCurrentWeek: boolean;
    }>;
  } | null;
  achievements?: unknown;
  articles?: unknown[];
};

const getQuranGoalFrame = async (
  quranGoalType: string,
  week?: number,
): Promise<QuranGoalFrameData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/quran-goals/${quranGoalType}/frame`,
    {
      params: week != null ? { week } : undefined,
    },
  );
  console.log(
    "response.data of the quran goal frame",
    JSON.stringify(response.data, null, 2),
  );
  return response.data?.data ?? null;
};

export const useGetQuranGoalFrame = (
  quranGoalTypeInput: string | null | undefined,
  options?: { enabled?: boolean; weekNumber?: number },
) => {
  const quranGoalType = quranGoalTypeInput
    ? resolveQuranType(quranGoalTypeInput)
    : "";
  const enabled = !!quranGoalType && (options?.enabled ?? true);

  return useQuery({
    queryKey: [
      "quran-goal-frame",
      quranGoalType,
      options?.weekNumber ?? "current",
    ],
    queryFn: () => getQuranGoalFrame(quranGoalType, options?.weekNumber),
    enabled,
    placeholderData: keepPreviousData,
  });
};
