import { getCurrentStartTimeParts } from "@/src/screens/private/goalprogressloggingscreen/components/TimePickerSteps";
import type {
  SinglePrayerDayDetail,
  SinglePrayerDayDetailEntry,
} from "@/src/api/queries/useGetPrayerGoalDayDetail";

export type PrayerStartTimeParts = {
  hour: string;
  minute: string;
  period: "am" | "pm";
};

/** Parse day-detail start time: "5:47 PM" or "17:47" / "05:47". */
export function parsePrayerDayDetailStartTime(
  value: string | null | undefined,
): PrayerStartTimeParts | null {
  if (!value) return null;
  const trimmed = String(value).trim();

  const amPm = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPm) {
    const hourNum = Number.parseInt(amPm[1], 10);
    const minuteNum = Number.parseInt(amPm[2], 10);
    if (
      !Number.isFinite(hourNum) ||
      !Number.isFinite(minuteNum) ||
      hourNum < 1 ||
      hourNum > 12 ||
      minuteNum < 0 ||
      minuteNum > 59
    ) {
      return null;
    }
    return {
      hour: String(hourNum).padStart(2, "0"),
      minute: String(minuteNum).padStart(2, "0"),
      period: amPm[3].toLowerCase() === "pm" ? "pm" : "am",
    };
  }

  const h24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hour24 = Number.parseInt(h24[1], 10);
    const minuteNum = Number.parseInt(h24[2], 10);
    if (
      !Number.isFinite(hour24) ||
      !Number.isFinite(minuteNum) ||
      hour24 < 0 ||
      hour24 > 23 ||
      minuteNum < 0 ||
      minuteNum > 59
    ) {
      return null;
    }
    const period: "am" | "pm" = hour24 >= 12 ? "pm" : "am";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    return {
      hour: String(hour12).padStart(2, "0"),
      minute: String(minuteNum).padStart(2, "0"),
      period,
    };
  }

  return null;
}

export function durationPartsFromMinutes(
  totalMinutes: number | null | undefined,
): { hours: string; minutes: string } {
  const total =
    typeof totalMinutes === "number" && Number.isFinite(totalMinutes)
      ? Math.max(0, Math.floor(totalMinutes))
      : 0;
  return {
    hours: String(Math.floor(total / 60)),
    minutes: String(total % 60),
  };
}

/** Prefer the most recently logged entry when editing a past day. */
export function getLatestSinglePrayerEntry(
  detail: SinglePrayerDayDetail | null | undefined,
): SinglePrayerDayDetailEntry | null {
  const entries = detail?.entries;
  if (!Array.isArray(entries) || entries.length === 0) return null;

  let latest: SinglePrayerDayDetailEntry | null = null;
  let latestTs = Number.NEGATIVE_INFINITY;

  for (const entry of entries) {
    if (!entry) continue;
    const ts = entry.loggedAt ? Date.parse(entry.loggedAt) : Number.NaN;
    if (Number.isFinite(ts)) {
      if (ts >= latestTs) {
        latestTs = ts;
        latest = entry;
      }
      continue;
    }
    if (!latest) latest = entry;
  }

  return latest;
}

export function readSinglePrayerLoggedCount(
  detail: SinglePrayerDayDetail | null | undefined,
): number {
  if (!detail) return 0;

  const dayLogged = detail.day?.loggedCount;
  if (typeof dayLogged === "number" && Number.isFinite(dayLogged)) {
    return Math.max(0, Math.floor(dayLogged));
  }

  if (typeof detail.loggedCount === "number" && Number.isFinite(detail.loggedCount)) {
    return Math.max(0, Math.floor(detail.loggedCount));
  }
  if (typeof detail.count === "number" && Number.isFinite(detail.count)) {
    return Math.max(0, Math.floor(detail.count));
  }

  const entryCount = detail.day?.entryCount;
  if (typeof entryCount === "number" && Number.isFinite(entryCount) && entryCount > 0) {
    return Math.max(0, Math.floor(entryCount));
  }

  if (Array.isArray(detail.entries) && detail.entries.length > 0) {
    const summed = detail.entries.reduce((sum, entry) => {
      const n =
        typeof entry?.count === "number" && Number.isFinite(entry.count)
          ? entry.count
          : 0;
      return sum + Math.max(0, Math.floor(n));
    }, 0);
    if (summed > 0) return summed;
    return detail.entries.length;
  }

  if (detail.logged === true || detail.hasLoggedAnyPrayer === true) return 1;
  return 0;
}

