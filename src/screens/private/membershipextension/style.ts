import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const membershipExtensionStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  container: {
    flex: 1,
    //paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 36,
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: -1,
  },
  headerTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    overflow: "hidden",
  },
  planCardSelected: {
    borderColor: Colors.light.green,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  radioCircleSelected: {
    borderColor: Colors.light.green,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  planInfo: {
    flex: 1,
  },
  planDuration: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    marginBottom: 2,
  },
  planSave: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
  },
  planPriceBlock: {
    alignItems: "flex-end",
  },
  planPrice: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  planPerMonth: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Colors.light.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularBadgeText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  bottomSection: {
    marginTop: "auto",
    paddingBottom: 24,
  },
  disclaimer: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
});
