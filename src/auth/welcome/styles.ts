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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.overlayMask,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
  },

  heroContainer: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },

  heroText: {
    fontSize: hp(3.8),
    fontFamily: fonts.primary.heavy,
    color: Colors.light.background,
    textAlign: "left",
    lineHeight: hp(4.5),
    flex: 1,
  },

  buttonGroup: {
    marginTop: 270,
    gap: 16,
    alignItems: "center",
  },

  primaryButton: {
    width: "90%",
    fontWeight: "500",
    minHeight: 40,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
    borderWidth: 1.5,
    borderColor: Colors.light.green,
    marginBottom: 10,
    alignSelf: "center",
  },

  secondaryButton: {
    width: "90%",
    minHeight: 40,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.light.background,
    alignSelf: "center",
  },

  primaryButtonText: {
    color: Colors.light.background,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },

  secondaryButtonText: {
    color: Colors.light.background,
    fontFamily: fonts.primary.regular,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },

  buttonPressed: {
    opacity: 0.8,
  },
});