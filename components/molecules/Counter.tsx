import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Platform, StyleSheet, Text, TextInput } from "react-native";
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
      <View style={styles.wrapper}>
        <Pressable
          onPress={handleDecrease}
          disabled={count <= 0}
          hitSlop={8}
          style={[styles.btnHit, count <= 0 && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>-</Text>
        </Pressable>
        <TextInput
          value={count.toString()}
          onChangeText={(text) => setCount(parseInt(text) || 0)}
          keyboardType="numeric"
          style={styles.input}
          underlineColorAndroid="transparent"
        />

        <Pressable onPress={handleIncrease} hitSlop={8} style={styles.btnHit}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
      <TopSpace top={8} />
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
    flex: 1,
    height: "100%",
    textAlign: "center",
    ...Platform.select({
      android: { textAlignVertical: "center" as const },
      default: {},
    }),
    fontSize: 16,
    // Keep lineHeight ≤ box inner height so digits aren't clipped
    lineHeight: 18,
    fontWeight: "500",
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    margin: 0,
    includeFontPadding: false,
  },
  btnHit: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
    includeFontPadding: false,
  },
  wrapper: {
    borderColor: Colors.light.white,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    width: 120,
    height: 32,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 0,
    overflow: "hidden",
  },
});
