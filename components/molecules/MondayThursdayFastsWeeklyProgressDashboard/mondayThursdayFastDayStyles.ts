import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type {
  MondayThursdayFastDayProgress,
  MondayThursdayFastDayState,
} from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";

/** Today chip behind ring + label for every “today” variant in Figma. */
export function shouldShowTodayLabelBackground(
  day: MondayThursdayFastDayProgress,
): boolean {
  return day.isToday;
}

export function getDayLabelTextStyle(
  day: MondayThursdayFastDayProgress,
  isSelected: boolean,
) {
  const { state, isToday } = day;

  if (isToday) {
    if (state === "todayDisabled" || state === "goalAchieved") {
      return mondayThursdayDayLabelStyles.dayLabelTodayDisabled;
    }
    return mondayThursdayDayLabelStyles.dayLabelToday;
  }

  if (isSelected) {
    return mondayThursdayDayLabelStyles.dayLabelActive;
  }

  switch (state as MondayThursdayFastDayState) {
    case "completed":
    case "planned":
    case "plannedToday":
    case "missed":
      return mondayThursdayDayLabelStyles.dayLabelMuted;
    case "future":
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
