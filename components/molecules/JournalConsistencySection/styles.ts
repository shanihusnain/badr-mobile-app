import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const journalConsistencySectionStyles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
  },
  achievementBlock: {
    flex: 3,
    alignItems: "flex-start",
    gap: 4,
  },
  consistencyCaptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  consistencyInfoBadge: {
    backgroundColor: Colors.light.darkgrey,
    height: 12,
    width: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    marginTop: 4,
  },
  achievementPercentSymbol: {
    fontSize: 16,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 16,

  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.lightgreen,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  deltaBadgeNegative: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  deltaText: {
    color: Colors.light.green,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  deltaTextNegative: {
    color: Colors.light.subtext,
  },
  periodNavRow: {
    flex: 6,
    minWidth: 0,
    alignItems: "stretch",
    gap: 10,
  },
  periodToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    backgroundColor: Colors.light.timeLineChip,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#000000",
    overflow: "hidden",
    width: "100%",
  },
  periodButton: {
    flex: 1,
    borderRadius: 0,
    paddingHorizontal: 2,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  periodButtonActive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  periodButtonActiveFirst: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  periodButtonActiveLast: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  periodButtonActiveMiddle: {
    borderRadius: 4,
  },
  periodButtonInactive: {
    backgroundColor: Colors.light.timeLineChip,
  },
  periodButtonText: {
    color: Colors.light.grey,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
  },
  periodButtonTextActive: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  dateNavRow: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    minHeight: 28,
    alignSelf: "center",
  },
  navBtn: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    flexShrink: 0,
  },
  dateRange: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
    minWidth: 0,
  },
});
