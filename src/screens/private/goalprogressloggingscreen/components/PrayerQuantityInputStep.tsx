import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface PrayerQuantityInputStepProps {
  quantity: string;
  setQuantity: (val: string) => void;
  styles: any;
}

export function PrayerQuantityInputStep({
  quantity,
  setQuantity,
  styles: commonStyles,
}: PrayerQuantityInputStepProps) {
  const { t } = useTranslation();

  return (
    <View style={localStyles.container}>
      <View style={localStyles.inputWrapper}>
        <TextInput
          style={localStyles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          maxLength={2}
          cursorColor={Colors.light.white}
          selectionColor="rgba(255,255,255,0.3)"
        />
      </View>
      <Text style={localStyles.suffixText}>prayer(s)</Text>
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
    borderWidth: 1,
    borderColor: Colors.light.white,
    borderRadius: 6,
    width: 48,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  input: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    textAlign: "center",
    padding: 0,
    width: "100%",
    height: "100%",
  },
  suffixText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 15,
  },
});
