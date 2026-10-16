import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { fs } from "@/src/utils/responsive";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  descriptionText: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: fs(14),
    fontFamily: fonts.primary.regular,
    lineHeight: fs(20),
    letterSpacing: 0.1,
    textAlign: "justify",
    opacity: 0.9,
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
    fontSize: fs(14),
    fontFamily: fonts.primary.medium,
  },
  langTextActive: {
    color: Colors.light.green,
    fontWeight: "700",
  },
  howItWorksText: {
    marginLeft: 10,
    marginTop: -4,
    fontWeight: "500",
    fontSize: fs(14),
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    letterSpacing: 0.4,
  },
  setPersonalizedGoalText: {
    color: Colors.light.white,
    fontSize: fs(18),
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    flexWrap: "wrap",
    lineHeight: fs(22),
  },
  introVideoScreen: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 16,
  },
});
