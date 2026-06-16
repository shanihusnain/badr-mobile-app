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
