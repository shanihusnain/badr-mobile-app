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
    left: 20,
    bottom: 200,
    width: "52%",
    maxWidth: 176,
    zIndex: 3,
  },
  chartHintBubble: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(38, 46, 58, 0.96)",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  chartHintText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    textAlign: "center",
  },
  chartHintAction: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
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
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "rgba(38, 46, 58, 0.96)",
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
    gap: 6,
    marginTop: 10,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.calendarBg,
  },
  paginationDotActive: {
    backgroundColor: Colors.light.green,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
