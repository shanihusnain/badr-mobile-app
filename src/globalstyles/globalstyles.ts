import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { ms } from "@/src/utils/responsive";
import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalSelectionWrapper: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#2F4053",
    borderRadius: ms(6),
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
    // Vertical gap is owned by GoalPlannerSheet (12 under card / 20 between items).
    marginVertical: 0,
  },
  onboardingHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: ms(18),
    textAlign: "left",
    lineHeight: ms(24),
    letterSpacing: 0.4,
  },
  greenCTA: {
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(17),
    color: Colors.light.green,
    lineHeight: ms(22),
  },
});
