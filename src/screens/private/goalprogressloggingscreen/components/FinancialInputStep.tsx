import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface FinancialInputStepProps {
  amount: string;
  setAmount: (val: string) => void;
  styles: any;
}

export function FinancialInputStep({
  amount,
  setAmount,
  styles: commonStyles,
}: FinancialInputStepProps) {
  return (
    <View style={localStyles.container}>
      <View style={localStyles.inputWrapper}>
        <Text style={localStyles.currencySymbol}>$</Text>
        <TextInput
          style={localStyles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          maxLength={6}
          cursorColor={Colors.light.white}
          selectionColor="rgba(255,255,255,0.3)"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.light.white,
    borderRadius: 6,
    width: 80,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  currencySymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    marginRight: 4,
  },
  input: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    padding: 0,
    flex: 1,
  },
});
