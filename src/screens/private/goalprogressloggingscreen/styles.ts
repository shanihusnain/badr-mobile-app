import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    zIndex: 1,
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingBottom: 32,
    marginTop: 20,
  },
  scrollContentWithHero: {
    marginTop: 0,
    paddingTop: 0,
  },
  /** Sibling behind ScrollView — never inside it (MIUI touch freeze). */
  heroBackgroundFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  scrollHeader: {
    zIndex: 2,
    elevation: 0,
    position: "relative",
  },
  heroBackgroundImage: {
    width: "100%",
    height: "100%",
  },
  heroBackgroundScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  scrollForeground: {
    position: "relative",
    zIndex: 1,
    elevation: 0,
  },
  goalInfoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
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
    gap: 2,
    width: "100%",
    height: "100%",
  },
  circleGoalText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    opacity: 0.95,
    letterSpacing: -0.2,
    marginBottom: 0,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  circlePercentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  circlePercentNumber: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40,
  },
  circlePercentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 1,
    marginBottom: 4,
    lineHeight: 18,
  },
  weeklyDashboardWrapper: {
    width: "92%",
    alignSelf: "center",
    paddingTop: 12,
    paddingBottom: 16,
    // Keep below logging-flow overlays, but avoid Android elevation —
    // elevated siblings steal vertical pans on some OEMs (e.g. MIUI).
    zIndex: 1,
    elevation: 0,
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
