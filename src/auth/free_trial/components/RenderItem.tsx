import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
export const RenderItem = ({
  item,
}: {
  item: {
    title: string;
  };
}) => {
  return <Text style={styles.pointText}>{item.title}</Text>;
};
const styles = StyleSheet.create({
  pointText: {
    width: 307,
    color: Colors.dark.text,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: hp(1.8),
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: "left",
    opacity: 1,
    marginTop: 16,
  },
});
