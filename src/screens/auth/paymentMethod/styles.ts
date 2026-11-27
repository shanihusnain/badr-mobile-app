import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { ms, s } from "@/src/utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    paddingTop: ms(-4),
  },
  buttonContainer: {
    paddingLeft: ms(25),
    paddingTop: ms(16),
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: ms(25),
    paddingBottom: ms(20),
    paddingTop: ms(8),
  },
  text: {
    color: Colors.light.white,
    fontSize: ms(18),
    textAlign: "left",
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    marginTop: ms(16),
  },
  subtitletext: {
    color: Colors.light.subtext,
    fontSize: ms(16),
    textAlign: "left",
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    marginTop: ms(8),
  },

  undertext: {
    color: Colors.light.grey,
    fontSize: ms(12),
    textAlign: "left",
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    marginTop: ms(8),
  },

  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: ms(16),
  },

  planButton: {
    // width: s(135),
    height: ms(28),
    borderRadius: ms(6),

    paddingHorizontal: ms(10),
    marginRight: ms(10),
    maxWidth: s(150),
  },

  unselectedPlanButton: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderColor: Colors.light.border,
  },

  greyButton: {
    width: s(135),
    height: ms(24),
    borderRadius: ms(6),
    paddingTop: ms(5),
    paddingBottom: ms(5),
    paddingHorizontal: ms(10),
    backgroundColor: Colors.light.greybuttonBackground,
    marginTop: ms(2),
    //borderColor: Colors.light.border,
    //borderWidth: 1,
  },

  selectedGreyButton: {
    backgroundColor: Colors.light.green,
    borderColor: Colors.light.green,
  },

  underbuttontext: {
    color: Colors.light.white,
    fontSize: ms(14),
    textAlign: "left",
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    marginTop: ms(16),
  },

  formWrapper: {
    alignItems: "flex-start",
    width: "100%",
    marginTop: ms(16),
  },

  cardContainer: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(8),
    paddingHorizontal: ms(12),
    paddingVertical: ms(15),
    paddingTop: ms(19),
    width: "100%",
    maxWidth: s(343),
    alignItems: "flex-start",
  },

  cardSpacing: {
    marginTop: ms(16),
  },

  cardText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(14),
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
    borderRadius: ms(12),
    paddingHorizontal: ms(20),
    paddingVertical: ms(20),
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },

  slideTitle: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(20),
    marginBottom: ms(16),
  },

  slideSubtitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: ms(14),
    marginBottom: ms(16),
    marginTop: ms(-8),
  },

  slidePrice: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(12),
    marginBottom: ms(16),
    marginTop: ms(-16),
  },

  slideDescription: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: ms(14),
    marginBottom: ms(24),
    marginTop: ms(1),
  },

  slideDescription1: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: ms(14),
    marginBottom: ms(16),
    marginTop: ms(-16),
  },

  slideFullDescription: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: ms(12),
    marginTop: ms(16),
    lineHeight: ms(18),
  },

  descriptionBullet: {
    color: Colors.light.green,
    fontSize: ms(24),
    lineHeight: ms(20),
  },

  secondarySubtitle: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(18),
  },

  slideButton: {
    width: "80%",
    minHeight: ms(30),
    paddingTop: ms(6),
    paddingBottom: ms(6),
    marginTop: ms(8),
    alignSelf: "center",
    paddingHorizontal: ms(10),
  },

  slideButtonText: {
    fontSize: ms(14),
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: ms(18),
  },

  paginationContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: ms(16),
    alignSelf: "center",
  },

  paginationDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(5),
    backgroundColor: Colors.light.white,
    marginHorizontal: ms(4),
  },

  activeDot: {
    backgroundColor: Colors.light.green,
    width: ms(8),
    height: ms(8),
  },
});
