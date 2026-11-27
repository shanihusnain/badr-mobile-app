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
    // ~35% of 812pt design height
    minHeight: s(284),
  },

  bottomSheet: {
    // ~45% of 812pt design height
    height: s(365),
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
    alignItems: "center",
    paddingHorizontal: ms(20),
    paddingTop: ms(32),
    paddingBottom: ms(32),
  },

  otpInfoText: {
    color: Colors.light.white,
    fontSize: ms(14),
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    lineHeight: ms(20),
    opacity: 0.9,
    letterSpacing: ms(0.1),
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
    marginBottom: ms(12),
  },

  otpContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: ms(16),
    marginBottom: ms(8),
  },

  otpBox: {
    width: "15%",
    height: s(50),
    borderRadius: ms(7),
    backgroundColor: Colors.light.greybuttonBackground,
    textAlign: "center",
    fontSize: ms(18),
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
    marginTop: ms(11),
    marginBottom: ms(11),
  },

  resendText: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: ms(14),
    fontFamily: fonts.primary.regular,
    lineHeight: ms(20),
    marginLeft: ms(5),
  },

  resendTimer: {
    color: Colors.light.white,
    fontSize: ms(16),
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: ms(22),
    alignSelf: "center",
  },

  resendAction: {
    color: Colors.light.green,
    fontSize: ms(14),
    fontFamily: fonts.primary.semiBold,
  },

  resendActionUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.green,
  },

  buttonWrapper: {
    width: "94%",
    marginTop: ms(28),
  },

  errorText: {
    color: Colors.light.red,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(12),
    marginTop: ms(4),
    alignSelf: "flex-start",
  },
});
