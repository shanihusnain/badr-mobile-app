import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export const CalendarCountAndRamadanText = ({
  fastCount,
  countColor,
  title,
}: {
  fastCount: number;
  countColor: string;
  title: string;
}) => {
  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.count,
          {
            color: countColor,
          },
        ]}
      >
        {fastCount}
      </Text>
      <Text style={styles.count}>{title}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  count: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "center",
  },
});
