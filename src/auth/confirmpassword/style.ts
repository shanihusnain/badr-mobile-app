import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Colors } from "../../../constants/theme";

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.buttonBackground,
    },

    keyboardAvoidingView: {
      flex: 1,
      justifyContent: "flex-end",
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
      paddingHorizontal: 20,
      paddingTop: hp(3),
      paddingBottom: hp(3),
    },

    contentView: {
      flex: 1,
    },

    formWrapper: {
      alignItems: "center",
      width: "100%",
    },

    buttonWrapper: {
      marginTop: hp(4),
      width: "100%",
      marginBottom: hp(18),
    },
  });

export default createStyles;