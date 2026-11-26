import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const openSourceLicensesStyles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 10,
  },
  listItemText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginRight: 12,
  },
  detailScroll: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  detailHeaderBlock: {
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  licenseName: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  licenseVersion: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
  },
  licenseUrl: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  termsHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.2,
    marginBottom: 18,
  },
  bodyHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 15,
    marginBottom: 10,
    marginTop: 4,
  },
  bodyParagraph: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
});
