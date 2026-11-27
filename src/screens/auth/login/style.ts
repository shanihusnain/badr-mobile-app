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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(16),
  },

  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(14),
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    lineHeight: ms(18),
  },

  placeholder: {
    width: s(40),
  },

  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },

  imageSection: {
    flex: 1,
    minHeight: s(284),
  },

  imageTapArea: {
    flex: 1,
  },

  bottomSheet: {
    height: s(374),
    marginTop: ms(-20),
    backgroundColor: Colors.light.blackBackground,
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    overflow: "hidden",
  },

  bottomSheetScroll: {
    flex: 1,
  },

  bottomSheetContent: {
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
    paddingBottom: ms(32),
  },

  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: ms(12),
  },

  forgotPasswordText: {
    color: Colors.light.white,
    fontSize: ms(12),
    fontFamily: fonts.primary.regular,
    lineHeight: ms(14),
    marginRight: ms(8),
  },

  primaryButton: {
    width: "90%",
    minHeight: s(40),
    borderRadius: ms(6),
    paddingTop: ms(10),
    paddingBottom: ms(10),
    paddingHorizontal: ms(8),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
    borderWidth: ms(1.5),
    borderColor: Colors.light.green,
    marginBottom: ms(10),
    alignSelf: "center",
  },

  orloginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: ms(41),
    //marginBottom: ms(57),
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.white,
    opacity: 0.3,
  },

  orloginText: {
    color: Colors.light.white,
    fontSize: ms(12),
    fontFamily: fonts.primary.regular,
    marginHorizontal: ms(10),
  },
  socialLoginButtonsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: ms(12),
    alignSelf: "center",
  },
});
