import React from "react";
import {
  AsrIcon,
  IshaIcon,
  MaghribIcon,
  SunIcon,
  SunriseIcon,
} from "@/assets/icons";
import type { PrayerName } from "@/src/screens/private/goalprogressloggingscreen/progressLoggingConfig";

export type SunnahPrayerId =
  | "before_fajr"
  | "before_dhuhr"
  | "after_dhuhr"
  | "before_asr"
  | "after_maghrib"
  | "after_isha";

export const SUNNAH_ICON_COMPONENTS: Record<
  SunnahPrayerId,
  React.ComponentType<{ color: string; size: number }>
> = {
  before_fajr: SunriseIcon,
  before_dhuhr: SunIcon,
  after_dhuhr: SunIcon,
  before_asr: AsrIcon,
  after_maghrib: MaghribIcon,
  after_isha: IshaIcon,
};

export const PRAYER_ICON_COMPONENTS: Record<
  PrayerName,
  React.ComponentType<{ color: string; size: number }>
> = {
  fajr: SunriseIcon,
  dhuhr: SunIcon,
  asr: AsrIcon,
  maghrib: MaghribIcon,
  isha: IshaIcon,
};

const SUNNAH_SLOT_ALIASES: Record<SunnahPrayerId, string[]> = {
  before_fajr: ["before fajr", "before_fajr", "beforefajr"],
  before_dhuhr: [
    "before dhuhr",
    "before duhr",
    "before_dhuhr",
    "beforedhuhr",
    "beforeduhr",
  ],
  after_dhuhr: [
    "after dhuhr",
    "after duhr",
    "after_dhuhr",
    "afterdhuhr",
    "afterduhr",
  ],
  before_asr: ["before asr", "before asar", "before_asr", "beforeasr"],
  after_maghrib: [
    "after maghrib",
    "after_maghrib",
    "aftermaghrib",
  ],
  after_isha: ["after isha", "after_isha", "afterisha"],
};

const FIVE_DAILY_ALIASES: Record<PrayerName, string[]> = {
  fajr: ["fajr"],
  dhuhr: ["dhuhr", "duhr", "zuhr", "jumuah", "jumu'ah", "jumma"],
  asr: ["asr", "asar"],
  maghrib: ["maghrib"],
  isha: ["isha"],
};

function normalizeSlotText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactSlotText(value: string): string {
  return normalizeSlotText(value).replace(/\s+/g, "").replace(/'/g, "");
}

/** Match Sunnah Rawatib slot ids from My Day title/line text. */
export function matchSunnahSlotId(
  ...texts: Array<string | undefined | null>
): SunnahPrayerId | null {
  for (const text of texts) {
    if (!text?.trim()) continue;
    const normalized = normalizeSlotText(text);
    const compact = compactSlotText(text);
    for (const [slotId, aliases] of Object.entries(SUNNAH_SLOT_ALIASES) as [
      SunnahPrayerId,
      string[],
    ][]) {
      if (
        aliases.some(
          (alias) =>
            normalized === alias ||
            normalized.includes(alias) ||
            compact === alias.replace(/\s+/g, "") ||
            compact.includes(alias.replace(/\s+/g, "")),
        )
      ) {
        return slotId;
      }
    }
  }
  return null;
}

/** Match Five Daily prayer names from My Day title/line text. */
export function matchFiveDailyPrayerName(
  ...texts: Array<string | undefined | null>
): PrayerName | null {
  for (const text of texts) {
    if (!text?.trim()) continue;
    const normalized = normalizeSlotText(text);
    const compact = compactSlotText(text);
    // Prefer longer aliases first so "before fajr" is not matched as fajr elsewhere;
    // callers should try sunnah slots before this for sunnah goal types.
    for (const [prayer, aliases] of Object.entries(FIVE_DAILY_ALIASES) as [
      PrayerName,
      string[],
    ][]) {
      if (
        aliases.some(
          (alias) =>
            normalized === alias ||
            // Whole-word-ish: avoid matching "fajr" inside unrelated strings loosely
            new RegExp(`(^|\\s)${alias}(\\s|$)`).test(normalized) ||
            compact === alias.replace(/\s+/g, "").replace(/'/g, ""),
        )
      ) {
        return prayer;
      }
    }
  }
  return null;
}
