import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const journalFillingStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  topGradient: {
    width: "100%",
  },
  topGradientContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  titleRowContainer: {
    marginTop: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.blackBackground,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
