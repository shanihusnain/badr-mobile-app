import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
export const globalStyles = StyleSheet.create({
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalSelectionWrapper: {
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
});