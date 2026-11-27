import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { ms, s } from "@/src/utils/responsive";

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
      minHeight: s(284),
    },

    bottomSheet: {
      height: s(406),
      marginTop: ms(-20),
      backgroundColor: Colors.light.blackBackground,
      borderTopLeftRadius: ms(20),
      borderTopRightRadius: ms(20),
      overflow: "hidden",
    },

    bottomSheetScroll: {
      flex: 1,
    },

    bottomSheetContent: {
      paddingHorizontal: ms(10),
      paddingTop: ms(24),
      paddingBottom: ms(32),
    },

    formWrapper: {
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 0,
    },

    buttonWrapper: {
      marginTop: ms(65),
      width: "100%",
      marginBottom: ms(32),
      alignItems: "center",
    },
  });

export default createStyles;
