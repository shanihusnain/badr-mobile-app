import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Platform, StyleSheet } from "react-native";

import { ms, s } from "@/src/utils/responsive";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: ms(20),
    paddingTop: ms(20),
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    //backgroundColor: Colors.light.overlayMask,
  },

  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: ms(24),
    zIndex: 1,
  },

  moonImage: {
    width: s(80),
    height: s(80),
    marginBottom: ms(28),
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: ms(20),
    paddingBottom: ms(40),
  },

  heroText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.heavy,
    fontSize: ms(32),
    fontWeight: "bold",
    letterSpacing: Platform.OS === "ios" ? ms(1) : ms(1.5),
    textAlign: "left",
    flex: 1,
    lineHeight: ms(45),
    zIndex: 1,
  },
});
