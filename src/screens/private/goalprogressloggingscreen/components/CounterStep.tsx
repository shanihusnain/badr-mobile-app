import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface CounterStepProps {
  label: string;
  unit: string;
  value: string;
  onChangeText: (val: string) => void;
}

/**
 * Meal / clothing count input (Kaffarah, Fidya).
 * Same focus/blur rules as FinancialInputStep: clear leading 0 on focus,
 * restore "0" on blur / after log when empty.
 */
export function CounterStep({
  label: _label,
  unit,
  value,
  onChangeText,
}: CounterStepProps) {
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  const handleFocus = () => {
    // Same as FinancialInputStep / goal-setting Counter: clear leading 0
    // so typing starts fresh (no leftover 0 in the field).
    if (value === "0" || value === "") {
      onChangeText("");
      setSelection({ start: 0, end: 0 });
      return;
    }
    const text = String(value);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSelection({ start: 0, end: text.length });
      });
    });
  };

  const handleBlur = () => {
    setSelection(undefined);
    const digitsOnly = value.replace(/[^0-9]/g, "");
    onChangeText(digitsOnly === "" ? "0" : digitsOnly);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text.replace(/[^0-9]/g, ""));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selection={selection}
          onSelectionChange={(e) => {
            setSelection(e.nativeEvent.selection);
          }}
          keyboardType="numeric"
          maxLength={4}
          cursorColor={Colors.light.white}
          selectionColor="rgba(255,255,255,0.3)"
          // No placeholder: Android draws the caret after placeholder text
          // (same as FinancialInputStep).
          placeholder=""
          selectTextOnFocus={false}
        />
      </View>
      <Text style={styles.unitText}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    marginTop: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: Colors.light.white,
    borderRadius: 6,
    minWidth: 36,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  input: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    padding: 0,
    textAlign: "center",
    minWidth: 20,
  },
  unitText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
});
