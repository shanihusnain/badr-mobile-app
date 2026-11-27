import { StyleSheet } from "react-native";

import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { ms, s } from "@/src/utils/responsive";

export default function createStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.blackBackground,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: ms(16),
      paddingBottom: ms(20),
    },
    avatarContainer: {
      width: s(90),
      height: s(90),
      borderRadius: ms(50),
      backgroundColor: Colors.light.calendarBg,
      justifyContent: "center",
      alignItems: "center",
      marginTop: ms(1),
      marginBottom: ms(8),
      position: "relative",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: ms(50),
    },
    cameraIconContainer: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: Colors.light.green,
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: ms(2),
      borderColor: Colors.light.blackBackground,
    },

    scrollContainer: {
      flexGrow: 1,
      // paddingTop: ms(16),
      alignItems: "center",
      paddingBottom: ms(24),
      width: "100%",
    },

    formWrapper: {
      alignItems: "center",
      width: "100%",
    },

    userNameLabel: {
      color: Colors.light.grey,
      fontFamily: fonts.primary.regular,
      fontSize: ms(14),
      marginTop: ms(16),
      alignSelf: "flex-start",
      marginRight: ms(14),
      fontWeight: "100",
    },

    nameContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: ms(8),
      paddingHorizontal: ms(12),
      paddingVertical: ms(3),
      width: s(333),
      marginTop: ms(8),
      height: s(48),
    },

    nameText: {
      color: Colors.light.green,
      fontFamily: fonts.primary.regular,
      fontSize: ms(14),
    },

    passwordLabel: {
      color: Colors.light.grey,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      //marginLeft: ms(16),
      marginRight: ms(14),
    },

    passwordContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: ms(16),
      paddingHorizontal: ms(12),
      paddingVertical: ms(3),
      width: s(333),
      marginTop: ms(8),
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
      fontSize: ms(12),
    },

    eyeIcon: {
      fontSize: ms(16),
      color: Colors.light.white,
    },

    confirmpasswordLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      //marginLeft: ms(16),
      marginRight: ms(14),
    },

    confirmpasswordContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: ms(16),
      paddingHorizontal: ms(12),
      paddingVertical: ms(3),
      width: s(333),
      marginTop: ms(8),
    },

    confirmpasswordText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
    },

    emailaddressLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      //marginLeft: ms(16),
      marginRight: ms(14),
    },

    emailaddressContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: ms(16),
      paddingHorizontal: ms(12),
      paddingVertical: ms(3),
      width: s(333),
      marginTop: ms(8),
    },

    emailaddressText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
    },

    genderLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      //marginLeft: ms(16),
      marginRight: ms(14),
    },

    genderContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: ms(16),
      paddingHorizontal: ms(12),
      paddingVertical: ms(15),
      width: s(333),
      marginTop: ms(8),
    },

    genderText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
    },

    dropdown: {
      width: s(333),
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: ms(16),
      marginTop: ms(6),
      paddingVertical: ms(5),
    },

    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: ms(10),
      paddingHorizontal: ms(12),
    },

    dropdownText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginLeft: ms(10),
    },

    radioOuter: {
      width: ms(18),
      height: ms(18),
      borderRadius: ms(10),
      borderWidth: 1,
      borderColor: Colors.light.border,
      justifyContent: "center",
      alignItems: "center",
    },

    radioInner: {
      width: ms(10),
      height: ms(10),
      borderRadius: ms(5),
      backgroundColor: "#4CAF50",
    },

    doblabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      //marginLeft: ms(16),
      marginRight: ms(14),
    },

    dobContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
      borderRadius: ms(16),
      paddingHorizontal: ms(12),
      paddingVertical: ms(15),
      width: s(333),
      marginTop: ms(8),
    },

    dobText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
    },

    countrylabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      marginRight: ms(14),
    },
    countryContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
    },

    countryText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
    },

    dateviewLabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      marginRight: ms(14),
    },
    dateviewContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
    },

    dateviewText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      fontWeight: "500",
    },

    validationText: {
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(11),
      marginVertical: ms(4),
      fontWeight: "500",
    },

    weeklabel: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
      marginTop: ms(16),
      alignSelf: "flex-start",
      marginRight: ms(14),
    },
    weekContainer: {
      backgroundColor: Colors.light.greybuttonBackground,
    },

    weekText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontSize: ms(12),
    },
    btnWrapper: {
      width: "92%",
      alignSelf: "center",
      marginTop: ms(24),
      zIndex: 1000,
      borderRadius: ms(28),
    },
  });
}

