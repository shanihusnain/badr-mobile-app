import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const myAccountStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  container: {
    flex: 1,
    //paddingHorizontal: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 36,
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: -1,
  },
  headerTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.greybuttonversion,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 8,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  listIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    width: 24,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  listItemSubtitle: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    marginTop: 2,
  },
});
