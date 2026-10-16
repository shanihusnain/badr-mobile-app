import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { fs } from "@/src/utils/responsive";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },

  container: {
    flex: 1,
    // backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 26,
  },

  image: {
    width: 349,
    height: 349,
    marginBottom: 12,
  },

  introText: {
    height: 60,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: fs(20),
    lineHeight: fs(30),
    letterSpacing: 0,
    textAlign: "center",
    opacity: 1,
    marginTop: 24,
  },

  subtitleText: {
    width: 343,
    height: 60,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: fs(14),
    lineHeight: fs(20),
    letterSpacing: 0,
    textAlign: "center",
    opacity: 1,
    marginTop: 8,
  },
});
