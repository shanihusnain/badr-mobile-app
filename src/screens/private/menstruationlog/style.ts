import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  infoContainer: {
    alignSelf: "center",
    backgroundColor: Colors.light.greybuttonversion,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  infoText: {
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.2,
    color: Colors.light.white,
    textAlign: "left",
    textAlignVertical: "center", // vertical-align: middle equivalent
  },
  // Your Menstruation Period Section
  periodHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(4),
    paddingHorizontal: 0,
    gap: wp(2),
    alignSelf: "center",
  },
  periodHeaderText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.light.grey,
    textTransform: "uppercase",
    fontVariant: ["small-caps"],
  },
  periodHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.grey,
  },
  // I'm Menstruating Section
  menstruatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(5),
    paddingHorizontal: wp(4),
  },
  menstruatingText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.light.subtext,
    textAlign: "center",
    textTransform: "uppercase",
    fontVariant: ["small-caps"],
  },
  switchButton: {
    alignSelf: "flex-end",
  },
  // Start Date Section
  startDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(4),
    paddingHorizontal: wp(4),
  },
  startDateText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.light.subtext,
    textAlign: "center",
  },
  todayContainer: {
    width: 98,
    height: 32,
    borderRadius: 4,
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
  },
  todayContainerActive: {
    width: 98,
    height: 32,
    borderRadius: 4,
    backgroundColor: Colors.light.green,
    justifyContent: "center",
    alignItems: "center",
  },
  todayText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.light.white,
    textAlign: "center",
  },
  // Calendar Section
  calendarSection: {
    marginTop: hp(3),
  },
  calendarContainer: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    overflow: "hidden",
  },
  dateLabelsContainer: {
    paddingHorizontal: wp(4),
    paddingTop: 16,
    paddingBottom: 8,
  },
  gregorianDateText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.light.subtext,
    textAlign: "center",
    textTransform: "uppercase",
  },
  islamicDateText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.light.subtext,
    textAlign: "center",
  },
  startTimesContainer: {
    marginTop: 16,
    paddingHorizontal: wp(4),
    alignSelf: "flex-start",
    width: "100%",
  },
  startTimeQuestionText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.white,
    textAlign: "left",
  },
  radioOptionsList: {
    marginTop: 12,
    gap: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  radioOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  radioText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.light.green,
    height: 48,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(4),
    marginBottom: hp(2),
    width: "100%",
    maxWidth: 343,
    alignSelf: "center",
  },
  saveButtonText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: 16,
    color: Colors.light.white,
    textTransform: "uppercase",
  },
});

export default styles;
