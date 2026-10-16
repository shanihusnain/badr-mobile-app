import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { fs } from "@/src/utils/responsive";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    //backgroundColor: Colors.light.overlayMask,
  },

  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    zIndex: 1,
  },

  moonImage: {
    width: 80,
    height: 80,
    marginBottom: 28,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
  },

  heroText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.heavy,
    fontSize: fs(32),
    fontWeight: "bold",
    letterSpacing: Platform.OS === "ios" ? 1 : 1.5,
    textAlign: "left",
    flex: 1,
    lineHeight: fs(45),
    zIndex: 1,
  },
});
