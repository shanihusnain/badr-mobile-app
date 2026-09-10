import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const journalInsightStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.light.darkgrey,
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  summaryRingWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  summaryRingContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  summaryBehaviorCount: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    textAlign: "center",
  },
  summaryPercent: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    lineHeight: 32,
  },
  summaryHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    textAlign: "center",
    lineHeight: 21,
    opacity: 0.85,
  },
  behaviorCard: {
    backgroundColor: Colors.light.darkgrey,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  behaviorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  behaviorName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    lineHeight: 21,
  },
  behaviorDescription: {
    fontSize: 13,
    fontWeight: "400",
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
    opacity: 0.85,
    marginTop: 6,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
    marginTop: 14,
  },
  weekDayItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.light.calendarBg,
  },
  dayCircleCompleted: {
    backgroundColor: Colors.light.green,
    borderColor: Colors.light.green,
  },
  dayCirclePartial: {
    backgroundColor: Colors.light.calendarBg,
    borderColor: Colors.light.calendarBg,
  },
  dayCircleMissed: {
    backgroundColor: Colors.light.calendarBg,
    borderColor: Colors.light.calendarBg,
  },
  dayCircleEmpty: {
    backgroundColor: "transparent",
  },
  weekDayLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
  },
  weekDayDate: {
    fontSize: 10,
    fontWeight: "400",
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
  },
  periodRingWrap: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  periodCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
  },
});
