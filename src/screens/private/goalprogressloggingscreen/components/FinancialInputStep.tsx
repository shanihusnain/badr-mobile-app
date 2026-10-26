import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface FinancialInputStepProps {
  amount: string;
  setAmount: (val: string) => void;
  styles: any;
  /** Prefixed currency code from the goal frame (`USD`, `SAR`, …). */
  currencySymbol?: string;
}

export function FinancialInputStep({
  amount,
  setAmount,
  styles: _commonStyles,
  currencySymbol = "USD",
}: FinancialInputStepProps) {
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  const handleFocus = () => {
    // Same as goal-setting Counter: clear leading 0 so typing replaces it.
    if (amount === "0" || amount === "") {
      setAmount("");
      setSelection({ start: 0, end: 0 });
      return;
    }
    const text = String(amount);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSelection({ start: 0, end: text.length });
      });
    });
  };

  const handleBlur = () => {
    setSelection(undefined);
    const digitsOnly = amount.replace(/[^0-9]/g, "");
    setAmount(digitsOnly === "" ? "0" : digitsOnly);
  };

  const handleChangeText = (text: string) => {
    setAmount(text.replace(/[^0-9]/g, ""));
  };

  return (
    <View style={localStyles.container}>
      <View style={localStyles.inputWrapper}>
        <Text style={localStyles.currencySymbol}>{currencySymbol} </Text>
        <TextInput
          style={localStyles.input}
          value={amount}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selection={selection}
          onSelectionChange={(e) => {
            setSelection(e.nativeEvent.selection);
          }}
          keyboardType="numeric"
          maxLength={6}
          cursorColor={Colors.light.white}
          selectionColor="rgba(255,255,255,0.3)"
          // No placeholder: Android draws the caret after placeholder text
          // (same as Counter in goal setting).
          placeholder=""
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
    minWidth: 75,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  currencySymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    lineHeight: 18,
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
