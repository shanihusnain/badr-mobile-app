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
    fontSize: 40,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 44,
  },
  achievementPercentSymbol: {
    fontSize: 22,
  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
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
    padding: 3,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
    width: "100%",
  },
  periodButton: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  periodButtonActive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  periodButtonInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  periodButtonText: {
    color: Colors.light.grey,
    fontSize: 11,
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
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
    minWidth: 0,
  },
});
