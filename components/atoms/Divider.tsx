import { Colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

export const Divider = () => {
  return <View style={styles.divider} />;
};
const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.light.divider,
    width: "100%",
    marginTop: 12,
  },
});