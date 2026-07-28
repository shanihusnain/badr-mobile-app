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
    paddingHorizontal: 20,
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },

  messageContainer: {
    marginTop: hp(2),
    paddingHorizontal: 10,
  },

  messageText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "left",
  },

  formWrapper: {
    alignItems: "center",
    width: "100%",
    marginTop: hp(3),
  },

  buttonWrapper: {
    marginTop: hp(4),
    width: "100%",
    marginBottom: hp(4),
  },

  primaryButton: {
    width: "95%",
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
    borderWidth: 1.5,
    marginBottom: 10,
    alignSelf: "center",
  },
});
