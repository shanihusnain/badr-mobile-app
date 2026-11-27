import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { ms, s } from "@/src/utils/responsive";

export const RenderItem = ({
  item,
}: {
  item: {
    title: string;
    icon: React.ReactNode;
  };
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrapper}>{item.icon}</View>
      <Text style={styles.pointText}>{item.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: ms(18),
  },
  iconWrapper: {
    width: ms(24),
    height: ms(20),
    marginRight: ms(9),
    justifyContent: "center",
    alignItems: "center",
    marginTop: ms(2),
  },
  pointText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: 0,
    textAlign: "left",
    opacity: 1,
  },
});
