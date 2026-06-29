import React from "react";
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
 * An input step used in the Kaffarah flow for logging number of meals given or clothes provided.
 * Matches the design of a rounded border input next to the unit label.
 */
export function CounterStep({
  label,
  unit,
  value,
  onChangeText,
}: CounterStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          maxLength={4}
          cursorColor={Colors.light.white}
          selectionColor="rgba(255,255,255,0.3)"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.5)"
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
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 6,
    width: 32,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  input: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    padding: 0,
    textAlign: "center",
    width: "100%",
  },
  unitText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
  },
});
