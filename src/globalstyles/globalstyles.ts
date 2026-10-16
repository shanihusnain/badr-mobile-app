import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { rfs } from "@/src/utils/responsive";
export const globalStyles = StyleSheet.create({
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalSelectionWrapper: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#2F4053",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    // Vertical gap is owned by GoalPlannerSheet (12 under card / 20 between items).
    marginVertical: 0,
  },
  onboardingHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: rfs(18),
    textAlign: "left",
    lineHeight: rfs(24),
    letterSpacing: 0.4,
  },
  greenCTA: {
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
    fontSize: rfs(18),
    color: Colors.light.green,
    lineHeight: rfs(22),
  },
});
