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
      paddingHorizontal: 10,
      paddingTop: hp(3),
      paddingBottom: hp(4),
    },

    formWrapper: {
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 0,
    },

    buttonWrapper: {
      marginTop: hp(4),
      width: "100%",
      marginBottom: hp(4),
      alignItems: "center",
    },
  });

export default createStyles;
