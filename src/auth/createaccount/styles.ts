import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { fonts } from "../../../assets/fonts";
import { Colors } from "../../../constants/theme";

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.blackBackground,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: hp(4),
    },

    scrollContainer: {
      flexGrow: 1,
      // paddingTop: hp(2),
      alignItems: "center",
      paddingBottom: 24,
    },

    formWrapper: {
      alignItems: "center",
      width: "100%",
    },

    userNameLabel: {
      color: Colors.light.grey,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      //marginLeft: ,
      marginRight: 14,
    },

    nameContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 28,
      paddingHorizontal: 12,
      paddingVertical: 3,
      width: 333,
      marginTop: hp(1),
    },

    nameText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },

    passwordLabel: {
      color: Colors.light.grey,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      //marginLeft: 16,
      marginRight: 14,
    },

    passwordContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 3,
      width: 333,
      marginTop: hp(1),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    passwordInputWrapper: {
      flex: 1,
    },

    passwordText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },

    eyeIcon: {
      fontSize: 16,
      color: Colors.light.white,
    },

    confirmpasswordLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      //marginLeft: 16,
      marginRight: 14,
    },

    confirmpasswordContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 3,
      width: 333,
      marginTop: hp(1),
    },

    confirmpasswordText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },

    emailaddressLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      //marginLeft: 16,
      marginRight: 14,
    },

    emailaddressContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 3,
      width: 333,
      marginTop: hp(1),
    },

    emailaddressText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },

    genderLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      //marginLeft: 16,
      marginRight: 14,
    },

    genderContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 15,
      width: 333,
      marginTop: hp(1),
    },

    genderText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },

    dropdown: {
      width: 333,
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      marginTop: 6,
      paddingVertical: 5,
    },

    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    dropdownText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginLeft: 10,
    },

    radioOuter: {
      width: 18,
      height: 18,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.light.border,
      justifyContent: "center",
      alignItems: "center",
    },

    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#4CAF50",
    },

    doblabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      //marginLeft: 16,
      marginRight: 14,
    },

    dobContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 15,
      width: 333,
      marginTop: hp(1),
    },

    dobText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },

    countrylabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      marginRight: 14,
    },
    countryContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
    },

    countryText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },

    dateviewLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      marginRight: 14,
    },
    dateviewContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
    },

    dateviewText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      fontWeight: "500",
    },

    validationText: {
      fontFamily: fonts.primary.semiBold,
      fontSize: 11,
      marginVertical: 4,
      fontWeight: "500",
    },

    weeklabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
      marginTop: hp(2),
      alignSelf: "flex-start",
      marginRight: 14,
    },
    weekContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
    },

    weekText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: 12,
    },
    btnWrapper: { width: 333, marginTop: hp(3) },
  });

export default createStyles;
