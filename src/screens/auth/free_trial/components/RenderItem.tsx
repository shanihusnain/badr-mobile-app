import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

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
    marginTop: 18,
  },
  iconWrapper: {
    width: 24,
    height: 20,
    marginRight: 9,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    maxWidth: 307,
    color: Colors.dark.text,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: "left",
    opacity: 1,
  },
});
