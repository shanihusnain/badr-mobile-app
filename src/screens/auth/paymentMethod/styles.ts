import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

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
    marginTop: hp(2),
  },
  subtitletext: {
    color: Colors.light.subtext,
    fontSize: 16,
    textAlign: "left",
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    marginTop: hp(1),
  },

  undertext: {
    color: Colors.light.grey,
    fontSize: 12,
    textAlign: "left",
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    marginTop: hp(1),
  },

  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2),
  },

  planButton: {
    // width: 135,
    height: 28,
    borderRadius: 6,

    paddingHorizontal: 10,
    marginRight: 10,
    maxWidth: 150,
  },

  unselectedPlanButton: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderColor: Colors.light.border,
  },

  greyButton: {
    width: 135,
    height: 24,
    borderRadius: 6,
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.greybuttonBackground,
    marginTop: 2,
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
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    paddingTop: 19,
    width: "100%",
    maxWidth: 343,
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
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },

  slideTitle: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 20,
    marginBottom: hp(2),
  },

  slideSubtitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 14,
    marginBottom: hp(2),
    marginTop: hp(-1),
  },

  slidePrice: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginBottom: hp(2),
    marginTop: hp(-2),
  },

  slideDescription: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    marginBottom: hp(3),
    marginTop: hp(0),
  },

  slideDescription1: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    marginBottom: hp(2),
    marginTop: hp(-2),
  },

  slideFullDescription: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    marginTop: hp(2),
    lineHeight: 18,
  },

  descriptionBullet: {
    color: Colors.light.green,
    fontSize: 24,
    lineHeight: 20,
  },

  secondarySubtitle: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: 18,
  },

  slideButton: {
    width: "80%",
    minHeight: 30,
    paddingTop: 6,
    paddingBottom: 6,
    marginTop: hp(1),
    alignSelf: "center",
    paddingHorizontal: 10,
  },

  slideButtonText: {
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 18,
  },

  paginationContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    alignSelf: "center",
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: Colors.light.white,
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: Colors.light.green,
    width: 8,
    height: 8,
  },
});
