import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type {
  WhiteDaysFastDayProgress,
  WhiteDaysFastDayState,
} from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsWeeklyData";

export function shouldShowTodayLabelBackground(
  day: WhiteDaysFastDayProgress,
): boolean {
  return day.isToday && day.state !== "inactive";
}

export function getDayLabelTextStyle(
  day: WhiteDaysFastDayProgress,
  isSelected: boolean,
) {
  const { state, isToday } = day;

  if (isToday && state !== "inactive") {
    return whiteDaysFastDayLabelStyles.dayLabelToday;
  }

  if (isSelected) {
    return whiteDaysFastDayLabelStyles.dayLabelActive;
  }

  switch (state as WhiteDaysFastDayState) {
    case "completed":
    case "upcoming":
    case "today":
      return whiteDaysFastDayLabelStyles.dayLabelMuted;
    case "missed":
    case "inactive":
      return whiteDaysFastDayLabelStyles.dayLabelInactive;
    default:
      return whiteDaysFastDayLabelStyles.dayLabelMuted;
  }
}

export const whiteDaysFastDayLabelStyles = StyleSheet.create({
  dayLabelWrapper: {
    marginTop: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 28,
    alignItems: "center",
  },
  dayLabelTodayBackground: {
    backgroundColor: Colors.light.darkgrey,
  },
  dayLabelToday: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
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
