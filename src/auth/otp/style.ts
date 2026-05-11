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

    spacer: {
      flex: 1,
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

    scrollContent: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 30,
    },

    formWrapper: {
      gap: 20,
    },

    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginVertical: 20,
    },

    otpBox: {
      width: 43,
      height: 43,
      borderRadius: 8,
      backgroundColor: Colors.light.buttonBackground,
      borderWidth: 2,
      borderColor: Colors.light.buttonBackground,
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
    },

    inputContainer: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.light.grey,
      paddingBottom: 10,
    },

    input: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontSize: 14,
      paddingVertical: 8,
    },

    buttonWrapper: {
      marginTop: 20,
    },
  });

export default createStyles;