import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { ms, s } from "@/src/utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },

  safeArea: {
    flex: 1,
  },

  contentView: {
    flex: 1,
    flexDirection: "column",
  },

  imageSection: {
    flex: 1,
    minHeight: s(284),
  },

  bottomSheet: {
    height: s(374),
    marginTop: ms(-20),
    backgroundColor: Colors.light.blackBackground,
    borderTopLeftRadius: ms(37),
    borderTopRightRadius: ms(37),
    overflow: "hidden",
  },

  bottomSheetScroll: {
    flex: 1,
  },

  bottomSheetContent: {
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(32),
  },

  messageContainer: {
    marginTop: ms(12),
    paddingHorizontal: ms(10),
  },

  messageText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: ms(14),
    lineHeight: ms(20),
    textAlign: "left",
    letterSpacing: ms(0.1),
  },

  formWrapper: {
    alignItems: "center",
    width: "100%",
    marginTop: ms(12),
  },

  emailInput: {
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: ms(14),
    letterSpacing: ms(0.1),
  },

  emailContainer: {
    marginTop: ms(12),
  },

  buttonWrapper: {
    marginTop: ms(32),
    width: "94%",
    marginBottom: ms(32),
    alignSelf: "center",
  },

  primaryButton: {
    width: "96%",
    borderRadius: ms(6),
    paddingTop: ms(10),
    paddingBottom: ms(10),
    paddingHorizontal: ms(7),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
    borderWidth: ms(1.5),
    marginBottom: ms(10),
    alignSelf: "center",
  },
});
