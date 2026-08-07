import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
export const globalStyles = StyleSheet.create({
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalSelectionWrapper: {
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 10,
  },
  onboardingHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 18,
    textAlign: "left",
    lineHeight: 24,
    letterSpacing: 0.4,
  },
  greenCTA: {
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: 18,
    color: Colors.light.green,
  },
});
