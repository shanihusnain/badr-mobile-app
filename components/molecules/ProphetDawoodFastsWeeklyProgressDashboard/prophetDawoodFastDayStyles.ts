import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type {
  ProphetDawoodFastDayProgress,
  ProphetDawoodFastDayState,
} from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsWeeklyData";

export function shouldShowTodayBackground(
  day: ProphetDawoodFastDayProgress,
): boolean {
  return day.isToday;
}

export function getDayLabelTextStyle(
  day: ProphetDawoodFastDayProgress,
  isSelected: boolean,
) {
  const { state, isToday } = day;

  if (isToday) {
    if (state === "todayDisabled") {
      return prophetDawoodFastDayLabelStyles.dayLabelTodayDisabled;
    }
    return prophetDawoodFastDayLabelStyles.dayLabelToday;
  }

  if (isSelected) {
    return prophetDawoodFastDayLabelStyles.dayLabelActive;
  }

  switch (state as ProphetDawoodFastDayState) {
    case "completed":
    case "upcoming":
    case "today":
      return prophetDawoodFastDayLabelStyles.dayLabelMuted;
    case "missed":
    case "inactive":
    case "todayDisabled":
      return prophetDawoodFastDayLabelStyles.dayLabelInactive;
    default:
      return prophetDawoodFastDayLabelStyles.dayLabelMuted;
  }
}

export const prophetDawoodFastDayLabelStyles = StyleSheet.create({
  dayItemTodayBackground: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  dayLabelWrapper: {
    marginTop: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 28,
    alignItems: "center",
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
