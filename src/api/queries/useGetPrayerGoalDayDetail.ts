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

export type QiyamSessionTypeKey = "AFTER_ISHA" | "TAHAJJUD" | "BOTH";

export type QiyamDayDetailSession = {
  display?: string;
  logged?: boolean;
  unitsLogged?: number;
  rakahCount?: number;
  witrLogged?: boolean;
  minutesSpent?: number;
  entries?: unknown[];
};

export type QiyamDayDetailNight = {
  unitsLogged?: number;
  rakahCount?: number;
  witrLogged?: boolean;
  nightTarget?: number;
  remaining?: number;
  isComplete?: boolean;
  afterIsha?: boolean;
  beforeFajr?: boolean;
  sessionTypes?: string[];
  unitsWithUnknownWindow?: number;
  totalMinutesSpent?: number;
  startTime?: string | null;
  firstLoggedAt?: string | null;
  lastLoggedAt?: string | null;
  isMenstruationDay?: boolean;
  canLog?: boolean;
  canLogWitr?: boolean;
};

export type QiyamDayDetailWitr = {
  logged?: boolean;
  sessionType?: string | null;
  startTime?: string | null;
  durationMinutes?: number | null;
  loggedAt?: string | null;
  canLog?: boolean;
};

export type QiyamDayDetail = {
  date: string;
  hasLoggedAnyPrayer: boolean;
  /** Witr already logged for this Islamic night — hide Witr steps on re-log. */
  witrLogged?: boolean;
  includesWitrLogged?: boolean;
  witrAlreadyLogged?: boolean;
  trackTahajjud?: boolean;
  canLog?: boolean;
  loggedCount?: number;
  goal: {
    targetCount: number;
    completedCount: number;
    achievementPct: number;
    status: string;
    label?: string;
    isFlexible?: boolean;
    unitTarget?: number;
    witrTarget?: number;
    targetPerNight?: number;
    trackTahajjud?: boolean;
  };
  night?: QiyamDayDetailNight;
  witr?: QiyamDayDetailWitr;
  sessions?: Partial<Record<QiyamSessionTypeKey, QiyamDayDetailSession>>;
};

export type PrayerGoalDayDetail =
  | FiveDailyPrayerDayDetail
  | MissedPastPrayerDayDetail
  | SunnahRawatibDayDetail
  | QiyamDayDetail;

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

/** True when some but not all daily target units are logged. */
export function isSunnahRawatibSlotPartiallyLogged(
  slot: SunnahRawatibDayDetailSlot | undefined,
): boolean {
  if (!slot) return false;
  const logged = readSunnahRawatibSlotLoggedCount(slot);
  const target = readSunnahRawatibSlotDailyTarget(slot);
  return logged > 0 && target > 0 && logged < target;
}

/** True when an unlogged Five Daily slot is open for logging per day-detail. */
export function isFiveDailySlotSelectable(
  slot: FiveDailyDayDetailSlot | undefined,
): boolean {
  if (!slot || slot.logged) return false;
  return slot.canLog === true;
}

/** True when the slot is part of the goal and currently open for logging. */
export function isSunnahRawatibSlotSelectable(
  slot: SunnahRawatibDayDetailSlot | undefined,
): boolean {
  if (!slot || !isSunnahRawatibSlotInGoal(slot)) return false;
  const logged = readSunnahRawatibSlotLoggedCount(slot);
  const target = readSunnahRawatibSlotDailyTarget(slot);
  if (logged >= target) return false;
  // Partial slot (e.g. 1 of 2): always allow logging the remaining unit(s).
  if (logged > 0 && logged < target) return true;
  return slot.canLog === true;
}

/** True when Witr was already logged for the selected Islamic night. */
export function isQiyamWitrLoggedForNight(
  dayDetail: QiyamDayDetail | null | undefined,
): boolean {
  if (!dayDetail) return false;
  if (dayDetail.witr?.logged === true) return true;
  if (dayDetail.night?.witrLogged === true) return true;
  if (dayDetail.witrLogged === true) return true;
  if (dayDetail.includesWitrLogged === true) return true;
  if (dayDetail.witrAlreadyLogged === true) return true;
  const sessions = dayDetail.sessions;
  if (
    sessions?.AFTER_ISHA?.witrLogged === true ||
    sessions?.TAHAJJUD?.witrLogged === true ||
    sessions?.BOTH?.witrLogged === true
  ) {
    return true;
  }
  return false;
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

export function isQiyamDayDetail(
  data: PrayerGoalDayDetail | null | undefined,
): data is QiyamDayDetail {
  if (!data) return false;
  if (isSunnahRawatibDayDetail(data)) return false;
  if ("slotProgress" in data) return false;

  const qiyam = data as QiyamDayDetail;
  if (qiyam.night && typeof qiyam.night === "object") return true;
  if (qiyam.witr && typeof qiyam.witr === "object") return true;
  if (qiyam.sessions && typeof qiyam.sessions === "object") {
    const keys = Object.keys(qiyam.sessions);
    if (
      keys.some(
        (key) => key === "TAHAJJUD" || key === "BOTH" || key === "AFTER_ISHA",
      )
    ) {
      return true;
    }
  }

  if ("slots" in data && data.slots && Object.keys(data.slots).length > 0) {
    return false;
  }
  return (
    "witrLogged" in data ||
    "includesWitrLogged" in data ||
    "witrAlreadyLogged" in data ||
    "trackTahajjud" in data
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
    !!data &&
    !("slotProgress" in data) &&
    !isSunnahRawatibDayDetail(data) &&
    !isQiyamDayDetail(data) &&
    "slots" in data
  );
}
