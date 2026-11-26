import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const aboutDocumentStyles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  introText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionItem: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionQuestion: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  sectionBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
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
    marginBottom: 12,
  },
  effectiveFrom: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
