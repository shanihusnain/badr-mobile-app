import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Color } from "expo-router";
import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: hp(2),
    paddingBottom: hp(3),
  },
  title: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    lineHeight: 18,
  },
  placeholder: {
    width: 40, // Same width as back button for balance
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 10,
  },
  cardNumberWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: hp(1),
  },
  cardNumberLabel: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: hp(0.5),
  },
  cardNumberContainer: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardNumberInput: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: hp(1),
  },
  cardDetailWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  cardDetailLabel: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: hp(0.5),
  },
  cardDetailContainer: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardDetailInput: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
  },
  userNameWrapper: {
    paddingHorizontal: 20,
    marginTop: hp(1),
  },
  userNameLabel: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: hp(0.5),
  },
  userNameContainer: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userNameInput: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: hp(1.5),
  },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 0,
  },
  checkboxLabel: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "400",
  },
  actionButtonsWrapper: {
    paddingHorizontal: 20,
    marginTop: hp(19),
    marginBottom: hp(2),
  },
  primaryActionButton: {
    width: "100%",
    alignSelf: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.light.green,
    width: "100%",
    alignSelf: "center",
    marginTop: hp(0),
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: Colors.light.green,
    textAlign: "center",
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
  },
  planButton: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginRight: 0,
  },
  unselectedPlanButton: {
    backgroundColor: Colors.light.buttonBackground,
    borderColor: Colors.light.border,
  },
  greyButton: {
    flex: 1,
    width: "50%",
    height: 40,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.buttonBackground,
    marginBottom: 0,
  },
  selectedGreyButton: {
    backgroundColor: Colors.light.green,
    borderColor: Colors.light.green,
  },
});
