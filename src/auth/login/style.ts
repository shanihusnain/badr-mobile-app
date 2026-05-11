import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

import { fonts } from "../../../assets/fonts";
import { Colors } from "../../../constants/theme";

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.buttonBackground,
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

    bottomSheet: {
      height: hp(45),
      backgroundColor: Colors.light.blackBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },

    bottomSheetContent: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: hp(2),
      paddingBottom: hp(3),
    },

    formWrapper: {
      alignItems: "center",
      width: "100%",
    },

    emailContainer: {
      backgroundColor: Colors.light.buttonBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      width: "100%",
      minHeight: hp(6),
      marginTop: hp(2),
      flexDirection: "row",
      alignItems: "center",
    },

    passwordContainer: {
      backgroundColor: Colors.light.buttonBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      width: "100%",
      minHeight: hp(6),
      marginTop: hp(2),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    input: {
      flex: 1,
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      paddingVertical: 4,
    },

    passwordInput: {
      flex: 1,
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      paddingVertical: 4,
    },

    eyeIcon: {
      fontSize: 16,
      color: Colors.light.white,
      marginLeft: 10,
    },

    errorText: {
      color: Colors.light.red,
      fontFamily: fonts.primary.semiBold,
      fontSize: 11,
      marginTop: hp(1),
      alignSelf: "flex-start",
    },

    validationContainer: {
      marginTop: hp(1),
      flexDirection: "row",
      flexWrap: "wrap",
    },

    validationText: {
      fontFamily: fonts.primary.semiBold,
      fontSize: 10,
      color: Colors.light.red,
    },

    forgotPasswordContainer: {
      width: "100%",
      alignItems: "flex-end",
      marginTop: hp(1.5),
    },

    forgotPasswordText: {
      color: Colors.light.white,
      fontSize: 12,
      fontFamily: fonts.primary.regular,
      lineHeight: 14,
    },

    buttonWrapper: {
      marginTop: hp(4),
      width: "100%",
      marginBottom: hp(1),
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
      marginTop: hp(2),
      marginBottom: hp(3),
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
  });

export default createStyles;
