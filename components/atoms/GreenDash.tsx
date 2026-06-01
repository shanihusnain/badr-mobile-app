import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";
import { View } from "react-native";

export const GreenDash = () => {
  return <View style={styles.dashLine} />;
};

const styles = StyleSheet.create({
  dashLine: {
    height: 2,
    width: 40,
    backgroundColor: Colors.light.green,
    marginTop: 2,
  },
});
