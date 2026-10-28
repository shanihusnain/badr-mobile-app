import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface CounterStepProps {
  label: string;
  unit: string;
  value: string;
  onChangeText: (val: string) => void;
}

function digitsOnly(text: string): string {
  return text.replace(/[^0-9]/g, "");
}

/**
 * Meal / clothing count input (Kaffarah, Fidya).
 * Uses a local draft while focused so parent re-renders / focus clears
 * cannot race the native TextInput (common simulator bug: 1st digit ok,
 * 2nd digit dropped).
 */
export function CounterStep({
  label: _label,
  unit,
  value,
  onChangeText,
}: CounterStepProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!focused) {
      setDraft(value);
    }
  }, [value, focused]);

  const handleFocus = () => {
    setFocused(true);
    // Clear leading 0 so typing starts fresh (caret centered in empty field).
    if (value === "0" || value === "") {
      setDraft("");
      onChangeText("");
      return;
    }
    setDraft(String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    const next = digitsOnly(draft) === "" ? "0" : digitsOnly(draft);
    setDraft(next);
    onChangeText(next);
  };

  const handleChangeText = (text: string) => {
    const next = digitsOnly(text);
    setDraft(next);
    onChangeText(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={focused ? draft : value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={4}
          cursorColor={Colors.light.white}
          selectionColor="rgba(255,255,255,0.3)"
          // No placeholder: Android draws the caret after placeholder text.
          placeholder=""
          // Prefer native select-all for non-empty values; avoid controlled
          // `selection` which races keystrokes on the iOS simulator.
          selectTextOnFocus={value !== "0" && value !== ""}
          underlineColorAndroid="transparent"
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
    gap: 4,
    width: "100%",
    marginTop: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 6,
    minWidth: 48,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 10,
  },
  input: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    padding: 0,
    margin: 0,
    textAlign: "center",
    minWidth: 28,
    width: "100%",
  },
  unitText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
});
