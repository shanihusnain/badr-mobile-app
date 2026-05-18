import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  descriptionText: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
  },
  languageRow: {
    flexDirection: "row",
    gap: 12,
  },
  langBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.icon,
  },
  langBtnActive: {
    borderColor: Colors.light.green,
    backgroundColor: Colors.light.green + "22",
  },
  langText: {
    color: Colors.light.icon,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
  },
  langTextActive: {
    color: Colors.light.green,
    fontWeight: "700",
  },
  howItWorksText: {
    marginLeft: 10,
    fontWeight: "500",
    fontSize: 14,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
  },
  setPersonalizedGoalText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    flexWrap: "wrap",
  },
});
