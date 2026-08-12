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

  imageSection: {
    flex: 1,
    minHeight: hp(35),
  },

  bottomSheet: {
    height: hp(45),
    marginTop: -20,
    backgroundColor: Colors.light.blackBackground,
    borderTopLeftRadius: 37,
    borderTopRightRadius: 37,
    overflow: "hidden",
  },

  bottomSheetScroll: {
    flex: 1,
  },

  bottomSheetContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: hp(4),
    paddingBottom: hp(4),
  },

  otpInfoText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
    opacity: 0.9,
    letterSpacing: 0.1,
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
    marginBottom: hp(1.5),
  },

  otpContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(2),
    marginBottom: hp(1),
  },

  otpBox: {
    width: "15%",
    height: 50,
    borderRadius: 7,
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
    marginTop: hp(1.3),
    marginBottom: hp(1.4),
  },

  resendText: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
    marginLeft: 5,
  },

  resendTimer: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 22,
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
    width: "94%",
    marginTop: hp(3.5),
  },

  errorText: {
    color: Colors.light.red,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: hp(0.5),
    alignSelf: "flex-start",
  },
});
