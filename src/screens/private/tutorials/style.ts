import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const tutorialsStyles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 48,
  },
  welcomeTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 22,
    marginBottom: 10,
  },
  welcomeMessage: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  videoCard: {
    height: 188,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 28,
    backgroundColor: Colors.light.greybuttonBackground,
  },
  videoImage: {
    ...StyleSheet.absoluteFill,
  },
  videoGradient: {
    ...StyleSheet.absoluteFill,
  },
  videoPlayCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(8, 26, 47, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoFooter: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoDurationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoDuration: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    marginLeft: 6,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  videoDoneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
  },
  progressLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.greybuttonBackground,
    marginBottom: 18,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: Colors.light.green,
  },
  taskCard: {
    width: "100%",
    aspectRatio: 343 / 158,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: Colors.light.greybuttonBackground,
  },
  taskCardTall: {
    aspectRatio: 343 / 226,
  },
  taskImage: {
    ...StyleSheet.absoluteFill,
  },
  taskGradient: {
    ...StyleSheet.absoluteFill,
  },
  taskTitleWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  taskTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  taskTitleUpper: {
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontSize: 13,
    lineHeight: 18,
  },
  taskTitleHighlight: {
    alignSelf: "flex-start",
    backgroundColor: "#F5C518",
    color: Colors.light.blackBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden",
  },
  chartCanvas: {
    ...StyleSheet.absoluteFill,
    paddingTop: 18,
    paddingHorizontal: 10,
    paddingBottom: 46,
    justifyContent: "flex-end",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  videoModal: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    justifyContent: "center",
  },
});
