import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const cancelConfirmationStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  content: {
    flex: 1,
    //paddingHorizontal: 24,
    paddingTop: 80, // push content down
    alignItems: "center",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 16,
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 24,
    marginBottom: 60,
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.yellow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  description: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  subDescription: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  boldText: {
    fontFamily: fonts.primary.bold,
    color: Colors.light.white,
  },
  bottomContainer: {
    //paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
});
