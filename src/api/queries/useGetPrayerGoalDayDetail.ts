import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";
import type { SunnahRawatibSlotKey } from "./useGetPrayerGoalFrame";

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

export type SunnahRawatibDayDetailSlot = {
  display?: string;
  enabled?: boolean;
  dailyTarget?: number;
  logged: boolean;
  loggedCount: number;
  prayedOnTime?: boolean | null;
  wasQadha?: boolean | null;
  wasCongregational?: boolean | null;
  mosqueName?: string | null;
  prayerStartTime?: string | null;
  durationMinutes?: number | null;
  notes?: string | null;
  loggedAt?: string | null;
  canLog?: boolean;
};

export type SunnahRawatibDayDetail = {
  date: string;
  hasLoggedAnyPrayer: boolean;
  goal: {
    targetCount: number;
    completedCount: number;
    achievementPct: number;
    status: string;
  };
  slots: Partial<Record<SunnahRawatibSlotKey, SunnahRawatibDayDetailSlot>>;
};

export type PrayerGoalDayDetail =
  | FiveDailyPrayerDayDetail
  | MissedPastPrayerDayDetail
  | SunnahRawatibDayDetail;

const SUNNAH_RAWATIB_SLOT_KEYS: SunnahRawatibSlotKey[] = [
  "BEFORE_FAJR",
  "BEFORE_DHUHR",
  "AFTER_DHUHR",
  "BEFORE_ASR",
  "AFTER_MAGHRIB",
  "AFTER_ISHA",
];

function recordHasSunnahSlotKey(
  record: Record<string, unknown> | null | undefined,
): boolean {
  if (!record) return false;
  return SUNNAH_RAWATIB_SLOT_KEYS.some((key) => key in record);
}

/** Units logged for a Sunnah Rawatib slot from day-detail payload. */
export function readSunnahRawatibSlotLoggedCount(
  slot: SunnahRawatibDayDetailSlot | undefined,
): number {
  if (!slot) return 0;
  if (
    typeof slot.loggedCount === "number" &&
    Number.isFinite(slot.loggedCount)
  ) {
    return Math.max(0, slot.loggedCount);
  }
  return slot.logged ? 1 : 0;
}

/** Daily target (prayer units) for a Sunnah Rawatib slot. */
export function readSunnahRawatibSlotDailyTarget(
  slot: SunnahRawatibDayDetailSlot | undefined,
): number {
  if (!slot) return 0;
  if (
    typeof slot.dailyTarget === "number" &&
    Number.isFinite(slot.dailyTarget)
  ) {
    return Math.max(0, slot.dailyTarget);
  }
  return 0;
}

/** True when the slot is part of the user's goal (ignores logging window). */
export function isSunnahRawatibSlotInGoal(
  slot: SunnahRawatibDayDetailSlot | undefined,
): boolean {
  if (!slot) return false;
  if (slot.enabled === false) return false;
  return readSunnahRawatibSlotDailyTarget(slot) > 0;
}

/** True when the slot is part of the goal and currently open for logging. */
export function isSunnahRawatibSlotSelectable(
  slot: SunnahRawatibDayDetailSlot | undefined,
): boolean {
  if (!isSunnahRawatibSlotInGoal(slot)) return false;
  if (slot?.canLog === false) return false;
  return true;
}

const postPrayerGoalDayDetail = async (
  prayerType: string,
  date: string,
): Promise<PrayerGoalDayDetail | null> => {
  const resolved = resolvePrayerType(prayerType);
  const response = await api.post(
    `api/goal-cycles/current/prayer-goals/${resolved}/day-detail`,
    { date },
  );
  console.log("================================================");
  console.log(
    "the day detail is",
    JSON.stringify(response.data?.data, null, 2),
  );
  console.log("================================================");

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
  const enabled = !!prayerType && !!date && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["prayer-goal-day-detail", prayerType, date],
    queryFn: () => postPrayerGoalDayDetail(prayerType, date!),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export function isSunnahRawatibDayDetail(
  data: PrayerGoalDayDetail | null | undefined,
): data is SunnahRawatibDayDetail {
  return recordHasSunnahSlotKey(
    (data as SunnahRawatibDayDetail | null | undefined)?.slots as Record<
      string,
      unknown
    >,
  );
}

export function isMissedPastPrayerDayDetail(
  data: PrayerGoalDayDetail | null | undefined,
): data is MissedPastPrayerDayDetail {
  return !!data && "slotProgress" in data && !isSunnahRawatibDayDetail(data);
}

export function isFiveDailyDayDetail(
  data: PrayerGoalDayDetail | null | undefined,
): data is FiveDailyPrayerDayDetail {
  return (
    !!data && !("slotProgress" in data) && !isSunnahRawatibDayDetail(data)
  );
}
