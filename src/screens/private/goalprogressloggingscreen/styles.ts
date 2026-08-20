import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    overflow: "visible",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    color: Colors.light.subtext,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },

  scrollContent: {
    paddingBottom: 32,
    marginTop: 20,
    overflow: "visible",
  },
  scrollContentWithHero: {
    marginTop: 0,
    paddingTop: 100,
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  heroBackgroundImage: {
    width: "100%",
    height: "100%",
  },
  heroBackgroundScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  goalInfoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 4,
    position: "relative",
  },
  loadingPlaceholderText: {
    opacity: 0.35,
  },
  loadingDashText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 16,
    fontWeight: "400",
    opacity: 0.4,
  },
  ringCheckmark: {
    position: "absolute",
    top: 0,
    zIndex: 3,
  },
  largeCircleInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: "100%",
  },
  circleGoalText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: -0.5,
    marginBottom: -4,
    fontWeight: "500",
  },
  circlePercentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  circlePercentNumber: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 32,
    fontWeight: "400",
  },
  circlePercentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    marginLeft: 2,
  },
  weeklyDashboardWrapper: {
    width: "92%",
    alignSelf: "center",
    paddingTop: 12,
    paddingBottom: 16,
    zIndex: 95,
    elevation: 10,
  },
  pastAchievementsWrapper: {
    width: "92%",
    alignSelf: "center",
    paddingTop: 12,
    paddingBottom: 16,
    zIndex: 0,
    elevation: 0,
  },
  transparentBackground: {
    backgroundColor: "transparent",
  },
});
