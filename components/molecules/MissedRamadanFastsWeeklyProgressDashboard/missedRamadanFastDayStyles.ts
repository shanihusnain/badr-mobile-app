import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type {
  MissedRamadanFastDayProgress,
  MissedRamadanFastDayState,
} from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsWeeklyData";

/**
 * Today chip — Figma #2/#3/#6/#7/#10/#12/#17 only.
 * #16 delete-past has red border + trash but NO today chip.
 */
export function shouldShowTodayLabelBackground(
  day: MissedRamadanFastDayProgress,
): boolean {
  return Boolean(day.isToday);
}

export function getDayLabelTextStyle(
  day: MissedRamadanFastDayProgress,
  isSelected: boolean,
) {
  const { state, isToday } = day;

  // Figma: all today variants use bold white label (incl. today disabled)
  if (isToday) {
    if (state === "goalAchieved") {
      return missedRamadanDayLabelStyles.dayLabelTodayDisabled;
    }
    return missedRamadanDayLabelStyles.dayLabelToday;
  }

  if (isSelected) {
    return missedRamadanDayLabelStyles.dayLabelActive;
  }

  switch (state as MissedRamadanFastDayState) {
    case "completed":
    case "planned":
    case "plannedToday":
    case "plannedSkipped":
    case "future":
    case "disabledPast":
      return missedRamadanDayLabelStyles.dayLabelMuted;
    case "pastNeutral":
    case "goalAchieved":
      return missedRamadanDayLabelStyles.dayLabelInactive;
    default:
      return missedRamadanDayLabelStyles.dayLabelMuted;
  }
}

export const missedRamadanDayLabelStyles = StyleSheet.create({
  dayLabelWrapper: {
    marginTop: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 28,
    alignItems: "center",
  },
  dayLabelTodayBackground: {
    backgroundColor: Colors.light.dayProgressCardBg,
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
  dayLabelToday: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  dayLabelTodayDisabled: {
    color: Colors.light.grey,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
  dayLabelActive: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  dayLabelMuted: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
  dayLabelInactive: {
    color: Colors.light.graylightshade,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
});
