import { StyleSheet, Dimensions } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { fonts } from "../../../assets/fonts";
import { Colors } from "../../../constants/theme";

const CARD_WIDTH = Dimensions.get("window").width - 32;

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.blackBackground,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingTop: hp(8),
      paddingBottom: hp(4),
    },

    // Top Section
    topSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: hp(3),
      paddingHorizontal: wp(2),
    },

    // Avatar Container (Circular, No Edit Button)
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 35,
      backgroundColor: Colors.light.calendarBg,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: Colors.light.white,
    },

    // Streak Counter Box
    streakBox: {
      width: 65,
      height: 40,
      borderRadius: 12,
      backgroundColor: Colors.light.calendarBg,
      justifyContent: "center",
      alignItems: "center",
      //borderWidth: 1.5,
      // borderColor: Colors.light.green,
    },

    streakText: {
      color: Colors.light.white,
      fontSize: 16,
      fontFamily: fonts.primary.bold,
    },

    // Badr Text (Center)
    badrText: {
      color: Colors.light.grey,
      fontSize: 24,
      fontFamily: fonts.primary.semiBold,
      textAlign: "center",
      marginBottom: hp(3),
      marginTop: hp(1),
    },

    // Prayer Card Wrapper
    prayerCardWrapper: {
      position: "relative",
      marginBottom: hp(3),
    },

    // Close Button
    closeButton: {
      position: "absolute",
      top: 6,
      right: 8,
      zIndex: 10,
      padding: 8,
    },

    // Prayer Card Container
    prayerCardContainer: {
      backgroundColor: Colors.light.calendarBg,
      borderRadius: 16,
      padding: wp(5),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      //borderWidth: 1,
      //borderColor: Colors.light.green,
      //minHeight: 120,
    },

    // Left Side - Prayer Details
    prayerDetailsLeft: {
      flex: 1,
      justifyContent: "center",
    },

    upcomingText: {
      color: Colors.light.white,
      fontSize: 12,
      fontFamily: fonts.primary.regular,
      marginBottom: hp(1),
      fontWeight: "400",
    },

    prayerNameText: {
      color: Colors.light.white,
      fontSize: 20,
      fontFamily: fonts.primary.bold,
      marginBottom: hp(0.8),
    },

    timeText: {
      color: Colors.light.white,
      fontSize: 12,
      fontFamily: fonts.primary.regular,
    },

    // Right Side - Date
    dateRight: {
      justifyContent: "center",
      alignItems: "flex-end",
      paddingLeft: wp(3),
    },

    dateText: {
      color: Colors.light.white,
      fontSize: 12,
      fontFamily: fonts.primary.regular,
      textAlign: "right",
      lineHeight: 18,
    },

    // Categories Section
    categoriesContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: wp(2),
      marginTop: hp(2),
    },

    categoryItemWrapper: {
      flex: 1,
      alignItems: "center",
    },

    // Category Circle
    categoryCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: Colors.light.blackBackground,
      borderWidth: 2,
      borderColor: Colors.light.calendarBg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(1.2),
    },

    percentageText: {
      color: Colors.light.white,
      fontSize: 16,
      fontFamily: fonts.primary.bold,
    },

    // Category Label with Arrow
    categoryLabelWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    categoryLabel: {
      color: Colors.light.white,
      fontSize: 11,
      fontFamily: fonts.primary.semiBold,
      textAlign: "center",
    },

    // Containers Section
    containersSection: {
      marginTop: hp(3),
      marginBottom: hp(2),
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },

    horizontalScrollContainer: {
      gap: 16,
    },

    // Scrollable Card (No 3D Effect)
    scrollableCard: {
      width: CARD_WIDTH,
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      padding: wp(5),
    },

    // Green Circle Indicator

    // Container Title
    containerTitle: {
      color: Colors.light.white,
      fontSize: 16,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      marginBottom: hp(1.2),
      lineHeight: 20,
    },

    // Content Wrapper
    contentWrapper: {
      flexDirection: "row",
      flexWrap: "wrap",
    },

    // Container Content (Regular Text)
    containerContent: {
      color: Colors.light.white,
      fontSize: 14,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      lineHeight: 19,
      letterSpacing: 0,
    },

    // Highlighted Text (Medium Weight)
    highlightedText: {
      color: Colors.light.white,
      fontSize: 14,
      fontFamily: fonts.primary.medium,
      fontWeight: "500",
      lineHeight: 19,
      letterSpacing: 0,
    },
    // Days Left Container
    daysLeftContainer: {
      width: CARD_WIDTH,
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      padding: wp(5),
      marginTop: 16,
      alignItems: "center",
    },

    // Days Header Wrapper
    daysHeaderWrapper: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2),
    },

    // Days Number Bold (First 28)
    daysNumberBold: {
      color: Colors.light.white,
      fontSize: 16,
      fontFamily: fonts.primary.bold,
      fontWeight: "600",
      marginRight: 2,
    },

    // Days Number Regular (/28 days left)
    daysNumberRegular: {
      color: Colors.light.white,
      fontSize: 16,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
    },

    // Large Circle (Moon)
    largeCircle: {
      width: 220,
      height: 220,
      borderRadius: 115,
      backgroundColor: "#000000",
      marginVertical: hp(2),
    },

    // Bottom Info Wrapper
    bottomInfoWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      width: "100%",
      marginTop: hp(2),
    },

    // Bottom Left Section
    bottomLeftSection: {
      alignItems: "flex-start",
    },

    // Bottom Right Section
    bottomRightSection: {
      alignItems: "center",
    },

    // Bottom Label
    bottomLabel: {
      color: Colors.light.grey,
      fontSize: 12,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      marginBottom: hp(0.5),
    },

    // Bottom Value
    bottomValue: {
      color: Colors.light.grey,
      fontSize: 18,
      fontFamily: fonts.primary.bold,
      fontWeight: "600",
    },

    // ── Inspiration Cards Section ──────────────────────────────────────────────

    inspirationSection: {
      marginTop: 16,
      marginBottom: 16,
      //width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    inspirationScrollContainer: {
      gap: 16,
    },

    inspirationCard: {
      width: CARD_WIDTH,
      height: 130,
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      padding: 16,
      justifyContent: "flex-start",
    },



    // Card Title — SF Pro Medium 18px, small-caps effect via letterSpacing + textTransform
    inspirationTitle: {
      color: Colors.light.white,
      fontFamily: fonts.primary.medium,
      fontWeight: "500",
      fontSize: 18,
      lineHeight: 20,
      letterSpacing: 0,
      textTransform: "uppercase",
      marginBottom: 6,
    },

    // Quote text — SF Pro Semibold 14px
    inspirationQuote: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      flexShrink: 1,
    },

    // Reference — SF Pro MediumItalic 14px
    inspirationReference: {
      color: Colors.light.white,
      fontFamily: fonts.primary.mediumItalic,
      fontWeight: "500",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
    },

    // Pagination dots
    inspirationDots: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginTop: 10,
    },

    inspirationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.light.grey,
    },

    inspirationDotActive: {
      backgroundColor: Colors.light.green,
      width: 7,
      borderRadius: 3,
    },
    // Log Menstruation Container Styles
    menstruationContainer: {
      width: 320,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(29, 191, 115, 0.1)", // Green color with 0.1 opacity (10%)
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 8,
    },
    menstruationInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    greenPlusCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: Colors.light.green,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: Colors.light.green,
    },
    menstruationText: {
      fontFamily: fonts.primary.bold || "SF Pro Text",
      fontWeight: "700",
      fontSize: 13,
      color: Colors.light.green,
      letterSpacing: 0.5,
    },
  });

export default createStyles;
