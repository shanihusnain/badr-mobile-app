import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.light.overlayMask,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
  },

  heroText: {
    fontSize: 30,
    fontFamily: fonts.primary.heavy,
    color: Colors.light.white,
    textAlign: "left",
    flex: 1,
    fontWeight: "800",
    letterSpacing: 1,
    lineHeight: 40,
  },
});
