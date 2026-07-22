import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Colors } from "@/constants/theme";

const createStyles = () =>
  StyleSheet.create({
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
    },

    bottomSheetContent: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingTop: hp(3),
      paddingBottom: hp(3),
    },

    formWrapper: {
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 0,
    },

    buttonWrapper: {
      marginTop: hp(4),
      width: "100%",
      marginBottom: hp(18),
      alignItems: "center",
    },
  });

export default createStyles;
