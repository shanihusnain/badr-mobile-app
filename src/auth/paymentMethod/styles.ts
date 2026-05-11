import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { fonts } from "../../../assets/fonts";
import { Colors } from "../../../constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingTop: hp(-4),
  },
  buttonContainer: {
    paddingLeft: 25,
    paddingTop: hp(2),
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 25,
    paddingBottom: 20,
    paddingTop: hp(1),
  },
  text: {
    color: Colors.light.white,
    fontSize: 18,
    textAlign: "left",
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
  },
  subtitletext: {
    color: Colors.light.white,
    fontSize: 18,
    textAlign: "left",
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    marginTop: hp(2),
  },

  undertext: {
    color: Colors.light.buttonBackground,
    fontSize: 12,
    textAlign: "left",
    fontFamily: fonts.primary.semiBold,
    fontWeight: "400",
    marginTop: hp(2),
  },

  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2),
  },

  planButton: {
    width: 115,
    height: 23,
    borderRadius: 6,
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  unselectedPlanButton: {
    backgroundColor: Colors.light.buttonBackground,
    borderColor: Colors.light.border,
  },

  greyButton: {
    width: 139,
    height: 23,
    borderRadius: 6,
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.buttonBackground,
    //borderColor: Colors.light.border,
    //borderWidth: 1,
  },

  selectedGreyButton: {
    backgroundColor: Colors.light.green,
    borderColor: Colors.light.green,
  },

  underbuttontext: {
    color: Colors.light.white,
    fontSize: 14,
    textAlign: "left",
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    marginTop: hp(2),
  },

  formWrapper: {
    alignItems: "flex-start",
    width: "100%",
    marginTop: hp(2),
  },

  cardContainer: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 15,
    width: 320,
    alignItems: "flex-start",
  },

  cardSpacing: {
    marginTop: hp(2),
  },

  cardText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
  },

  sliderWrapper: {
    width: "100%",
    alignItems: "center",
  },

  sliderContent: {
    alignItems: "center",
    paddingHorizontal: 0,
  },

  slideCard: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 3,
    justifyContent: "center",
    minHeight: 220,
    alignItems: "flex-start",
  },

  slideTitle: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 20,
    marginBottom: hp(4),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  slideSubtitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    marginBottom: hp(1),
  },

  slidePrice: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
    marginBottom: hp(2),
  },

  secondarySubtitle: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
  },

  slideButton: {
    width: "100%",
    marginTop: hp(3),
    alignSelf: "stretch",
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
  },

  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.white,
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: Colors.light.green,
    width: 14,
  },
});
