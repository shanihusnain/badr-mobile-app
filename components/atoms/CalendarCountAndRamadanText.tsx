import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { ms } from "@/src/utils/responsive";

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
    fontSize: ms(16),
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(5),
    alignSelf: "center",
  },
});
