import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

type Props = {
  amount: string;
  setAmount: (value: string) => void;
  currencySymbol?: string;
};

export function AmountStep({ amount, setAmount, currencySymbol = "$" }: Props) {
  const handleChange = (text: string) => {
    // Only allow numbers
    const formatted = text.replace(/[^0-9]/g, "");
    setAmount(formatted);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.currencySymbol}>{currencySymbol} </Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={handleChange}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.6)"
          selectionColor={Colors.light.white}
          maxLength={6}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.dullWhiteOpacity,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minWidth: 70,
    height: 34,
    justifyContent: "center",
  },
  currencySymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
  },
  input: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    minWidth: 40,
    textAlign: "center",
    padding: 0,
  },
});
