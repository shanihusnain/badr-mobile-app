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

export type QuranGoalFrameDayCompletion = {
  /** e.g. "C1" */
  attemptLabel?: string | null;
  /** e.g. [1] or [1, 2] when multiple Khatms touched that day */
  attempts?: number[] | null;
  /** e.g. "j8" / "j1-4" / "j1, j2*" */
  juzLabel?: string | null;
};

/** Styled text pieces for the completion week total row. */
export type QuranGoalFrameCompletionTotalSegment = {
  text: string;
  /** `"primary"` → bold count in the stats row. */
  emphasis?: "primary" | string | null;
};

/**
 * RECITATION_COMPLETION week footer totals
 * (`week.completionTotal` from the frame API).
 */
export type QuranGoalFrameCompletionTotal = {
  /** Full Khatm completions counted this week. */
  completions?: number | null;
  /** Juz (fractional allowed) covered this week. */
  juz?: number | null;
  /** Open / contributing attempt(s), e.g. 1 or [1, 2]. */
  juzAttempts?: number | number[] | null;
  /** Prefer for UI: primary segment is bold, rest is label. */
  segments?: QuranGoalFrameCompletionTotalSegment[] | null;
};

export type QuranGoalFrameDay = {
  date: string;
  dayLabel: string;
  /** Minutes logged that day (or juz units for completion/juz goals). */
  value: number;
  valueDisplay?: string | null;
  fulfilment?: string | null;
  target?: number | null;
  state?: QuranGoalFrameDayState;
  isToday: boolean;
  isBestDay?: boolean;
  canDelete?: boolean;
  /** RECITATION_COMPLETION — structured C# + juz captions for the day strip. */
  completion?: QuranGoalFrameDayCompletion | null;
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
  /** Verses (or units) completed for this item — MEMORIZATION_SURAH. */
  completed?: number | null;
  /** Verses (or units) target for this item — MEMORIZATION_SURAH. */
  target?: number | null;
  achievementPct?: number;
  dailyTarget?: number | null;
  /** Per-item cadence for RECITATION_SURAH (DAILY / WEEKLY). */
  frequency?: string | null;
  /** How many per period — the 2 in "2 times daily". */
  perPeriodCount?: number | null;
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
    /**
     * RECITATION_COMPLETION — structured week total for the stats row
     * (prefer over parsing `totalLabel` / `totalDisplay`).
     */
    completionTotal?: QuranGoalFrameCompletionTotal | null;
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

export const getQuranGoalFrame = async (
  quranGoalType: string,
  options?: { week?: number; itemNumber?: number },
): Promise<QuranGoalFrameData | null> => {
  const params: Record<string, number> = {};
  if (options?.week != null) params.week = options.week;
  if (options?.itemNumber != null) params.itemNumber = options.itemNumber;

  const response = await api.get(
    `api/goal-cycles/current/quran-goals/${quranGoalType}/frame`,
    {
      params: Object.keys(params).length > 0 ? params : undefined,
    },
  );
  console.log(
    "response.data of the quran goal frame",
    JSON.stringify(response.data, null, 2),
  );
  return response.data?.data ?? null;
};

/** Shared query key — keep in sync with `useGetQuranGoalFrame`. */
export function quranGoalFrameQueryKey(
  quranGoalType: string,
  weekNumber?: number | "current",
  itemNumber?: number | "all",
) {
  return [
    "quran-goal-frame",
    quranGoalType,
    weekNumber ?? "current",
    itemNumber ?? "all",
  ] as const;
}

export const useGetQuranGoalFrame = (
  quranGoalTypeInput: string | null | undefined,
  options?: {
    enabled?: boolean;
    weekNumber?: number;
    /** Surah / juz / hizb number — required for multi-item goals e.g. MEMORIZATION_SURAH. */
    itemNumber?: number;
  },
) => {
  const quranGoalType = quranGoalTypeInput
    ? resolveQuranType(quranGoalTypeInput)
    : "";
  const enabled = !!quranGoalType && (options?.enabled ?? true);

  return useQuery({
    queryKey: quranGoalFrameQueryKey(
      quranGoalType,
      options?.weekNumber ?? "current",
      options?.itemNumber ?? "all",
    ),
    queryFn: () =>
      getQuranGoalFrame(quranGoalType, {
        week: options?.weekNumber,
        itemNumber: options?.itemNumber,
      }),
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });
};
