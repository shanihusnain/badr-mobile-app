import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { ms, s } from "@/src/utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  scrollContent: {
    paddingBottom: ms(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(24),
  },
  title: {
    color: Colors.light.white,
    fontSize: ms(14),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    lineHeight: ms(18),
  },
  placeholder: {
    width: s(40), // Same width as back button for balance
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    paddingHorizontal: ms(20),
    gap: ms(10),
  },
  cardNumberWrapper: {
    paddingHorizontal: ms(20),
    paddingVertical: ms(10),
    marginTop: ms(8),
  },
  cardNumberLabel: {
    color: Colors.light.grey,
    fontSize: ms(12),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: ms(4),
  },
  cardNumberContainer: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: ms(8),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  cardNumberInput: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(14),
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: ms(16),
    marginTop: ms(8),
  },
  cardDetailWrapper: {
    flex: 1,
    marginHorizontal: ms(5),
  },
  cardDetailLabel: {
    color: Colors.light.grey,
    fontSize: ms(12),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: ms(4),
  },
  cardDetailContainer: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: ms(8),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  cardDetailInput: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(14),
  },
  userNameWrapper: {
    paddingHorizontal: ms(20),
    marginTop: ms(8),
  },
  userNameLabel: {
    color: Colors.light.grey,
    fontSize: ms(12),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: ms(4),
  },
  userNameContainer: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: ms(8),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  userNameInput: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(14),
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ms(20),
    marginTop: ms(12),
  },
  checkbox: {
    width: ms(20),
    height: ms(20),
    marginRight: ms(10),
    borderRadius: ms(4),
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 0,
  },
  checkboxLabel: {
    color: Colors.light.grey,
    fontSize: ms(12),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "400",
  },
  actionButtonsWrapper: {
    paddingHorizontal: ms(20),
    marginTop: ms(154),
    marginBottom: ms(16),
  },
  primaryActionButton: {
    width: "100%",
    alignSelf: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: ms(1.5),
    borderColor: Colors.light.green,
    width: "100%",
    alignSelf: "center",
    marginTop: ms(1),
    paddingVertical: ms(8),
    borderRadius: ms(6),
  },
  cancelButtonText: {
    color: Colors.light.green,
    textAlign: "center",
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(14),
  },
  planButton: {
    flex: 1,
    height: s(40),
    borderRadius: ms(6),
    paddingTop: ms(10),
    paddingBottom: ms(10),
    paddingHorizontal: ms(10),
    marginRight: 0,
  },
  unselectedPlanButton: {
    backgroundColor: Colors.light.buttonBackground,
    borderColor: Colors.light.border,
  },
  greyButton: {
    flex: 1,
    width: "50%",
    height: s(40),
    borderRadius: ms(6),
    paddingTop: ms(10),
    paddingBottom: ms(10),
    paddingHorizontal: ms(10),
    backgroundColor: Colors.light.buttonBackground,
    marginBottom: 0,
  },
  selectedGreyButton: {
    backgroundColor: Colors.light.green,
    borderColor: Colors.light.green,
  },
});
