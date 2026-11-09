import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";

export type StartTimeParts = {
  hour: string;
  minute: string;
  period: "am" | "pm";
};

function startTimePartsFromDate(date: Date): StartTimeParts {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const period: "am" | "pm" = hour24 >= 12 ? "pm" : "am";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    period,
  };
}

export function getCurrentStartTimeParts(): StartTimeParts {
  return startTimePartsFromDate(new Date());
}

/** Parse API `HH:mm` (24h) into the 12h picker parts. */
export function parseHhMmToStartTimeParts(
  hhmm: string | null | undefined,
): StartTimeParts | null {
  if (!hhmm) return null;
  const match = String(hhmm).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour24 = Math.min(23, Math.max(0, Number.parseInt(match[1], 10) || 0));
  const minute = Math.min(59, Math.max(0, Number.parseInt(match[2], 10) || 0));
  const period: "am" | "pm" = hour24 >= 12 ? "pm" : "am";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    period,
  };
}

/**
 * Parse dashboard / API times that may be 24h (`19:45`) or 12h (`7:45 PM`).
 */
export function parseFlexibleTimeToStartTimeParts(
  raw: string | null | undefined,
): StartTimeParts | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const withPeriod = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (withPeriod) {
    let hour12 = Number.parseInt(withPeriod[1], 10);
    const minute = Number.parseInt(withPeriod[2], 10);
    const period = withPeriod[3].toLowerCase() === "pm" ? "pm" : "am";
    if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return null;
    return {
      hour: String(hour12).padStart(2, "0"),
      minute: String(minute).padStart(2, "0"),
      period,
    };
  }
  return parseHhMmToStartTimeParts(trimmed);
}

/** Minutes from midnight for 12h picker parts. */
export function startTimePartsToMinutes(parts: StartTimeParts): number {
  let hour = Number.parseInt(parts.hour, 10) || 0;
  const minute = Math.min(59, Math.max(0, Number.parseInt(parts.minute, 10) || 0));
  hour = hour % 12;
  if (parts.period === "pm") hour += 12;
  return hour * 60 + minute;
}

export function minutesToStartTimeParts(totalMinutes: number): StartTimeParts {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.floor(totalMinutes)));
  const hour24 = Math.floor(clamped / 60);
  const minute = clamped % 60;
  const period: "am" | "pm" = hour24 >= 12 ? "pm" : "am";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    period,
  };
}

const FIVE_DAILY_TIMELINE_ORDER = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const;

export type PrayerWindowBounds = {
  /** Inclusive window start (Adhan), minutes from midnight. */
  startMinutes: number;
  /** Exclusive window end (next Adhan, or 23:59+1 for Isha). */
  endMinutesExclusive: number;
  startParts: StartTimeParts;
};

/**
 * Prayer window from dashboard timeline: [Adhan, next Adhan).
 * Isha ends at end-of-day (exclusive 24:00 → clamp to 23:59).
 */
export function getPrayerWindowFromTimeline(
  timeline: ReadonlyArray<{ key?: string; time?: string }> | null | undefined,
  prayer: string,
): PrayerWindowBounds | null {
  if (!Array.isArray(timeline) || timeline.length === 0) return null;

  const byKey = new Map<string, StartTimeParts>();
  for (const item of timeline) {
    const key = String(item?.key ?? "")
      .trim()
      .toLowerCase();
    const parts = parseFlexibleTimeToStartTimeParts(item?.time);
    if (!key || !parts) continue;
    byKey.set(key, parts);
  }

  const prayerKey = prayer.trim().toLowerCase();
  const startParts = byKey.get(prayerKey);
  if (!startParts) return null;

  const orderIndex = FIVE_DAILY_TIMELINE_ORDER.indexOf(
    prayerKey as (typeof FIVE_DAILY_TIMELINE_ORDER)[number],
  );
  let endMinutesExclusive = 24 * 60; // end of day
  if (orderIndex >= 0 && orderIndex < FIVE_DAILY_TIMELINE_ORDER.length - 1) {
    const nextKey = FIVE_DAILY_TIMELINE_ORDER[orderIndex + 1];
    const nextParts = byKey.get(nextKey);
    if (nextParts) {
      endMinutesExclusive = startTimePartsToMinutes(nextParts);
    }
  }

  const startMinutes = startTimePartsToMinutes(startParts);
  if (endMinutesExclusive <= startMinutes) {
    endMinutesExclusive = Math.min(24 * 60, startMinutes + 1);
  }

  return { startMinutes, endMinutesExclusive, startParts };
}

