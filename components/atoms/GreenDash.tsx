import { Colors } from "@/constants/theme";
import { ms } from "@/src/utils/responsive";
import { StyleSheet, View } from "react-native";

export const GreenDash = () => {
  return <View style={styles.dashLine} />;
};

const styles = StyleSheet.create({
  dashLine: {
    height: ms(2),
    width: ms(40),
    backgroundColor: Colors.light.green,
    marginTop: ms(2),
  },
});
