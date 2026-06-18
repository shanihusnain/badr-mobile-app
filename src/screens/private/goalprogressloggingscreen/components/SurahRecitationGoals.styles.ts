import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const CARD_WIDTH_RATIO = 0.8;
export const CARD_GAP = 12;

export const surahGoalStyles = StyleSheet.create({
  listContent: {
    paddingRight: 16,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    minHeight: 155,
    position: "relative",
  },
  cardActive: {
    backgroundColor: Colors.light.green,
  },
  cardInactive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  cardContent: {
    paddingRight: 48,
  },
  statusChip: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.lightpurple,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 5,
    marginBottom: 10,
  },
  statusChipText: {
    color: Colors.light.darkblue,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 14,
  },
  surahName: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  frequencyText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.95,
    marginBottom: 2,
  },
  totalText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.95,
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
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 4,
    textAlign: "center",
  },
});
