import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const redeemGiftStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 48,
    marginBottom: 40,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.greybuttonversion,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 32,
    resizeMode: "contain",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  inputLabel: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: "#8c94a1", // As shown in mockup (greyish blue)
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonActive: {
    backgroundColor: Colors.light.green,
  },
  applyButtonText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
