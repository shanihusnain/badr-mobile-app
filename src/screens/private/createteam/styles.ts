import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const createTeamStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  heroPressArea: {
    ...StyleSheet.absoluteFillObject,
    height: "42%",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  bottomShade: {
    ...StyleSheet.absoluteFillObject,
    top: "15%",
  },
  keyboardView: {
    flex: 1,
  },
  nameContent: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  inputWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 8,
  },
  teamNameInput: {
    alignSelf: "center",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
    letterSpacing: 0.5,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  nextButtonDisabled: {
    opacity: 0.45,
  },
  bannerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bannerBody: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 12,
  },
  carouselWrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  bannerCircle: {
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: Colors.light.darkgrey,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 26, 47, 0.55)",
  },
  swipeHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    gap: 28,
  },
  swipeChevrons: {
    flexDirection: "row",
    alignItems: "center",
    gap: -2,
  },
  swipeCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  swipeArrows: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: -2,
  },
  swipeHintText: {
    marginTop: 12,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 13,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 16,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.calendarBg,
  },
  orText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
  },
  bannerFooter: {
    paddingBottom: 8,
    gap: 12,
  },
});
