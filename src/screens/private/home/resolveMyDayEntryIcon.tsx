import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Colors } from "@/constants/theme";
import { getDetailedIbadahIcon } from "./components/DetailedIbadahsProgressCards";
import { goalTypeToGoalId } from "@/src/utils/goalCycleCategoryMap";
import {
  matchFiveDailyPrayerName,
  matchSunnahSlotId,
  PRAYER_ICON_COMPONENTS,
  SUNNAH_ICON_COMPONENTS,
} from "@/src/utils/prayerSlotIcons";
import type { TodayGoalProgressEntry } from "./todayGoalsProgress";

const SLOT_ICON_SIZE = 18;

function isSunnahGoalType(goalType: string | undefined): boolean {
  const key = (goalType ?? "").toUpperCase();
  return key === "SUNNAH_RAWATIB" || key.includes("SUNNAH");
}

function isFiveDailyGoalType(goalType: string | undefined): boolean {
  const key = (goalType ?? "").toUpperCase();
  return (
    key === "FIVE_DAILY_PRAYERS" ||
    key === "CONGREGATIONAL_PRAYERS" ||
    key.includes("FIVE_DAILY") ||
    key.includes("CONGREGATIONAL")
  );
}

/**
 * Resolve the My Day row icon using the same glyphs as logging prayer-select
 * steps for slot-level entries, otherwise the shared goal-level ibadah icon.
 */
export function resolveMyDayEntryIcon(
  entry: TodayGoalProgressEntry,
  color: string = Colors.light.white,
  size: number = SLOT_ICON_SIZE,
): React.ReactNode {
  const title = entry.goalTitle;
  const line = entry.description;
  const goalType = entry.goalType;
  const category = entry.apiCategory ?? entry.category;

  if (isSunnahGoalType(goalType) || matchSunnahSlotId(title)) {
    const slotId = matchSunnahSlotId(title, line);
    if (slotId) {
      const Icon = SUNNAH_ICON_COMPONENTS[slotId];
      return <Icon color={color} size={size} />;
    }
  }

  if (isFiveDailyGoalType(goalType) || (!goalType && matchFiveDailyPrayerName(title))) {
    const prayer = matchFiveDailyPrayerName(title, line);
    if (prayer) {
      const Icon = PRAYER_ICON_COMPONENTS[prayer];
      return <Icon color={color} size={size} />;
    }
  }

  // Slot-like titles even when goalType is missing (e.g. "Before Fajr").
  const sunnahSlot = matchSunnahSlotId(title, line);
  if (sunnahSlot) {
    const Icon = SUNNAH_ICON_COMPONENTS[sunnahSlot];
    return <Icon color={color} size={size} />;
  }

  if (goalType) {
    const goalId = goalTypeToGoalId(String(category), goalType);
    if (goalId) {
      return getDetailedIbadahIcon(goalId, color, size);
    }
  }

  return <FontAwesome6 name="person-praying" size={size} color={color} />;
}
