import { getCurrentStartTimeParts } from "@/src/screens/private/goalprogressloggingscreen/components/TimePickerSteps";
import type { SinglePrayerDayDetail } from "@/src/api/queries/useGetPrayerGoalDayDetail";

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

export function readSinglePrayerLoggedCount(
  detail: SinglePrayerDayDetail | null | undefined,
): number {
  if (!detail) return 0;
  if (typeof detail.loggedCount === "number" && Number.isFinite(detail.loggedCount)) {
    return Math.max(0, Math.floor(detail.loggedCount));
  }
  if (typeof detail.count === "number" && Number.isFinite(detail.count)) {
    return Math.max(0, Math.floor(detail.count));
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

  const startParts =
    parsePrayerDayDetailStartTime(detail.prayerStartTime) ??
    parsePrayerDayDetailStartTime(detail.startTime) ??
    now;
  const duration = durationPartsFromMinutes(detail.durationMinutes);

  return {
    count: String(Math.max(1, loggedCount)),
    startHour: startParts.hour,
    startMinute: startParts.minute,
    startPeriod: startParts.period,
    durationHours: duration.hours,
    durationMinutes: duration.minutes,
    prayedAfterWudhu:
      typeof detail.prayedAfterWudhu === "boolean"
        ? detail.prayedAfterWudhu
        : null,
    prayedAfterEntering:
      typeof detail.prayedAfterEntering === "boolean"
        ? detail.prayedAfterEntering
        : null,
    hasExistingLog: true,
  };
}
