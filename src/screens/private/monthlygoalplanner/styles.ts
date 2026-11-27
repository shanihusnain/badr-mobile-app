import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { ms } from "@/src/utils/responsive";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  heading: {
    color: Colors.light.white,
    fontWeight: "600",
    fontSize: ms(16),
    fontFamily: fonts.primary.semiBold,
  },
  subheading: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: ms(14),
    fontFamily: fonts.primary.regular,
    lineHeight: ms(20),
  },
  stepsList: {
    marginTop: ms(32),
    flexGrow: 0,
  },
  stepsContent: {
    paddingBottom: ms(8),
    gap: ms(10),
  },
  screenBody: {
    flex: 1,
  },
  beginNowButton: {
    alignSelf: "center",
    marginTop: ms(52),
    marginBottom: 0,
  },
  stepRow: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(4),
    paddingHorizontal: ms(10),
    paddingVertical: ms(9),
    flexDirection: "row",
    alignItems: "center",
  },
  stepRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: ms(5),
    paddingVertical: ms(2),
    borderRadius: ms(4),
  },
  categoryText: {
    color: Colors.light.dullWhite,
    fontSize: ms(12),
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
  },
  stepTitle: {
    color: Colors.light.dullWhite,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: ms(14),
    letterSpacing: 0.1,
  },
  stepsHeading: {
    color: Colors.light.white,
    fontSize: ms(14),
    fontFamily: fonts.primary.regular,
    lineHeight: ms(20),
  },
  stepTick: {
    width: ms(16),
    height: ms(16),
    borderRadius: ms(16),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.light.white,
  },
});
