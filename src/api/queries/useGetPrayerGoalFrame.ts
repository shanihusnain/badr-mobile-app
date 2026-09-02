import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";
import type { PrayerGoalFrameStatus } from "@/src/utils/prayerGoalFrameMap";

export type FiveDailyPrayerSlotKey =
  | "FAJR"
  | "DHUHR"
  | "ASR"
  | "MAGHRIB"
  | "ISHA";

export type FiveDailyPrayerSlot = {
  logged?: boolean;
  prayedOnTime?: boolean;
  wasCongregational?: boolean;
  wasQadha?: boolean;
  isMenstruationSlot?: boolean;
  /** Missed-past (and similar): how many of this slot were logged that day. */
  count?: number;
  completed?: number;
};

export type PrayerGoalFrameSlotProgress = {
  completed: number;
  target: number;
};

/** Variable Sunnah Rawatib goal options from frame `slotConfig`. */
export type SunnahRawatibSlotConfig = {
  /**
   * Before Asr in goal. Prefer `beforeAsrPrayersPerDay` (0 = off).
   * Kept for older payloads.
   */
  beforeAsrEnabled?: boolean;
  /**
   * After Dhuhr: prayers per day (1 or 2).
   * Legacy alias: `afterDhuhrRakahOption`.
   */
  afterDhuhrPrayersPerDay?: number;
  /**
   * Before Asr: prayers per day (0 = not selected, 1 or 2).
   * Legacy alias: `beforeAsrRakahOption` + `beforeAsrEnabled`.
   */
  beforeAsrPrayersPerDay?: number;
  /** @deprecated Use afterDhuhrPrayersPerDay */
  afterDhuhrRakahOption?: number;
  /** @deprecated Use beforeAsrPrayersPerDay */
  beforeAsrRakahOption?: number;
};

export type SunnahRawatibSlotKey =
  | "BEFORE_FAJR"
  | "BEFORE_DHUHR"
  | "AFTER_DHUHR"
  | "BEFORE_ASR"
  | "AFTER_MAGHRIB"
  | "AFTER_ISHA";

export type QiyamPrayerTiming = "AFTER_ISHA" | "BEFORE_FAJR" | "BOTH";

export type PrayerGoalFrameDay = {
  date: string;
  dayLabel: string;
  isToday: boolean;
  isFuture: boolean;
  isFutureDay?: boolean;
  hasActivity?: boolean;
  isMenstruationDay?: boolean;
  count?: number;
  isBestDay?: boolean;
  /** Qiyam al Layl — when the user prayed (API may use any of these keys). */
  prayerTiming?: QiyamPrayerTiming | string;
  loggedTiming?: QiyamPrayerTiming | string;
  timing?: QiyamPrayerTiming | string;
  /** Qiyam — session flags from frame week day payload. */
  afterIsha?: boolean;
  beforeFajr?: boolean;
  witrLogged?: boolean;
  gender?: string;
  /** Qiyam — true when Witr was not concluded for a logged night. */
  isWitrPending?: boolean;
  witrPending?: boolean;
  concludedWithWitr?: boolean;
  /** Qiyam — committed goal missed night (orange ring). */
  isMissedStrict?: boolean;
  isMissedCommitted?: boolean;
  /** Qiyam — flexible goal with no log on a past night (grey ring). */
  isMissedFlexible?: boolean;
  status?: string;
  slotsOnTime?: number;
  slotsQadha?: number;
  totalLogged?: number;
  allFiveOnTime?: boolean;
  hasQadha?: boolean;
  /**
   * Five Daily: slot objects. Sunnah Rawatib: numeric unit counts per slot
   * (e.g. `{ BEFORE_FAJR: 1, BEFORE_DHUHR: 2 }`).
   */
  slots?: Partial<
    Record<FiveDailyPrayerSlotKey, FiveDailyPrayerSlot> &
      Record<SunnahRawatibSlotKey, number>
  >;
  /** Qiyam Al-Layl — when the prayer was logged. */
  loggedTime?: "after-isha" | "before-fajr" | "both";
};

export type PrayerGoalFrameData = {
  prayerType: string;
  title: string;
  imageUrl: string | null;
  /** When true, logging flow asks if the prayer was in congregation. */
  isCongregationalTracked?: boolean;
  goal: {
    targetCount: number;
    completedCount: number;
    achievementPct: number;
    status: PrayerGoalFrameStatus | string;
    label: string;
    /** Qiyam al Layl — flexible vs every-night commitment. */
    isFlexible?: boolean;
    isCongregationalTracked?: boolean;
    slotTargets?: Partial<Record<FiveDailyPrayerSlotKey, number>>;
    slotProgress?: Partial<
      Record<FiveDailyPrayerSlotKey, PrayerGoalFrameSlotProgress>
    >;
  };
  cycle: {
    id: string;
    weekNumber: number;
    totalWeeks: number;
    weekStart: string;
    weekEnd: string;
    cycleStart: string;
    cycleEnd: string;
  };
  week: {
    thisWeekTotal?: number;
    thisWeekOnTime?: number;
    vsLastWeek: number | null;
    currentStreak: number;
    motivationalMessage: string;
    /** Past-week summary copy when viewing a different week in the cycle. */
    weekSummaryMessage?: string | null;
    days: PrayerGoalFrameDay[];
  };
  /** Present for SUNNAH_RAWATIB — drives day-ring arc set / weights. */
  slotConfig?: SunnahRawatibSlotConfig | null;
  /** Present for QIYAM_AL_LAYL — strict vs flexible commitment. */
  qiyamConfig?: {
    isFlexible?: boolean;
    unitTarget?: number;
    trackTahajjud?: boolean;
  } | null;
  articles: unknown[];
  isGoalCompletedFully?: boolean;
  isCycleEndReached?: boolean;
};

const getPrayerGoalFrame = async (
  prayerType: string,
  week?: number,
): Promise<PrayerGoalFrameData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/prayer-goals/${prayerType}/frame`,
    {
      params: week != null ? { week } : undefined,
    },
  );
  const payload = response.data?.data ?? null;
  console.log(
    `[prayer-frame] requestedWeek=${week ?? "current"} returnedWeek=${payload?.cycle?.weekNumber ?? "?"} motivationalMessage=${JSON.stringify(payload?.week?.motivationalMessage ?? null)} weekSummaryMessage=${JSON.stringify(payload?.week?.weekSummaryMessage ?? null)}`,
  );
  console.log("================================================");
  console.log("the week detail is", JSON.stringify(payload, null, 2));
  console.log("================================================");
  return payload;
};

export const useGetPrayerGoalFrame = (
  prayerTypeInput: string | null | undefined,
  options?: { enabled?: boolean; weekNumber?: number },
) => {
  const prayerType = prayerTypeInput ? resolvePrayerType(prayerTypeInput) : "";
  const enabled = !!prayerType && (options?.enabled ?? true);

  return useQuery({
    queryKey: [
      "prayer-goal-frame",
      prayerType,
      options?.weekNumber ?? "current",
    ],
    queryFn: () => getPrayerGoalFrame(prayerType, options?.weekNumber),
    enabled,
    placeholderData: keepPreviousData,
  });
};
