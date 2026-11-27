import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { ms } from "@/src/utils/responsive";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },

  greeting: {
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: ms(18),
    color: Colors.light.white,
    marginBottom: ms(20),
    lineHeight: ms(22),
    textTransform: "uppercase",
    letterSpacing: 0,
  },

  beginLabel: {
    color: Colors.light.white,
    fontSize: ms(14),
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    marginLeft: ms(8),
    lineHeight: ms(18),
  },
});