export function isStartTimeWithinPrayerWindow(
  parts: StartTimeParts,
  window: PrayerWindowBounds,
): boolean {
  const minutes = startTimePartsToMinutes(parts);
  return minutes >= window.startMinutes && minutes < window.endMinutesExclusive;
}

/** Clamp into [start, endExclusive - 1]. */
export function clampStartTimeToPrayerWindow(
  parts: StartTimeParts,
  window: PrayerWindowBounds,
): StartTimeParts {
  const minutes = startTimePartsToMinutes(parts);
  if (minutes < window.startMinutes) {
    return window.startParts;
  }
  if (minutes >= window.endMinutesExclusive) {
    return minutesToStartTimeParts(window.endMinutesExclusive - 1);
  }
  return {
    hour: parts.hour.padStart(2, "0"),
    minute: parts.minute.padStart(2, "0"),
    period: parts.period,
  };
}

interface StartTimeStepProps {
  startHour: string;
  setStartHour: (h: string) => void;
  startMinute: string;
  setStartMinute: (m: string) => void;
  startPeriod: "am" | "pm";
  setStartPeriod: (p: "am" | "pm") => void;
  isPeriodDropdownOpen: boolean;
  setIsPeriodDropdownOpen: (open: boolean) => void;
  styles: any;
  /** Highlight hour / minute / period borders in red (e.g. outside allowed window). */
  hasError?: boolean;
  /** Limit AM/PM choices (e.g. Fajr on-time → am only). Defaults to both. */
  allowedPeriods?: ReadonlyArray<"am" | "pm">;
}

