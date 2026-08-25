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
  beforeAsrEnabled?: boolean;
  /** 1 = one 2-rak'ah unit; 2 = two units (4 rak'ahs). */
  afterDhuhrRakahOption?: number;
  /** 1 = one 2-rak'ah unit; 2 = two units (4 rak'ahs). */
  beforeAsrRakahOption?: number;
};

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
  slotsOnTime?: number;
  slotsQadha?: number;
  totalLogged?: number;
  allFiveOnTime?: boolean;
  hasQadha?: boolean;
  slots?: Partial<Record<FiveDailyPrayerSlotKey, FiveDailyPrayerSlot>>;
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
    days: PrayerGoalFrameDay[];
  };
  /** Present for SUNNAH_RAWATIB — drives day-ring arc set / weights. */
  slotConfig?: SunnahRawatibSlotConfig | null;
  articles: unknown[];
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
  console.log("response", JSON.stringify(response.data?.data, null, 2));
  return response.data?.data ?? null;
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
