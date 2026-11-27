import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { ms } from "@/src/utils/responsive";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  descriptionText: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: ms(14),
    fontFamily: fonts.primary.regular,
    lineHeight: ms(20),
    letterSpacing: 0.1,
    textAlign: "justify",
    opacity: 0.9,
  },
  languageRow: {
    flexDirection: "row",
    gap: ms(12),
  },
  langBtn: {
    paddingHorizontal: ms(20),
    paddingVertical: ms(10),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: Colors.light.icon,
  },
  langBtnActive: {
    borderColor: Colors.light.green,
    backgroundColor: Colors.light.green + "22",
  },
  langText: {
    color: Colors.light.icon,
    fontSize: ms(14),
    fontFamily: fonts.primary.medium,
  },
  langTextActive: {
    color: Colors.light.green,
    fontWeight: "700",
  },
  howItWorksText: {
    marginLeft: ms(10),
    marginTop: ms(-4),
    fontWeight: "500",
    fontSize: ms(14),
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    letterSpacing: 0.4,
  },
  setPersonalizedGoalText: {
    color: Colors.light.white,
    fontSize: ms(18),
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    flexWrap: "wrap",
    lineHeight: ms(22),
  },
  introVideoScreen: {
    flex: 1,
    paddingTop: ms(24),
    paddingBottom: ms(16),
  },
  howItWorksRow: {
    marginTop: ms(22),
  },
  watchTutorialWrap: {
    alignSelf: "center",
    marginTop: ms(36),
  },
});
