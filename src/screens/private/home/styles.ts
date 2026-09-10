import { StyleSheet, Dimensions } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { fonts } from "../../../../assets/fonts";
import { Colors } from "../../../../constants/theme";

const CARD_WIDTH = Dimensions.get("window").width - 32;
const FASTING_LEGEND_TEXT_WIDTH = (Dimensions.get("window").width - 120) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 16,
    paddingBottom: 12,
    overflow: "visible",
  },
  scrollContainer: {
    flexGrow: 1,

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
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },

  streakText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
  },

  // Today Header Button
  todayButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
    height: 40,
  },
  todayButtonTextContainer: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 0,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  todayButtonText: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    fontSize: 13,
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
  badrLogoContainer: {
    alignItems: "center",
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
    flexDirection: "column",
    alignItems: "stretch",
  },
  prayerCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2.5),
  },
  prayerTimelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(1),
  },
  prayerTimelineIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2C3E50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2C3E50",
  },
  prayerTimelineDash: {
    flex: 1,
    height: 0,
    borderTopWidth: 1.2,
    borderStyle: "dashed",
    borderColor: Colors.light.white,
    marginHorizontal: 2,
    opacity: 0.89,
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

  // Collapsed sticky category header (parallax)
  collapsedHeader: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  collapsedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  collapsedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  collapsedLabel: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    marginLeft: 10,
    fontWeight: "600",
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
    overflow: "visible",
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
    backgroundColor: Colors.light.blackBackground,
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
    borderRadius: 12,
    backgroundColor: Colors.light.lightgreen, // Green color with 0.1 opacity (10%)
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
    width: "100%",
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
  // Customize Your Journal Container
  journalContainer: {
    width: CARD_WIDTH,
    height: 150,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 16,
    padding: 16,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  journalTitle: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.light.white,
  },
  journalDescription: {
    fontFamily: fonts.primary.regular || "SF Pro Text",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: Colors.light.white,
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  getStartedText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.light.green,
    textTransform: "uppercase",
  },
  // My Dashboard Section
  dashboardSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: CARD_WIDTH,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  dashboardText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.light.white,
  },
  customizeContainer: {
    backgroundColor: Colors.light.lightgreen, // Green color with 0.1 opacity (10%)
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
  },
  customizeText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    color: Colors.light.green,
    textAlign: "right",
    textTransform: "uppercase",
    fontVariant: ["small-caps"],
  },
  // Category Filter Section
  categoryFilterScroll: {
    marginTop: 8,
    marginBottom: 8,
  },
  categoryFilterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 16,
  },
  categoryFilterItem: {
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 0,
  },
  categoryFilterItemWide: {
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 0,
  },
  categoryFilterItemActive: {
    backgroundColor: Colors.light.green,
  },
  categoryFilterText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.light.white,
    textAlign: "center",
  },
  categoryFilterTextActive: {
    color: Colors.light.white,
  },
  // Tahiyyat Al-Wudhu Container
  tahiyyatContainer: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  tahiyyatLeft: {
    flex: 1,
    gap: 4,
    width: "50%",
  },
  tahiyyatTitle: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.light.white,
    fontVariant: ["small-caps"],
    width: "96%",
  },
  tahiyyatSubtitle: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
  },
  tahiyyatNumber: {
    color: Colors.light.white,
  },
  tahiyyatDivider: {
    color: Colors.light.grey,
  },
  tahiyyatCircleWrapper: {
    marginTop: 8,
  },
  circleTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  circleMainText: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: Colors.light.white,
    textAlign: "center",
  },
  circlePercentText: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 7,
    lineHeight: 7,
    letterSpacing: 0,
    color: Colors.light.white,
  },
  // Today's Goals Progress
  todayGoalsProgressSection: {
    backgroundColor: Colors.light.darkgrey,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 20,
  },
  todayGoalsProgressTitle: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
    color: Colors.light.white,
  },
  dayProgressCard: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 7,
    marginBottom: 10,
  },
  dayProgressCardSwipeChild: {
    marginBottom: 0,
  },
  todayProgressSwipeWrapper: {
    borderRadius: 10,
    marginBottom: 10,
  },
  todayProgressSwipeContent: {
    paddingVertical: 0,
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  fastingCalendarSection: {
    width: "100%",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 10,
    marginTop: 16,
    paddingVertical: 17,
    paddingHorizontal: 12,
  },
  fastingInfoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.light.dullestWhite,
    paddingVertical: 17,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  fastingInfoBannerText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 14,
  },
  fastingInfoBannerClose: {
    flexShrink: 0,
    paddingTop: 1,
  },
  fastingCalendarTabsScroll: {
    marginTop: 16,
    marginBottom: 0,
  },
  fastingGoalTotalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fastingGoalTotalCardCompleted: {
    backgroundColor: Colors.light.dullestWhite,
  },
  fastingGoalTotalLabel: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  fastingGoalTotalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fastingGoalTotalValue: {
    fontWeight: "600",
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    color: Colors.light.white,
  },
  fastingGoalTotalValueCompleted: {
    color: Colors.light.green,
  },
  fastingGoalTotalBadge: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: Colors.light.dullestWhite,
  },
  fastingGoalTotalBadgeCompleted: {
    backgroundColor: Colors.light.lightgreen,
  },
  fastingGoalTotalBadgeText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 9,
    fontWeight: "400",
  },
  fastingGoalTotalBadgeTextCompleted: {
    color: Colors.light.green,
  },
  fastingCycleDatesContainer: {},
  fastingCycleGregorianDate: {
    fontWeight: "500",
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    color: Colors.light.white,
    textAlign: "center",
  },
  fastingCycleIslamicDate: {
    fontWeight: "400",
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    color: Colors.light.grey,
    textAlign: "center",
    marginTop: 4,
  },
  fastingLegendCard: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: Colors.light.dullestWhite,
    borderRadius: 10,
    padding: 12,
    paddingTop: 8,
  },
  fastingLegendCardClose: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  fastingLegendCardContent: {
    paddingRight: 20,
  },
  fastingLegendLayout: {
    gap: 12,
  },
  fastingLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fastingLegendRowCentered: {
    alignItems: "center",
  },
  fastingLegendColumn: {
    flex: 1,
    minWidth: 0,
  },
  fastingLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  fastingLegendItemFixed: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  fastingLegendTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  fastingLegendTextWrapFixed: {
    width: FASTING_LEGEND_TEXT_WIDTH,
  },
  fastingLegendText: {
    fontWeight: "500",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fonts.primary.medium,
    color: Colors.light.grey,
  },
  fastingLegendRing: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fastingLegendRingDot: {},
  fastingProgressLegendRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fastingCategoryLegend: {
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  fastingCategoryLegendRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  fastingCategoryLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fastingCategoryLegendLabel: {
    fontSize: 9,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.1,
    color: Colors.light.grey,
  },
  fastingCalendarWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  dayProgressHeaderRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dayProgressTimeBadgeWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dayProgressTimeBadge: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 15,
    color: Colors.light.white,
    backgroundColor: Colors.light.green,
    borderRadius: 6,
    padding: 8,
    fontWeight: "600",
  },
  dayProgressGoalTitle: {
    flex: 1,
    fontFamily: fonts.primary.semiBold,
    fontSize: 15,
    color: Colors.light.white,
    fontWeight: "600",
  },
  dayProgressGoalTitleFull: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dayProgressDetailRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dayProgressDescription: {
    flex: 1,
    fontFamily: fonts.primary.semiBold,
    fontSize: 15,
    color: Colors.light.white,
    fontWeight: "600",
  },
  dayProgressDescriptionFull: {
    flex: 1,
  },
  dayProgressDurationRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  dayProgressTimesColumn: {
    gap: 12,
  },
  dayProgressTimePlaceholder: {
    height: 13,
  },
  dayProgressMutedTime: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 11,
    fontWeight: "500",
  },
  dayProgressTimeline: {
    alignItems: "center",
  },
  dayProgressTimelineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.white,
  },
  dayProgressTimelineLine: {
    width: 1,
    height: 30,
    backgroundColor: Colors.light.green,
  },
  // Show More Button
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  showMoreText: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    color: Colors.light.white,
    textTransform: "uppercase",
    fontVariant: ["small-caps"],
  },
  goldenFab: {
    position: "absolute",
    width: 95,
    height: 95,
    zIndex: 1000,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  goldenFabGlowWrap: {
    width: 95,
    height: 95,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  goldenFabGlowDisc: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.light.golden,
  },
  goldenFabInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  goldenFabPlus: {
    fontSize: 38,
    fontWeight: "300",
    color: Colors.light.white,
    lineHeight: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 998,
  },
  fabMenuContainer: {
    position: "absolute",
    left: 16,
    zIndex: 999,
    alignItems: "flex-end",
  },
  fabOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    width: "100%",
  },
  fabOptionLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  fabOptionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.selectcategory,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  fabOptionIconCenter: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  // Time Spent Overview
  timeSpentContainer: {
    backgroundColor: Colors.light.dullestWhite,
    borderRadius: 10,
    padding: 10,
  },
  timeSpentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSpentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  timeSpentTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  timeSpentPercentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSpentPercentText: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
  timeSpentPeriodToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
    justifyContent: "center",
  },
  timeSpentPeriodButton: {
    borderRadius: 6,
    paddingHorizontal: 40,
    paddingVertical: 8,
  },
  timeSpentPeriodButtonSelected: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  timeSpentPeriodButtonUnselected: {
    backgroundColor: Colors.light.blackBackground,
  },
  timeSpentPeriodButtonText: {
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
  },
  timeSpentPeriodButtonTextSelected: {
    color: Colors.light.green,
  },
  timeSpentPeriodButtonTextUnselected: {
    color: Colors.light.grey,
  },
  timeSpentNavRowContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  timeSpentNavSection: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: 8,
  },
  timeSpentNavSectionExpanded: {
    flex: 1,
    width: "100%",
  },
  timeSpentNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeSpentNavLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
  },
  timeSpentTotalBlock: {
    alignSelf: "flex-end",
  },
  timeSpentTotalCaption: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  timeSpentTotalValue: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 24,
    fontWeight: "600",
  },
  timeSpentChartSection: {
    marginTop: 6,
  },
  timeSpentChartHint: {
    flex: 1,
    maxWidth: "50%",
    minWidth: 148,
    justifyContent: "flex-end",
    alignSelf: "stretch",
  },
  timeSpentChartHintBubble: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.dullestWhite,
    alignItems: "center",
    gap: 8,
  },
  timeSpentChartHintText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
    textAlign: "center",
  },
  timeSpentChartHintAction: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  timeSpentChartHintPointerRow: {
    alignItems: "center",
  },
  timeSpentChartHintPointer: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.light.dullestWhite,
  },
  timeSpentChartContainer: {
    height: 220,
    position: "relative",
  },
  timeSpentChartTouchLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  timeSpentXAxisContainerWeek: {
    height: 36,
    position: "relative",
  },
  timeSpentXAxisContainerMonth: {
    height: 20,
    position: "relative",
  },
  timeSpentXAxisLabelPosition: {
    position: "absolute",
    alignItems: "center",
  },
  timeSpentXAxisLabelDimmed: {
    opacity: 0.25,
  },
  timeSpentXAxisDayLabel: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 11,
  },
  timeSpentXAxisDateLabelWeek: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  timeSpentXAxisDateLabelMonth: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 10,
    textAlign: "center",
  },
  timeSpentXAxisDayLabelSelected: {
    color: Colors.light.white,
    fontWeight: "600",
  },
  timeSpentXAxisDateLabelWeekSelected: {
    color: Colors.light.green,
  },
  timeSpentXAxisDateLabelMonthSelected: {
    color: Colors.light.green,
    fontWeight: "600",
  },
  timeSpentDisclaimerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
  },
  timeSpentDisclaimerIcon: {
    marginTop: 2,
  },
  timeSpentDisclaimerText: {
    flex: 1,
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  timeSpentCategoryList: {
    gap: 16,
  },
  timeSpentCategoryRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSpentCategoryLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 14,
    fontWeight: "700",
  },
  timeSpentCategoryTimeBadge: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: Colors.light.white,
  },
  timeSpentCategoryTimeBadgeText: {
    color: Colors.light.green,
    fontWeight: "500",
    fontSize: 13,
    fontFamily: fonts.primary.medium,
  },
  timeSpentCategoryProgressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 4,
    backgroundColor: Colors.light.progressBarEmpty,
    overflow: "hidden",
    flexDirection: "row",
  },
  timeSpentCategoryProgressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.light.green,
    minWidth: 0,
  },
  fastingLegendItemUnsetWidth: {
    width: undefined,
  },
  timeSpentDetailPercentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSpentDetailSummaryBox: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.dullestWhite,
  },
  timeSpentDetailSummaryText: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  timeSpentDetailTabsScroll: {
    flexGrow: 0,
  },
  timeSpentDetailTabsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