export const StartTimeStep: React.FC<StartTimeStepProps> = ({
  startHour,
  setStartHour,
  startMinute,
  setStartMinute,
  startPeriod,
  setStartPeriod,
  isPeriodDropdownOpen,
  setIsPeriodDropdownOpen,
  styles,
  hasError = false,
  allowedPeriods = ["am", "pm"],
}) => {
  const [isHourFocused, setIsHourFocused] = React.useState(false);
  const [isMinuteFocused, setIsMinuteFocused] = React.useState(false);
  const errorBorder = hasError ? { borderColor: Colors.light.red } : null;
  const canTogglePeriod = allowedPeriods.length > 1;
  const alternatePeriod =
    allowedPeriods.find((period) => period !== startPeriod) ?? null;

  return (
    <View style={styles.timePickerContainer}>
      <View style={styles.timePickerRow}>
        {/* Hour Input */}
        <TextInput
          style={[
            styles.timeInput,
            isHourFocused && { borderColor: Colors.light.white },
            errorBorder,
          ]}
          value={startHour}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned.length <= 2) {
              setStartHour(cleaned);
            }
          }}
          onFocus={() => setIsHourFocused(true)}
          onBlur={() => setIsHourFocused(false)}
          keyboardType="number-pad"
          maxLength={2}
          placeholder=""
        />

        <Text style={styles.timeSeparator}>:</Text>

        {/* Minute Input */}
        <TextInput
          style={[
            styles.timeInput,
            isMinuteFocused && { borderColor: Colors.light.white },
            errorBorder,
          ]}
          value={startMinute}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned.length <= 2) {
              setStartMinute(cleaned);
            }
          }}
          onFocus={() => setIsMinuteFocused(true)}
          onBlur={() => setIsMinuteFocused(false)}
          keyboardType="number-pad"
          maxLength={2}
          placeholder=""
        />

        {/* Period Dropdown Selector */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[
              styles.periodSelector,
              isPeriodDropdownOpen &&
                canTogglePeriod && { borderColor: Colors.light.white },
              errorBorder,
            ]}
            onPress={() => {
              if (!canTogglePeriod) return;
              setIsPeriodDropdownOpen(!isPeriodDropdownOpen);
            }}
            activeOpacity={canTogglePeriod ? 0.8 : 1}
            disabled={!canTogglePeriod}
          >
            <Text style={styles.periodText}>{startPeriod}</Text>
            {canTogglePeriod ? (
              <Ionicons
                name="chevron-down"
                size={14}
                color={Colors.light.white}
                style={{ marginTop: 2 }}
              />
            ) : null}
          </TouchableOpacity>

          {isPeriodDropdownOpen && canTogglePeriod && alternatePeriod ? (
            <View style={styles.periodDropdown}>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setStartPeriod(alternatePeriod);
                  setIsPeriodDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownRadioOuter}>
                  <View style={styles.dropdownRadioInner} />
                </View>
                <Text style={styles.dropdownOptionText}>{alternatePeriod}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

interface DurationStepProps {
  durationHours: string;
  setDurationHours: (h: string) => void;
  durationMinutes: string;
  setDurationMinutes: (m: string) => void;
  styles: any;
}

/** True when hours or minutes has a value greater than zero. */
export function isDurationEntered(hours: string, minutes: string): boolean {
  const h = Number.parseInt(hours || "0", 10) || 0;
  const m = Number.parseInt(minutes || "0", 10) || 0;
  return h > 0 || m > 0;
}

export const DurationStep: React.FC<DurationStepProps> = ({
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  styles,
}) => {
  const [isHourFocused, setIsHourFocused] = React.useState(false);
  const [isMinuteFocused, setIsMinuteFocused] = React.useState(false);

  const sanitizeDigits = (text: string) =>
    text.replace(/[^0-9]/g, "").slice(0, 2);

  const clearDefaultZero = (value: string, setValue: (v: string) => void) => {
    if (value === "0" || value === "00") {
      setValue("");
    }
  };

  const restoreZeroIfEmpty = (value: string, setValue: (v: string) => void) => {
    if (value === "") {
      setValue("0");
    }
  };

  return (
    <View style={styles.timePickerContainer}>
      <View style={styles.timePickerRow}>
        {/* Hour Input */}
        <TextInput
          style={[
            styles.timeInput,
            isHourFocused && { borderColor: Colors.light.white },
          ]}
          value={durationHours}
          onChangeText={(text) => setDurationHours(sanitizeDigits(text))}
          onFocus={() => {
            setIsHourFocused(true);
            clearDefaultZero(durationHours, setDurationHours);
          }}
          onBlur={() => {
            setIsHourFocused(false);
            restoreZeroIfEmpty(durationHours, setDurationHours);
          }}
          keyboardType="number-pad"
          maxLength={2}
          placeholder=""
          selectTextOnFocus={false}
        />
        <Text style={styles.timeUnitLabel}>h</Text>

        {/* Minute Input */}
        <TextInput
          style={[
            styles.timeInput,
            isMinuteFocused && { borderColor: Colors.light.white },
          ]}
          value={durationMinutes}
          onChangeText={(text) => setDurationMinutes(sanitizeDigits(text))}
          onFocus={() => {
            setIsMinuteFocused(true);
            clearDefaultZero(durationMinutes, setDurationMinutes);
          }}
          onBlur={() => {
            setIsMinuteFocused(false);
            restoreZeroIfEmpty(durationMinutes, setDurationMinutes);
          }}
          keyboardType="number-pad"
          maxLength={2}
          placeholder=""
          selectTextOnFocus={false}
        />
        <Text style={styles.timeUnitLabel}>m</Text>
      </View>
    </View>
  );
};
