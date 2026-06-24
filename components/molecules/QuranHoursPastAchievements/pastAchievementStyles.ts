import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const INCOMPLETE_BAR_COLOR = Colors.light.goldenBright;

export const pastAchievementStyles = StyleSheet.create({
  chartSection: {
    marginTop: 2,
  },
  chartWrapper: {
    position: "relative",
    width: "100%",
    height: 210,
  },
  chartContainer: {
    width: "100%",
    height: 210,
    position: "relative",
  },
  chartHintOverlay: {
    position: "absolute",
    left: 60,
    bottom: 240,
    width: "45%",
    maxWidth: 140,
    zIndex: 3,
  },
  chartHintBubble: {
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.calendarBg,
  },
  chartHintText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
    textAlign: "center",
  },
  chartHintAction: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  chartHintPointerRow: {
    position: "absolute",
    right: -7,
    top: "42%",
    marginTop: -7,
  },
  chartHintPointer: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    alignSelf: "center",
    borderTopColor: Colors.light.calendarBg,
  },
  barHitArea: {
    position: "absolute",
    top: 12,
    bottom: 8,
    zIndex: 4,
  },
  xAxisContainer: {
    height: 28,
    position: "relative",
    marginTop: 4,
    overflow: "hidden",
  },
  xAxisLabelPosition: {
    position: "absolute",
    alignItems: "center",
  },
  xAxisLabelDimmed: {
    opacity: 0.25,
  },
  xAxisDateLabel: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 9,
    textAlign: "center",
  },
  xAxisDateLabelSelected: {
    color: Colors.light.green,
    fontWeight: "600",
  },
  barValueLabel: {
    position: "absolute",
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    width: 52,
    marginLeft: -26,
    zIndex: 5,
  },
  barValueLabelDimmed: {
    opacity: 0.25,
  },
  barValueLabelSelected: {
    fontWeight: "700",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.dullWhite,
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: Colors.light.green,
  },
});
