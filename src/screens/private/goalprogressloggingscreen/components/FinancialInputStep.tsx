import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

/** ~px per digit at fontSize 16 semiBold. */
const DIGIT_WIDTH = 10;
const MIN_DIGITS = 1;
const MAX_DIGITS = 8;

function digitCountFromTarget(targetAmount?: number): number {
  if (
    targetAmount == null ||
    !Number.isFinite(targetAmount) ||
    targetAmount === 0
  ) {
    return MIN_DIGITS;
  }
  const digits = String(Math.floor(Math.abs(targetAmount))).length;
  return Math.min(MAX_DIGITS, Math.max(MIN_DIGITS, digits));
}

interface FinancialInputStepProps {
  amount: string;
  setAmount: (val: string) => void;
  styles: any;
  /** Prefixed currency code from the goal frame (`USD`, `SAR`, …). */
  currencySymbol?: string;
  /** Goal target — input width / maxLength follow its digit count. */
  targetAmount?: number;
}

export function FinancialInputStep({
  amount,
  setAmount,
  styles: _commonStyles,
  currencySymbol = "USD",
  targetAmount,
}: FinancialInputStepProps) {
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  const digitCount = useMemo(
    () => digitCountFromTarget(targetAmount),
    [targetAmount],
  );
  const inputWidth = digitCount * DIGIT_WIDTH;

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
          style={[localStyles.input, { width: inputWidth }]}
          value={amount}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selection={selection}
          onSelectionChange={(e) => {
            setSelection(e.nativeEvent.selection);
          }}
          keyboardType="numeric"
          maxLength={digitCount}
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
    justifyContent: "flex-start",
    gap: 8,
    marginTop: 10,
    // Match flowIconCircle (35) + marginRight (8) so the box aligns with the header text.
    marginLeft: 43,
  },
  inputWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 6,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  currencySymbol: {
    color: "rgba(255, 255, 255, 0.8)",
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
  },
});
