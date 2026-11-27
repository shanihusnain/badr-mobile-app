import { Colors } from "@/constants/theme";
import { ms } from "@/src/utils/responsive";
import { StyleSheet, View } from "react-native";

export const Divider = () => {
  return <View style={styles.divider} />;
};
const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.light.divider,
    width: "100%",
    marginTop: ms(12),
  },
});
