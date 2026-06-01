import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, TextInput } from "react-native";
import { Pressable, View } from "react-native";
import { TopSpace } from "../atoms/TopSpace";

export const Counter = ({
  countTitle,
  handleDecrease,
  handleIncrease,
  count,
  setCount,
  width,
}: {
  countTitle: string;
  handleDecrease: () => void;
  handleIncrease: () => void;
  count: number;
  setCount: (value: number) => void;
  width?: string | number | any;
}) => {
  return (
    <View style={{ alignItems: "center", width: width ?? "60%" }}>
      <View style={[styles.wrapper, {}]}>
        <Pressable onPress={handleDecrease} disabled={count <= 0}>
          <Text style={styles.btnText}>-</Text>
        </Pressable>
        <TextInput
          value={count.toString()}
          onChangeText={(text) => setCount(parseInt(text) || 0)}
          keyboardType="numeric"
          style={styles.input}
        />

        <Pressable onPress={handleIncrease}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
      <TopSpace top={16} />
      <Text style={styles.title}>{countTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  input: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
  },
  btnText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
  },
  wrapper: {
    borderColor: Colors.light.white,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
  },
});
