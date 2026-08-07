import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  heading: {
    color: Colors.light.white,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
  },
  subheading: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
  },
  stepsList: {
    marginTop: 24,
  },
  stepsContent: {
    paddingBottom: 32,
    gap: 6,
  },
  stepRow: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  stepRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    color: Colors.light.dullWhite,
    fontSize: 12,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
  },
  stepTitle: {
    color: Colors.light.dullWhite,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  stepsHeading: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
  },
});
