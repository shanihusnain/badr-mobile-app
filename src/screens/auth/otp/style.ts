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
  },

  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },

  imageSection: {
    flex: 1,
  },

  imageTapArea: {
    flex: 1,
  },

  bottomSheet: {
    height: hp(50),
    backgroundColor: Colors.light.blackBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: hp(4),
  },

  otpInfoText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.regular,
    lineHeight: 18,
    opacity: 0.8,
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
    marginBottom: hp(1.5),
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 7.5,
    marginTop: hp(2),
    marginBottom: hp(1),
  },

  otpBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.light.greybuttonBackground,
    textAlign: "center",
    fontSize: 18,
    color: Colors.light.white,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  resendContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(1),
    marginBottom: hp(2),
  },

  resendText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 18,
    marginLeft: 5,
  },

  resendTimer: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.regular,
    lineHeight: 16,
    alignSelf: "center",
  },

  resendAction: {
    color: Colors.light.green,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
  },

  resendActionUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.green,
  },

  buttonWrapper: {
    width: "95%",
    marginTop: hp(2),
  },

  errorText: {
    color: Colors.light.red,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: hp(0.5),
    alignSelf: "flex-start",
  },
});
