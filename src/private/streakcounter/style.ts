import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.blackBackground,
      paddingHorizontal: 16,
    },
    // Header Row

    // Hero Section
    heroSection: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: hp(3),
      marginTop: hp(13),
    },
    streakNumber: {
      fontFamily: fonts.primary.bold,
      fontWeight: "600",
      fontSize: 60,
      lineHeight: 60,
      letterSpacing: 0,
      textAlign: "center",
      textTransform: "uppercase",
      color: Colors.light.white,
      marginBottom: hp(2),
    },
    streakSublabel: {
      fontFamily: fonts.primary.medium,
      fontWeight: "500",
      fontSize: 14,
      color: Colors.light.white,
      letterSpacing: 0.5,
      textAlign: "center",
      //marginBottom: hp(4),
    },
    // Bottom Stats Section
    statsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      marginTop: hp(-2),
    },
    statsColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    statsValue: {
      fontFamily: fonts.primary.medium,
      fontWeight: "500",
      fontSize: 15,
      color: Colors.light.white,
      marginBottom: 6,
      textAlign: "center",
    },
    statsValueLight: {
      fontFamily: fonts.primary.light,
      fontWeight: "300",
      fontSize: 15,
      color: Colors.light.white,
      marginBottom: 6,
      textAlign: "center",
    },
    statsLabel: {
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 12,
      color: Colors.light.grey,
      textAlign: "center",
    },
    verticalDivider: {
      width: 1,
      height: 35,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    thisWeekContainer: {
      width: 343,
      height: 110,
      marginTop: 20, // positioned under the stats grid
      alignSelf: "center",
      backgroundColor: Colors.light.greybuttonversion,
      borderRadius: 16,
      padding: 16,
      opacity: 1,
    },
    thisWeekHeader: {
      fontFamily: "SF Pro Text",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 14, // 100% line-height
      letterSpacing: 0,
      fontVariant: ["small-caps"],
      color: Colors.light.white,
      marginBottom: 16,
    },
    daysRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    dayText: {
      fontFamily: "SF Pro Text",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 14,
      letterSpacing: 0,
      fontVariant: ["small-caps"],
      color: Colors.light.grey || "#8e8e93",
    },
    // Milestone Container (Same size: width: 343, height: 110)
    milestoneContainer: {
      width: 343,
      height: 110,
      marginTop: 16,
      alignSelf: "center",
      backgroundColor: Colors.light.greybuttonversion,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      opacity: 1,
    },
    milestoneLeftCircle: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      borderWidth: 2,
      borderColor: Colors.light.green,
    },
    milestoneRightCircle: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      borderWidth: 2,
      borderColor: Colors.light.green,
    },
    milestoneCenterColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 12,
    },
    milestoneDays: {
      fontFamily: "SF Pro Text",
      fontWeight: "600",
      fontSize: 18,
      color: Colors.light.white,
      marginBottom: 8,
    },
    progressLineBg: {
      width: 190, // Extended width of the line from 150 to 190
      height: 5, // Slightly thicker
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 12,
      marginBottom: 8,
      overflow: "hidden",
    },
    progressLineFill: {
      width: "50%",
      height: "100%",
      backgroundColor: Colors.light.green,
      borderRadius: 12,
    },
    milestoneSubtext: {
      fontFamily: "SF Pro Text",
      fontWeight: "400",
      fontSize: 11,
      lineHeight: 12,
      letterSpacing: 0,
      color: Colors.light.grey,
      textAlign: "center",
    },
    // Consistency Container (Same size: width: 343, height: 110 or flexible based on padding, but user asked for "same size container" - let's make it 343 width and well-padded, or height 110 with scroll/exact sizing. Let's make it highly premium)
    consistencyContainer: {
      width: 343,
      minHeight: 110,
      marginTop: 16,
      alignSelf: "center",
      backgroundColor: Colors.light.greybuttonversion,
      borderRadius: 16,
      padding: 14,
      opacity: 1,
    },
    consistencyHeader: {
      fontFamily: "SF Pro Text",
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0,
      color: Colors.light.white,
      marginBottom: 6,
    },
    consistencyBody: {
      fontFamily: "SF Pro Text",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 0.1,
      color: Colors.light.grey,
      textAlignVertical: "bottom", // vertical-align: bottom
    },
  });

export default createStyles;
