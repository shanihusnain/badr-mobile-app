import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const giftCurrentMemberStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground, // Adjust if a specific dark navy color is needed
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 40,
  },
  headerTitleContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  moonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  moonPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F4EBD0",
    shadowColor: "#F4EBD0",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  optionCard: {
    flex: 1,
    backgroundColor: Colors.light.greybuttonversion,
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionCardSelected: {
    borderColor: Colors.light.green,
  },
  optionDuration: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  optionPrice: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: "auto",
    paddingBottom: 40,
  },
  nextButtonInactive: {
    backgroundColor: "#1A4D3E", // Darker green for inactive state
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  step2Container: {
    flex: 1,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  circleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.greybuttonversion,
    alignItems: "center",
    justifyContent: "center",
  },
  step2Title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },
  step2Subtitle: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingRight: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.icon,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: Colors.light.green,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  radioText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  inputLabel: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
  },
  multilineInputContainer: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  multilineInputInner: {
    minHeight: 120,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    textAlignVertical: "top",
    paddingTop: 10,
    paddingBottom: 20,
  },
  nextButtonInactiveGray: {
    backgroundColor: "#8D9BA9", // Gray color shown in the screenshot for inactive
  },
  savedPaymentButton: {
    marginTop: 12,
  },
});