export function singlePrayerDayHasExistingLog(
  detail: SinglePrayerDayDetail | null | undefined,
): boolean {
  return readSinglePrayerLoggedCount(detail) > 0;
}

export type SinglePrayerDayDetailPrefill = {
  count: string;
  startHour: string;
  startMinute: string;
  startPeriod: "am" | "pm";
  durationHours: string;
  durationMinutes: string;
  prayedAfterWudhu: boolean | null;
  prayedAfterEntering: boolean | null;
  hasExistingLog: boolean;
};

/** Build form defaults from day-detail (or empty-day defaults). */
export function buildSinglePrayerDayDetailPrefill(
  detail: SinglePrayerDayDetail | null | undefined,
): SinglePrayerDayDetailPrefill {
  const now = getCurrentStartTimeParts();
  const loggedCount = readSinglePrayerLoggedCount(detail);
  const hasExistingLog = loggedCount > 0;

  if (!detail || !hasExistingLog) {
    return {
      count: "1",
      startHour: now.hour,
      startMinute: now.minute,
      startPeriod: now.period,
      durationHours: "0",
      durationMinutes: "0",
      prayedAfterWudhu: null,
      prayedAfterEntering: null,
      hasExistingLog: false,
    };
  }

  const latest = getLatestSinglePrayerEntry(detail);

  const startParts =
    parsePrayerDayDetailStartTime(latest?.prayerStartTime) ??
    parsePrayerDayDetailStartTime(latest?.startTime) ??
    parsePrayerDayDetailStartTime(detail.prayerStartTime) ??
    parsePrayerDayDetailStartTime(detail.startTime) ??
    parsePrayerDayDetailStartTime(detail.day?.startTime) ??
    now;

  const durationMinutes =
    (typeof latest?.durationMinutes === "number" &&
    Number.isFinite(latest.durationMinutes)
      ? latest.durationMinutes
      : null) ??
    (typeof detail.durationMinutes === "number" &&
    Number.isFinite(detail.durationMinutes)
      ? detail.durationMinutes
      : null) ??
    (typeof detail.day?.totalMinutesSpent === "number" &&
    Number.isFinite(detail.day.totalMinutesSpent)
      ? detail.day.totalMinutesSpent
      : null);

  const duration = durationPartsFromMinutes(durationMinutes);

  let prayedAfterWudhu: boolean | null = null;
  if (typeof latest?.prayedAfterWudhu === "boolean") {
    prayedAfterWudhu = latest.prayedAfterWudhu;
  } else if (typeof detail.prayedAfterWudhu === "boolean") {
    prayedAfterWudhu = detail.prayedAfterWudhu;
  } else if (
    typeof detail.day?.prayedAfterWudhuCount === "number" &&
    detail.day.prayedAfterWudhuCount > 0
  ) {
    prayedAfterWudhu = true;
  }

  let prayedAfterEntering: boolean | null = null;
  if (typeof latest?.prayedAfterEntering === "boolean") {
    prayedAfterEntering = latest.prayedAfterEntering;
  } else if (typeof detail.prayedAfterEntering === "boolean") {
    prayedAfterEntering = detail.prayedAfterEntering;
  } else if (
    typeof detail.day?.prayedAfterEnteringCount === "number" &&
    detail.day.prayedAfterEnteringCount > 0
  ) {
    prayedAfterEntering = true;
  }

  return {
    count: String(Math.max(1, loggedCount)),
    startHour: startParts.hour,
    startMinute: startParts.minute,
    startPeriod: startParts.period,
    durationHours: duration.hours,
    durationMinutes: duration.minutes,
    prayedAfterWudhu,
    prayedAfterEntering,
    hasExistingLog: true,
  };
}
