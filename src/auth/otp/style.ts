import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

import { fonts } from "../../../assets/fonts";
import { Colors } from "../../../constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.buttonBackground,
  },

  contentView: {
    flex: 1,
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
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },

  placeholder: {
    width: 40,
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: hp(45),
    backgroundColor: Colors.light.blackBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

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
    gap: 12,
    marginTop: hp(2),
    marginBottom: hp(1),
  },

  otpBox: {
    width: 45,
    height: 45,
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
   // marginTop: hp(0),
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
    width: "105%",
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