import { StyleSheet, Dimensions } from "react-native";
import { fonts } from "../../../../assets/fonts";
import { Colors } from "../../../../constants/theme";
import { getFigmaForcedSmallCapsTextStyle } from "@/src/utils/figmaTypography";
import { ms, s } from "@/src/utils/responsive";
const CARD_WIDTH = Dimensions.get("window").width - ms(32);

/** Consistent vertical gap between major home ScrollView sections. */
export const HOME_SECTION_GAP = ms(24);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: ms(16),
    paddingBottom: ms(12),
    overflow: "visible",
  },
  scrollContainer: {
    flexGrow: 1,

    paddingBottom: ms(32),
  },

  // Top Section
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: HOME_SECTION_GAP,
    paddingHorizontal: ms(8),
  },
  deltaBadgePlaceholder: {
    height: ms(24),
  },
  deltaText: {
    color: Colors.light.white,
    fontSize: ms(10),
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  deltaSlot: {
    minWidth: 0,
    marginRight: ms(8),
    justifyContent: "center",
    height: ms(24),
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(4),
    backgroundColor: Colors.light.calendarBg,
    borderRadius: ms(2),
    paddingHorizontal: ms(7.5),
    paddingVertical: ms(4),
    height: ms(24),
    marginTop: ms(24),
  },
  // Avatar Container (Circular, No Edit Button)
  avatarContainer: {
    width: s(40),
    height: s(40),
    borderRadius: ms(35),
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.white,
  },

  // Streak Counter Box
  streakBox: {
    width: s(67),
    height: ms(36),
    borderRadius: ms(6),
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: ms(4),
  },

  streakText: {
    color: Colors.light.white,
    fontSize: ms(16),
    fontFamily: fonts.primary.bold,
  },

  // Today Header Button
  todayButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(12),
    paddingHorizontal: ms(8),
    paddingVertical: ms(6),
    gap: ms(2),
    height: s(40),
  },
  todayButtonTextContainer: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: ms(8),
    paddingHorizontal: ms(20),
    paddingVertical: 0,
    height: ms(36),
    justifyContent: "center",
    alignItems: "center",
  },
  todayButtonText: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    fontSize: ms(13),
  },

  // Badr Text (Center)
  badrText: {
    color: Colors.light.grey,
    fontSize: ms(24),
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
    marginBottom: ms(24),
    marginTop: ms(8),
  },
  badrLogoContainer: {
    alignItems: "center",
    marginBottom: HOME_SECTION_GAP,
  },

  // Prayer Card Wrapper
  prayerCardWrapper: {
    position: "relative",
    marginBottom: HOME_SECTION_GAP,
  },

  // Close Button
  closeButton: {
    position: "absolute",
    top: ms(6),
    right: ms(8),
    zIndex: 10,
    padding: ms(8),
  },

  // Prayer Card Container
  prayerCardContainer: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: ms(16),
    padding: ms(20),
    flexDirection: "column",
    alignItems: "stretch",
  },
  prayerCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ms(16),
  },
  prayerTimelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingHorizontal: ms(4),
  },
  prayerTimelineIcon: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: "#2C3E50",
    justifyContent: "center",
    alignItems: "center",
  },
  prayerTimelineDash: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: ms(2),
  },
  prayerTimelineDashDot: {
    width: ms(5),
    height: 1.5,
    borderRadius: ms(0.75),
    backgroundColor: Colors.light.white,
    opacity: 0.89,
  },

  // Left Side - Prayer Details
  prayerDetailsLeft: {
    flex: 1,
    justifyContent: "center",
  },

  upcomingText: {
    color: Colors.light.white,
    fontSize: ms(12),
    fontFamily: fonts.primary.regular,
    marginBottom: ms(8),
    fontWeight: "400",
  },

  prayerNameText: {
    color: Colors.light.white,
    fontSize: ms(20),
    fontFamily: fonts.primary.bold,
    marginBottom: ms(6),
  },

  timeText: {
    color: Colors.light.white,
    fontSize: ms(12),
    fontFamily: fonts.primary.regular,
  },

  // Right Side - Date
  dateRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: ms(12),
  },

  dateText: {
    color: Colors.light.white,
    fontSize: ms(12),
    fontFamily: fonts.primary.regular,
    textAlign: "right",
    lineHeight: ms(18),
  },

  // Collapsed sticky category header (parallax)
  collapsedHeader: {
    position: "absolute",
    top: ms(10),
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: Colors.light.blackBackground,
    // paddingHorizontal: ms(16),
    paddingTop: ms(8),
    paddingBottom: ms(10),
  },
  collapsedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: ms(10),
  },
  collapsedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
  },
  collapsedLabel: {
    ...getFigmaForcedSmallCapsTextStyle({
      fontSize: ms(12),
      letterSpacing: ms(0.4),
      color: Colors.light.white,
      textAlign: "center",
    }),
  },

  // Categories Section
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: ms(5),
    marginBottom: HOME_SECTION_GAP,
  },
  // Keep layout height while collapsed sticky is up so scroll doesn't jump
  categoriesContainerHidden: {
    opacity: 0,
  },

  categoryItemWrapper: {
    flex: 1,
    alignItems: "center",
    // overflow: "visible",
    justifyContent: "center",
    paddingHorizontal: ms(10),
  },

  // Category Circle
  categoryCircle: {
    width: s(73),
    height: s(73),
    borderRadius: ms(36.5),
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 2,
    borderColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(10),
  },

  percentageText: {
    color: Colors.light.white,
    fontSize: ms(18),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },

  // Category Label with Arrow — row is centered under the ring; equal-width
  // spacer balances the chevron so the text sits on the circle’s axis.
  categoryLabelWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  categoryLabelInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(2),
  },

  categoryLabelChevronSlot: {
    width: ms(16),
    height: ms(16),
    alignItems: "center",
    justifyContent: "center",
  },

  categoryLabel: {
    ...getFigmaForcedSmallCapsTextStyle({
      fontSize: ms(14),
      letterSpacing: ms(0.4),
      color: Colors.light.white,
      textAlign: "center",
    }),
  },

  // Containers Section
  containersSection: {
    marginBottom: HOME_SECTION_GAP,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  moonSection: {
    width: CARD_WIDTH,
    alignSelf: "center",
    marginBottom: HOME_SECTION_GAP,
  },

  journalWeekSection: {
    marginBottom: HOME_SECTION_GAP,
  },

  horizontalScrollContainer: {
    gap: ms(16),
  },

  // Scrollable Card (No 3D Effect)
  scrollableCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(16),
    padding: ms(20),
  },

  // Green Circle Indicator

  // Container Title
  containerTitle: {
    color: Colors.light.white,
    fontSize: ms(16),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: ms(10),
    lineHeight: ms(20),
  },

  // Content Wrapper
  contentWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // Container Content (Regular Text)
  containerContent: {
    color: Colors.light.white,
    fontSize: ms(14),
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: ms(19),
    letterSpacing: 0,
  },

  // Highlighted Text (Medium Weight)
  highlightedText: {
    color: Colors.light.white,
    fontSize: ms(14),
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: ms(19),
    letterSpacing: 0,
  },
  // Days Left Container
  daysLeftContainer: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(16),
    padding: ms(20),
    marginTop: ms(16),
    alignItems: "center",
  },

  // Days Header Wrapper
  daysHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ms(16),
  },

  // Days Number Bold (First 28)
  daysNumberBold: {
    color: Colors.light.white,
    fontSize: ms(16),
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    marginRight: ms(2),
  },

  // Days Number Regular (/28 days left)
  daysNumberRegular: {
    color: Colors.light.white,
    fontSize: ms(16),
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },

  // Large Circle (Moon)
  largeCircle: {
    width: s(220),
    height: s(220),
    borderRadius: ms(115),
    backgroundColor: Colors.light.blackBackground,
    marginVertical: ms(16),
  },

  // Bottom Info Wrapper
  bottomInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    marginTop: ms(16),
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
    fontSize: ms(12),
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    marginBottom: ms(4),
  },

  // Bottom Value
  bottomValue: {
    color: Colors.light.grey,
    fontSize: ms(18),
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
  },

  // ── Inspiration Cards Section ──────────────────────────────────────────────

  inspirationSection: {
    marginBottom: HOME_SECTION_GAP,
    //width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  inspirationScrollContainer: {
    gap: ms(16),
  },

  inspirationCard: {
    width: CARD_WIDTH,
    height: s(130),
    borderRadius: ms(16),
    padding: ms(16),
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  inspirationCardImage: {
    borderRadius: ms(16),
  },

  // Card Title — SF Pro Text Semibold 14px
  inspirationTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: ms(-0.1),
    textTransform: "uppercase",
    textAlignVertical: "center",
    marginBottom: ms(6),
  },

  // Quote text — SF Pro Text Semibold 14px
  inspirationQuote: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: ms(-0.1),
    textAlignVertical: "center",
    flexShrink: 1,
  },

  // Reference — SF Pro Text Semibold 14px
  inspirationReference: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: ms(-0.1),
    textAlignVertical: "center",
  },

  // Pagination dots
  inspirationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: ms(6),
    marginTop: ms(10),
  },

  inspirationDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: Colors.light.grey,
  },

  inspirationDotActive: {
    backgroundColor: Colors.light.green,
    width: ms(7),
    borderRadius: ms(3),
  },
  // Log Menstruation Container Styles
  menstruationContainer: {
    borderRadius: ms(12),
    backgroundColor: Colors.light.lightgreen, // Green color with 0.1 opacity (10%)
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: HOME_SECTION_GAP,
    paddingVertical: ms(8),
    paddingHorizontal: ms(16),
    flexDirection: "row",
    gap: ms(8),
    width: "100%",
  },
  menstruationInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(8),
  },
  greenPlusCircle: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: Colors.light.green,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.green,
  },
  menstruationText: {
    fontFamily: fonts.primary.bold || "SF Pro Text",
    fontWeight: "700",
    fontSize: ms(13),
    color: Colors.light.green,
    letterSpacing: ms(0.5),
  },
  // Customize Your Journal Container
  journalContainer: {
    width: CARD_WIDTH,
    height: s(150),
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(16),
    padding: ms(16),
    alignSelf: "center",
    marginBottom: HOME_SECTION_GAP,
    gap: ms(10),
  },
  journalTitle: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: ms(16),
    lineHeight: ms(20),
    letterSpacing: 0,
    color: Colors.light.white,
  },
  journalDescription: {
    fontFamily: fonts.primary.regular || "SF Pro Text",
    fontWeight: "400",
    fontSize: ms(13),
    lineHeight: ms(18),
    letterSpacing: ms(0.1),
    color: Colors.light.white,
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
    alignSelf: "flex-start",
  },
  getStartedText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: ms(13),
    lineHeight: ms(18),
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
    marginBottom: HOME_SECTION_GAP,
  },
  myDaySection: {
    marginBottom: ms(12),
  },
  dashboardText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: ms(16),
    lineHeight: ms(20),
    letterSpacing: 0,
    color: Colors.light.white,
  },
  obligatoryPrayersSection: {
    width: "100%",
    marginBottom: HOME_SECTION_GAP,
  },
  obligatoryPrayersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: CARD_WIDTH,
    alignSelf: "center",
    marginBottom: HOME_SECTION_GAP,
  },
  obligatoryPrayersAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    backgroundColor: Colors.light.lightgreen,
    borderRadius: ms(4),
    paddingVertical: ms(4),
    paddingHorizontal: ms(8),
  },
  obligatoryPrayersAddIcon: {
    width: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    backgroundColor: Colors.light.green,
    alignItems: "center",
    justifyContent: "center",
  },
  obligatoryPrayersAddText: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(13),
    lineHeight: ms(16),
    color: Colors.light.green,
    textTransform: "uppercase",
  },
  obligatoryPrayersEmpty: {
    width: CARD_WIDTH,
    alignSelf: "center",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(14),
    padding: ms(16),
    minHeight: s(80),
    justifyContent: "center",
  },
  obligatoryPrayersEmptyText: {
    fontFamily: fonts.primary.regular,
    fontSize: ms(14),
    lineHeight: ms(20),
    color: Colors.light.subtext,
    textAlign: "center",
  },
  customizeContainer: {
    backgroundColor: Colors.light.lightgreen, // Green color with 0.1 opacity (10%)
    borderRadius: ms(4),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: ms(4),
    paddingHorizontal: ms(8),
    flexDirection: "row",
  },
  customizeText: {
    fontFamily: fonts.primary.semiBold || "SF Pro Text",
    fontWeight: "600",
    fontSize: ms(14),
    lineHeight: ms(14),
    letterSpacing: 0,
    color: Colors.light.green,
    textAlign: "right",
    textTransform: "uppercase",
    fontVariant: ["small-caps"],
  },
  // Category Filter Section — inter-block gap owned here (HOME_SECTION_GAP only)
  categoryFilterScroll: {
    marginTop: 0,
    marginBottom: HOME_SECTION_GAP,
  },
  categoryFilterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    paddingRight: ms(16),
  },
  myDayFilterTab: {
    paddingHorizontal: ms(14),
  },
  categoryFilterItem: {
    height: ms(28),
    borderRadius: ms(6),
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: ms(8),
    paddingVertical: ms(5),
    flexShrink: 0,
  },
  categoryFilterItemWide: {
    height: ms(28),
    borderRadius: ms(6),
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: ms(8),
    paddingVertical: ms(5),
    flexShrink: 0,
  },
  categoryFilterItemActive: {
    backgroundColor: Colors.light.green,
  },
  categoryFilterText: {
    fontFamily: fonts.primary.medium || "SF Pro Text",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(18),
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
    borderRadius: ms(11),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    alignSelf: "center",
    marginTop: ms(16),
    marginBottom: ms(8),
  },
  tahiyyatLeft: {
    flex: 1,
    gap: ms(4),
    width: "50%",
  },
  tahiyyatTitle: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(15),
    lineHeight: ms(18),
    letterSpacing: 0,
    color: Colors.light.white,
    fontVariant: ["small-caps"],
    width: "96%",
  },
  tahiyyatSubtitle: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(14),
    lineHeight: ms(14),
    letterSpacing: 0,
  },
  tahiyyatNumber: {
    color: Colors.light.white,
  },
  tahiyyatDivider: {
    color: Colors.light.grey,
  },
  tahiyyatCircleWrapper: {
    marginTop: ms(8),
  },
  circleTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  circleMainText: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12),
    letterSpacing: 0,
    color: Colors.light.white,
    textAlign: "center",
  },
  circlePercentText: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: ms(7),
    lineHeight: ms(7),
    letterSpacing: 0,
    color: Colors.light.white,
  },
  // Today's Goals Progress
  todayGoalsProgressSection: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(10),
    paddingHorizontal: ms(13),
    paddingVertical: ms(20),
    marginBottom: HOME_SECTION_GAP,
  },
  todayGoalsProgressTitle: {
    ...getFigmaForcedSmallCapsTextStyle({
      fontSize: ms(14),
      letterSpacing: ms(0.4),
      color: Colors.light.white,
    }),
  },
  todayGoalsProgressEmptyText: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(14),
    color: Colors.light.white,
  },
  dayProgressCard: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: ms(10),
    paddingBottom: ms(10),
    paddingHorizontal: ms(7),
  },
  dayProgressCardSwipeChild: {
    marginBottom: 0,
  },
  todayProgressSwipeWrapper: {
    borderRadius: ms(10),
    marginBottom: ms(10),
  },
  todayProgressSwipeContent: {
    paddingVertical: 0,
    backgroundColor: "transparent",
    borderRadius: ms(10),
  },
  fastingCalendarSection: {
    width: "100%",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(10),
    marginBottom: HOME_SECTION_GAP,
    paddingVertical: ms(17),
    paddingHorizontal: ms(12),
    gap: ms(14),
  },
  fastingCalendarSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(12),
  },
  fastingCalendarTrack: {
    width: "100%",
    gap: HOME_SECTION_GAP,
  },
  fastingInfoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: ms(10),
    backgroundColor: Colors.light.red,
    paddingVertical: ms(17),
    paddingHorizontal: ms(12),
    borderRadius: ms(10),
  },
  fastingInfoBannerText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: ms(14),
  },
  fastingInfoBannerClose: {
    flexShrink: 0,
    paddingTop: ms(1),
  },
  fastingCalendarTabsScroll: {
    marginTop: 0,
    marginBottom: 0,
    // Bleed past section padding so tabs can scroll edge-to-edge.
    marginHorizontal: ms(-12),
  },
  fastingCalendarTabsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    // Match section padding for first/last tab inset; do not set width
    // or content is locked to the viewport and cannot scroll horizontally.
    paddingHorizontal: ms(12),
  },
  fastingViewTab: {
    paddingHorizontal: ms(16),
  },
  fastingGoalTotalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.blackBackground,
    borderRadius: ms(10),
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
  },
  fastingGoalTotalCardCompleted: {
    backgroundColor: Colors.light.dullestWhite,
  },
  fastingGoalTotalLabel: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(14),
    fontWeight: "600",
    flex: 1,
  },
  fastingGoalTotalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
  },
  fastingGoalTotalValue: {
    fontWeight: "600",
    fontSize: ms(22),
    fontFamily: fonts.primary.semiBold,
    color: Colors.light.white,
  },
  fastingGoalTotalValueCompleted: {
    color: Colors.light.green,
  },
  fastingGoalTotalBadge: {
    padding: ms(4),
    borderRadius: ms(4),
    backgroundColor: Colors.light.dullestWhite,
  },
  fastingGoalTotalBadgeCompleted: {
    backgroundColor: Colors.light.lightgreen,
  },
  fastingGoalTotalBadgeText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: ms(9),
    fontWeight: "400",
  },
  fastingGoalTotalBadgeTextCompleted: {
    color: Colors.light.green,
  },
  fastingCycleDatesContainer: {},
  fastingCycleGregorianDate: {
    fontWeight: "500",
    fontSize: ms(14),
    fontFamily: fonts.primary.medium,
    color: Colors.light.white,
    textAlign: "center",
  },
  fastingCycleIslamicDate: {
    fontWeight: "400",
    fontSize: ms(12),
    fontFamily: fonts.primary.regular,
    color: Colors.light.grey,
    textAlign: "center",
    marginTop: ms(4),
  },
  fastingLegendCard: {
    width: "100%",
    backgroundColor: Colors.light.dullestWhite,
    borderRadius: ms(12),
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
    paddingBottom: ms(14),
    position: "relative",
  },
  fastingLegendCardClose: {
    position: "absolute",
    top: ms(6),
    right: ms(5),
    zIndex: 2,
  },
  fastingLegendLayout: {
    width: "100%",
    gap: ms(8),
    flex: 1,
  },
  fastingLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: ms(8),
  },
  fastingLegendRowCentered: {
    alignItems: "center",
    width: "100%",
  },
  fastingLegendColumn: {
    flex: 1,
    // minWidth: 0,
  },
  fastingLegendHalf: {
    flex: 1,
    // width: "50%",
  },
  fastingLegendItem: {
    // Figma: ring vertically centered on the 2-line text block
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  fastingLegendRingSlot: {
    width: ms(10),
    marginRight: ms(8),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fastingLegendTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  fastingLegendText: {
    fontWeight: "500",
    fontSize: ms(10),
    lineHeight: ms(13),
    letterSpacing: ms(0.2),
    textTransform: "uppercase",
    fontFamily: fonts.primary.medium,
    color: Colors.light.grey,
    textAlign: "left",
  },
  fastingProgressLegendRow: {
    // Figma: equal columns + clear center gutter
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: ms(16),
  },
  fastingLegendSkippedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(8),
    marginTop: ms(4),
  },
  fastingLegendSkippedText: {
    fontWeight: "500",
    fontSize: ms(10),
    lineHeight: ms(13),
    letterSpacing: ms(0.2),
    textTransform: "uppercase",
    fontFamily: fonts.primary.medium,
    color: Colors.light.grey,
  },
  fastingCategoryLegend: {
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: ms(10),
    paddingHorizontal: ms(12),
    paddingVertical: ms(12),
    gap: ms(8),
  },
  fastingCategoryLegendRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: ms(12),
  },
  fastingCategoryLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
  },
  fastingCategoryLegendLabel: {
    fontSize: ms(9),
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    letterSpacing: ms(0.1),
    color: Colors.light.grey,
  },
  fastingCalendarWrapper: {
    borderRadius: ms(12),
    overflow: "hidden",
  },
  dayProgressHeaderRow: {
    flexDirection: "row",
    gap: ms(10),
    alignItems: "center",
  },
  dayProgressTimeBadgeWrapper: {
    paddingVertical: ms(10),
    paddingHorizontal: ms(4),
    flexDirection: "row",
    alignItems: "center",
  },
  dayProgressTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    backgroundColor: Colors.light.green,
    borderRadius: ms(6),
    paddingVertical: ms(5),
    paddingHorizontal: ms(8),
  },
  dayProgressTimeBadgeText: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(15),
    letterSpacing: ms(0.4),
    color: Colors.light.white,
  },
  dayProgressGoalTitle: {
    flex: 1,
    ...getFigmaForcedSmallCapsTextStyle({
      fontSize: ms(15),
      letterSpacing: ms(0.4),
      color: Colors.light.white,
    }),
  },
  dayProgressGoalTitleFull: {
    paddingVertical: ms(10),
    paddingHorizontal: ms(4),
  },
  dayProgressDetailRow: {
    flexDirection: "row",
    gap: ms(10),
    alignItems: "center",
  },
  dayProgressDescription: {
    flex: 1,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(15),
    color: Colors.light.white,
    fontWeight: "600",
  },
  dayProgressDescriptionFull: {
    flex: 1,
  },
  dayProgressDurationRow: {
    flexDirection: "row",
    gap: ms(4),
    alignItems: "center",
  },
  dayProgressTimesColumn: {
    gap: ms(12),
  },
  dayProgressTimePlaceholder: {
    height: ms(13),
  },
  dayProgressMutedTime: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: ms(11),
    fontWeight: "500",
  },
  dayProgressTimeline: {
    alignItems: "center",
  },
  dayProgressTimelineDot: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: Colors.light.white,
  },
  dayProgressTimelineLine: {
    width: 1,
    height: ms(30),
    backgroundColor: Colors.light.green,
  },
  // Show More Button
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(8),
    marginBottom: HOME_SECTION_GAP,
  },
  showMoreText: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(14),
    lineHeight: ms(14),
    letterSpacing: 0,
    color: Colors.light.white,
    textTransform: "uppercase",
    fontVariant: ["small-caps"],
  },
  goldenFab: {
    position: "absolute",
    width: s(95),
    height: s(95),
    zIndex: 1000,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  goldenFabGlowWrap: {
    width: s(95),
    height: s(95),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  goldenFabGlowDisc: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: ms(1),
    backgroundColor: Colors.light.golden,
  },
  goldenFabInner: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    justifyContent: "center",
    alignItems: "center",
  },
  goldenFabPlus: {
    fontSize: ms(38),
    fontWeight: "300",
    color: Colors.light.white,
    lineHeight: ms(30),
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 998,
  },
  fabMenuContainer: {
    position: "absolute",
    left: ms(16),
    zIndex: 999,
    alignItems: "flex-end",
  },
  fabOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: ms(12),
    width: "100%",
  },
  fabOptionLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(14),
    textTransform: "uppercase",
    letterSpacing: ms(0.5),
    textAlign: "right",
  },
  fabOptionIconContainer: {
    width: s(44),
    height: s(44),
    borderRadius: ms(22),
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
    borderRadius: ms(10),
    padding: ms(10),
    marginBottom: HOME_SECTION_GAP,
  },
  timeSpentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSpentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(10),
    flex: 1,
  },
  timeSpentTitle: {
    color: Colors.light.white,
    fontSize: ms(16),
    lineHeight: ms(19),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  timeSpentPercentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ms(12),
  },
  timeSpentPercentBlock: {
    flexShrink: 1,
    minWidth: 0,
  },
  timeSpentPercentText: {
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(28),
    lineHeight: ms(28),
    fontWeight: "600",
    color: Colors.light.white,
    transform: [{ translateY: 7 }],
  },
  timeSpentPercentSymbol: {
    fontFamily: "SF Pro Text",
    fontSize: ms(16),
    lineHeight: ms(16),
    fontWeight: "600",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  timeSpentPeriodToggle: {
    minHeight: s(40),
    flexDirection: "row",
    alignItems: "center",
    padding: ms(3),
    backgroundColor: Colors.light.blackBackground,
    borderRadius: ms(8),
    flexShrink: 0,
  },
  timeSpentPeriodButton: {
    minWidth: s(44),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ms(6),
    paddingHorizontal: ms(50),
    paddingVertical: ms(8),
  },
  timeSpentPeriodButtonSelected: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  timeSpentPeriodButtonUnselected: {
    backgroundColor: "transparent",
  },
  timeSpentPeriodButtonText: {
    fontFamily: fonts.primary.medium,
    fontSize: ms(14),
    lineHeight: ms(18),
    fontWeight: "500",
    textAlign: "center",
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
    gap: ms(10),
    marginTop: ms(10),
  },
  timeSpentNavSection: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: ms(20),
  },
  timeSpentNavSectionExpanded: {
    flex: 1,
    width: "100%",
  },
  timeSpentNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
  },
  timeSpentNavLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: ms(14),
  },
  timeSpentTotalBlock: {
    alignSelf: "flex-end",
  },
  timeSpentTotalCaption: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: ms(11),
    lineHeight: ms(11),
    fontWeight: "400",
    marginTop: ms(2),
  },
  timeSpentTotalValue: {
    color: Colors.light.green,
    fontFamily: fonts.primary.bold,
    fontSize: ms(22),
    fontWeight: "600",
  },
  timeSpentChartSection: {
    marginTop: ms(6),
  },
  timeSpentChartLoading: {
    height: s(240),
    marginTop: ms(6),
    alignItems: "center",
    justifyContent: "center",
  },
  timeSpentChartHint: {
    flex: 1,
    maxWidth: "50%",
    minWidth: s(148),
    justifyContent: "flex-end",
    alignSelf: "stretch",
    position: "relative",
  },
  timeSpentChartHintBubble: {
    position: "absolute",
    top: ms(40),
    left: ms(30),
    width: "82%",
    zIndex: 2,
    alignItems: "center",
  },
  timeSpentChartHintBubbleInner: {
    width: "100%",
    borderRadius: ms(6),
    paddingVertical: ms(12),
    paddingHorizontal: ms(14),
    backgroundColor: "#2F4054",
    alignItems: "center",
    gap: ms(8),
  },
  timeSpentChartHintText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: ms(11),
    fontWeight: "500",
    lineHeight: ms(15),
    textAlign: "center",
  },
  timeSpentChartHintAction: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: ms(11),
    fontWeight: "500",
    textAlign: "center",
  },
  timeSpentChartHintPointerRow: {
    alignItems: "center",
    marginTop: ms(-1),
  },
  timeSpentChartHintPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#2F4054",
  },
  timeSpentChartContainer: {
    height: s(240),
    position: "relative",
    width: "100%",
  },
  timeSpentBarHitArea: {
    position: "absolute",
    top: ms(12),
    bottom: ms(8),
    zIndex: 4,
  },
  timeSpentZeroAxisLabel: {
    position: "absolute",
    left: ms(8),
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: ms(10),
    lineHeight: ms(12),
  },
  timeSpentXAxisContainerWeek: {
    height: ms(36),
    position: "relative",
    marginTop: ms(4),
    overflow: "hidden",
  },
  timeSpentXAxisContainerMonth: {
    height: ms(28),
    position: "relative",
    marginTop: ms(4),
    overflow: "hidden",
  },
  timeSpentXAxisLabelPosition: {
    position: "absolute",
    alignItems: "center",
  },
  timeSpentXAxisLabelDimmed: {
    opacity: 0.3,
  },
  timeSpentXAxisDayLabel: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: ms(10),
    lineHeight: ms(10),
    textAlign: "center",
  },
  timeSpentXAxisDateLabelWeek: {
     color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: ms(10),
    lineHeight: ms(10),
    fontWeight: "400",
    marginTop: ms(1),
    textAlign: "center",
  },
  timeSpentXAxisDateLabelMonth: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.medium,
    fontSize: ms(10),
    lineHeight: ms(10),
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
    alignItems: "center",
    justifyContent: "center",
    gap: ms(8),
    marginTop: ms(12),
    alignSelf: "center",
  },
  timeSpentDisclaimerIcon: {
    marginTop: ms(2),
  },
  timeSpentDisclaimerText: {
    flexShrink: 1,
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: ms(12),
    lineHeight: ms(16),
    textAlign: "center",
  },

  timeSpentCategoryList: {
    gap: ms(16),
  },
  timeSpentCategoryRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSpentCategoryLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: ms(14),
    fontWeight: "700",
  },
  timeSpentCategoryTimeBadge: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ms(1),
    paddingHorizontal: ms(10),
    borderRadius: ms(4),
    backgroundColor: Colors.light.white,
  },
  timeSpentCategoryTimeBadgeText: {
    color: Colors.light.green,
    fontWeight: "500",
    fontSize: ms(13),
    fontFamily: fonts.primary.medium,
  },
  timeSpentCategoryProgressTrack: {
    width: "100%",
    height: ms(10),
    borderRadius: ms(4),
    backgroundColor: Colors.light.progressBarEmpty,
    overflow: "hidden",
    flexDirection: "row",
  },
  timeSpentCategoryProgressFill: {
    height: "100%",
    borderRadius: ms(4),
    backgroundColor: Colors.light.green,
    minWidth: 0,
  },
  timeSpentDetailPercentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSpentDetailSummaryBox: {
    borderRadius: ms(10),
    paddingVertical: ms(12),
    paddingHorizontal: 0,
  },
  timeSpentDetailDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: ms(8),
  },
  timeSpentDetailSummaryText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: ms(14),
    fontWeight: "500",
    lineHeight: ms(20),
    textAlign: "left",
  },
  timeSpentDetailTabsScroll: {
    flexGrow: 0,
  },
  timeSpentDetailTabsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
  },
  timeSpentDetailTab: {
    minWidth: s(64),
  },
  timeSpentDetailDeltaBadge: {
    borderRadius: ms(4),
    paddingHorizontal: ms(8),
  },
  timeSpentDetailDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(8),
    marginTop: ms(16),
  },
  timeSpentDetailDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
  timeSpentDetailDotActive: {
    backgroundColor: Colors.light.green,
  },
  timeSpentDetailDotInactive: {
    backgroundColor: Colors.light.dullestWhite,
  },
});
