import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

export { width, CARD_WIDTH };

// ─── MoreScreen (index.tsx) ───────────────────────────────────────────────────
export const moreScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  logoutContainer: {
    marginTop: 32,
    //paddingHorizontal: 16,
    alignItems: "center",
  },
  versionText: {
    marginTop: 16,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    textTransform: "uppercase",
  },
});

// ─── MoreCarousel ─────────────────────────────────────────────────────────────
export const moreCarouselStyles = StyleSheet.create({
  container: {
    marginTop: 60,
    marginBottom: 24,
  },
  cardContainer: {
    //paddingHorizontal: 16,
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: 200, // Taller to fit both image and text
    backgroundColor: Colors.light.blackBackground, // Dark background from reference
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImageContainer: {
    width: "100%",
    height: 125,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 185, // Taller than container
    position: "absolute",
    top: 0, // Anchors to the top, preventing the head from being cut off
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 15,
  },

  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: -25, // Pulls the text container up
    zIndex: 10, // Ensures text stays on top
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  description: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    //marginTop: 19,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.light.green,
  },
  inactiveDot: {
    backgroundColor: Colors.light.white,
  },
});

// ─── MoreSectionHeader ────────────────────────────────────────────────────────
export const moreSectionHeaderStyles = StyleSheet.create({
  container: {
    //paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    textTransform: "uppercase",
  },
});

// ─── MoreListItem ─────────────────────────────────────────────────────────────
