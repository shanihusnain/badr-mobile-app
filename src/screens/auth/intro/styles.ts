import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { ms, s } from "@/src/utils/responsive";

export const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },

  container: {
    flex: 1,
    // backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: ms(16),
    paddingBottom: ms(26),
  },

  image: {
    width: s(349),
    height: s(349),
    marginBottom: ms(12),
  },

  introText: {
    minHeight: ms(60),
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(30),
    letterSpacing: 0,
    textAlign: "center",
    opacity: 1,
    marginTop: ms(24),
  },

  subtitleText: {
    width: s(343),
    minHeight: ms(60),
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: 0,
    textAlign: "center",
    opacity: 1,
    marginTop: ms(8),
  },
});
