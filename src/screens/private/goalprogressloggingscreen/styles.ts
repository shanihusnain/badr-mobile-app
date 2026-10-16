import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

/**
 * Shared vertical rhythm for EVERY logging goal screen
 * (10 prayer + Quran + fasting + sadaqah) — tuned on Missed Ramadan.
 */
export const LOGGING_SCREEN_SPACING = {
  /** Gap under the progress ring, above My Progress.
   * Nudges My Progress + green card + 7-day dashboard down; hero grows with it
   * because height is measured to Past Achievements. */
  afterRing: 28,
  /** Gap under My Progress, above the 7-day dashboard. */
  afterMyProgress: 24,
  /** Gap under the dashboard, above Past Goal Achievements. */
  afterDashboard: 4,
} as const;

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
  /** Positions the scrollable hero image relative to header + body. */
  heroScrollScope: {
    position: "relative",
  },
  /** Scrolls with content; height ends at weekly dashboard bottom. */
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: "hidden",
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
    ...StyleSheet.absoluteFill,
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
    paddingTop: 40,
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
    fontSize: 12,
    opacity: 0.95,
    letterSpacing: -0.2,
    marginBottom: 0,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  circlePercentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  circlePercentNumber: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
  },
  circlePercentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 1,
    marginBottom: 3,
    lineHeight: 15,
  },
  weeklyDashboardWrapper: {
    width: "92%",
    alignSelf: "center",
    paddingTop: 4,
    paddingBottom: 8,
    // Keep below logging-flow overlays, but avoid Android elevation —
    // elevated siblings steal vertical pans on some OEMs (e.g. MIUI).
    zIndex: 1,
    elevation: 0,
  },
  pastAchievementsWrapper: {
    width: "92%",
    alignSelf: "center",
    paddingTop: 28,
    paddingBottom: 16,
    zIndex: 0,
    elevation: 0,
  },
  transparentBackground: {
    backgroundColor: "transparent",
  },
});
