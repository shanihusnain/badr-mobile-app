import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

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
    paddingHorizontal: 20,
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },

  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    lineHeight: 18,
  },

  placeholder: {
    width: 40,
  },

  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },

  imageSection: {
    flex: 1,
    minHeight: hp(35),
  },

  imageTapArea: {
    flex: 1,
  },

  bottomSheet: {
    height: hp(50),
    marginTop: -20,
    backgroundColor: Colors.light.blackBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  bottomSheetScroll: {
    flex: 1,
  },

  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },

  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: hp(1.5),
  },

  forgotPasswordText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 14,
    marginRight: 8,
  },

  primaryButton: {
    width: "90%",
    minHeight: 40,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
    borderWidth: 1.5,
    borderColor: Colors.light.green,
    marginBottom: 10,
    alignSelf: "center",
  },

  orloginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: hp(5),
    //marginBottom: hp(7),
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.white,
    opacity: 0.3,
  },

  orloginText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    marginHorizontal: 10,
  },
  socialLoginButtonsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    alignSelf: "center",
  },
});
