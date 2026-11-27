import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

import { ms, s } from "@/src/utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: ms(16),
    paddingTop: ms(20),
  },

  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: ms(16),
    paddingTop: ms(20),
  },

  buttonContainer: {
    paddingHorizontal: ms(16),
    paddingBottom: ms(36),
  },

  titleText: {
    fontSize: ms(18),
    fontWeight: "500",
    color: Colors.light.white,
    textAlign: "left",
    fontFamily: fonts.primary.semiBold,
  },

  secondarytext: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: ms(15),
    letterSpacing: ms(0.1),
    textAlign: "left",
    opacity: 1,
    marginLeft: ms(10),
  },

  secondaryTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: ms(14),
  },

  subtitletext: {
    width: "100%",
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: ms(0.1),
    textAlign: "left",
    opacity: 1,
    marginTop: ms(18),
    marginBottom: ms(15),
  },

  pointText: {
    width: s(307),
    height: s(40),
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: ms(0.1),
    textAlign: "left",
    opacity: 1,
    marginTop: ms(22),
  },

  greenLine: {
    height: ms(2),
    width: s(40),
    backgroundColor: Colors.light.green,
  },
});
