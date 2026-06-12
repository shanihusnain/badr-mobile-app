import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    // justifyContent: 'flex-end',
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  image: {
    width: 343,
    height: 343,
    flex: 1,
  },

  introText: {
    width: 343,
    height: 60,
    color: Colors.dark.text,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: "center",
    opacity: 1,
    marginTop: 130,
  },

  subtitleText: {
    width: 343,
    height: 60,
    color: Colors.dark.text,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: "center",
    opacity: 1,
    marginTop: 16,
  },
});
