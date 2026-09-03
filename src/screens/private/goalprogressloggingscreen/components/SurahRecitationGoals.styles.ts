import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { FLOW_CARD_HEIGHT } from "./DailyProgressLogging.styles";

export const CARD_WIDTH_RATIO = 0.8;
/** Matches `cardAnchor` width used by Tahiyat Ul Wudhu / prayer flow cards. */
export const FLOW_CARD_WIDTH_RATIO = 0.63;
export const CARD_ANCHOR_PADDING_LEFT = 16;
export const CARD_GAP = 12;

export const surahGoalStyles = StyleSheet.create({
  listContent: {
    paddingLeft: CARD_ANCHOR_PADDING_LEFT,
    paddingRight: 16,
  },
  cardAnchor: {
    width: "100%",
    height: FLOW_CARD_HEIGHT,
    position: "relative",
    zIndex: 101,
    elevation: 12,
    overflow: "visible",
  },
  // Matches TahiyatUlWudhuLoggingFlow `summaryCard`
  card: {
    backgroundColor: Colors.light.green,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    height: FLOW_CARD_HEIGHT,
    width: "100%",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  cardActive: {
    backgroundColor: Colors.light.green,
  },
  cardInactive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  cardContent: {
    paddingRight: 8,
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.selectcategory,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  textColumn: {
    flex: 1,
    gap: 9,
  },
  statusChip: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.lightpurple,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 3,
  },
  statusChipText: {
    color: Colors.light.darkblue,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 12.5,
  },
  textLines: {
    gap: 2,
  },
  // Matches Tahiyat `summaryTitle`
  surahName: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  metaText: {
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRegular: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.95,
  },
  metaBold: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 18,
  },
  // Matches Tahiyat `addButton`
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const weeklySurahProgressStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  cardActive: {},
  cardInactive: {},
  daysRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 3,
    textAlign: "center",
  },
});
