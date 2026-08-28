import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";

export type FiveDailyPrayerSlotKey =
  | "FAJR"
  | "DHUHR"
  | "ASR"
  | "MAGHRIB"
  | "ISHA";

export type FiveDailyDayDetailSlot = {
  logged: boolean;
  count?: number;
  prayedOnTime?: boolean | null;
  wasQadha?: boolean | null;
  wasCongregational?: boolean | null;
  isJumuah?: boolean;
  mosqueName?: string | null;
  prayerStartTime?: string | null;
  durationMinutes?: number | null;
  notes?: string | null;
  loggedAt?: string | null;
  /** When false, slot cannot be selected for logging (e.g. today's window not open / already passed). */
  canLog?: boolean;
  /** True when only qadha logging is allowed (past date or today's window passed). */
  isQadhaOnly?: boolean;
  /** True while the Adhan prayer window is currently open (today only). */
  isWithinPrayerWindow?: boolean;
};

export type FiveDailyPrayerDayDetail = {
  date: string;
  hasLoggedAnyPrayer: boolean;
  goal: {
    targetCount: number;
    completedCount: number;
    achievementPct: number;
    status: string;
  };
  slotTargets?: Partial<Record<FiveDailyPrayerSlotKey | "JUMUAH", number>>;
  slots: Partial<Record<FiveDailyPrayerSlotKey, FiveDailyDayDetailSlot>>;
};

export type MissedPastPrayerDayDetailSlot = {
  logged: boolean;
  loggedCount: number;
  entries: unknown[];
  canLog?: boolean;
};

export type MissedPastPrayerDayDetail = {
  date: string;
  hasLoggedAnyPrayer: boolean;
  goal: {
    targetCount: number;
    completedCount: number;
    achievementPct: number;
    status: string;
    slotTarget: number;
  };
  slotProgress: Record<
    FiveDailyPrayerSlotKey,
    { completed: number; target: number }
  >;
  slots: Partial<Record<FiveDailyPrayerSlotKey, MissedPastPrayerDayDetailSlot>>;
};

export type PrayerGoalDayDetail =
  | FiveDailyPrayerDayDetail
  | MissedPastPrayerDayDetail;

const postPrayerGoalDayDetail = async (
  prayerType: string,
  date: string,
): Promise<PrayerGoalDayDetail | null> => {
  const resolved = resolvePrayerType(prayerType);
  const response = await api.post(
    `api/goal-cycles/current/prayer-goals/${resolved}/day-detail`,
    { date },
  );
  return response.data?.data ?? null;
};

/** True when day-detail payload is for the date the UI is showing. */
export function isPrayerGoalDayDetailForDate(
  data: PrayerGoalDayDetail | null | undefined,
  date: string | undefined,
): boolean {
  if (!data?.date || !date) return false;
  return data.date.slice(0, 10) === date.slice(0, 10);
}

export const useGetPrayerGoalDayDetail = (
  prayerTypeInput: string | null | undefined,
  date: string | undefined,
  options?: { enabled?: boolean },
) => {
  const prayerType = prayerTypeInput ? resolvePrayerType(prayerTypeInput) : "";
  const enabled =
    !!prayerType && !!date && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["prayer-goal-day-detail", prayerType, date],
    queryFn: () => postPrayerGoalDayDetail(prayerType, date!),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export function isMissedPastPrayerDayDetail(
  data: PrayerGoalDayDetail | null | undefined,
): data is MissedPastPrayerDayDetail {
  return !!data && "slotProgress" in data;
}

export function isFiveDailyDayDetail(
  data: PrayerGoalDayDetail | null | undefined,
): data is FiveDailyPrayerDayDetail {
  return !!data && !("slotProgress" in data);
}
