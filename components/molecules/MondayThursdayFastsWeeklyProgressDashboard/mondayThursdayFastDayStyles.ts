import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type {
  MondayThursdayFastDayProgress,
  MondayThursdayFastDayState,
} from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";
import { rfs } from "@/src/utils/responsive";

/**
 * Today chip — Figma #2/#3/#6/#7/#10/#12/#17.
 * #16 delete-past has red border + trash but NO today chip fill.
 */
export function shouldShowTodayLabelBackground(
  day: MondayThursdayFastDayProgress,
): boolean {
  return Boolean(day.isToday);
}

export function getDayLabelTextStyle(
  day: MondayThursdayFastDayProgress,
  isSelected: boolean,
) {
  const { state, isToday } = day;

  // #7 logged today — bold white on today chip
  if (isToday) {
    if (state === "todayDisabled" || state === "goalAchieved") {
      return mondayThursdayDayLabelStyles.dayLabelTodayDisabled;
    }
    return mondayThursdayDayLabelStyles.dayLabelToday;
  }

  // #8 logged past — muted grey (never treat as “active white”)
  if (state === "completed") {
    return mondayThursdayDayLabelStyles.dayLabelMuted;
  }

  if (isSelected) {
    return mondayThursdayDayLabelStyles.dayLabelActive;
  }

  switch (state as MondayThursdayFastDayState) {
    case "planned":
    case "plannedToday":
    case "missed":
    case "future":
      return mondayThursdayDayLabelStyles.dayLabelMuted;
    case "disabledPast":
    case "pastNeutral":
    case "goalAchieved":
      return mondayThursdayDayLabelStyles.dayLabelInactive;
    default:
      return mondayThursdayDayLabelStyles.dayLabelMuted;
  }
}

export const mondayThursdayDayLabelStyles = StyleSheet.create({
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
    fontSize: rfs(10),
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
  dayLabelToday: {
    color: Colors.light.white,
    fontSize: rfs(10),
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  dayLabelTodayDisabled: {
    color: Colors.light.grey,
    fontSize: rfs(10),
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
  dayLabelActive: {
    color: Colors.light.white,
    fontSize: rfs(10),
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  dayLabelMuted: {
    color: Colors.light.subtext,
    fontSize: rfs(10),
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
  dayLabelInactive: {
    color: Colors.light.graylightshade,
    fontSize: rfs(10),
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
  },
});
