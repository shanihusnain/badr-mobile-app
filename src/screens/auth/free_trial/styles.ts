import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  titleText: {
    fontSize: hp(2.2),
    fontWeight: "500",
    color: Colors.light.white,
    textAlign: "left",
    fontFamily: fonts.primary.semiBold,
  },

  secondarytext: {
    color: Colors.dark.text,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: hp(1.8),
    letterSpacing: 0.1,
    textAlign: "left",
    opacity: 1,
    marginLeft: 10,
  },

  secondaryTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  subtitletext: {
    width: 343,
    height: 60,
    color: Colors.dark.text,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: hp(1.71),
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: "left",
    opacity: 1,
    marginTop: 22,
  },

  pointText: {
    width: 307,
    height: 40,
    color: Colors.dark.text,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: hp(1.71),
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: "left",
    opacity: 1,
    marginTop: 22,
  },

  greenLine: {
    height: 2,
    width: 40,
    backgroundColor: Colors.light.green,
  },
});
