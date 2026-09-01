import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface PrayerQuantityInputStepProps {
  quantity: string;
  setQuantity: (val: string) => void;
  styles: any;
  /** Restored on blur when empty; also cleared on focus when shown. */
  emptyFallback?: string;
}

export function PrayerQuantityInputStep({
  quantity,
  setQuantity,
  styles: commonStyles,
  emptyFallback = "1",
}: PrayerQuantityInputStepProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const sanitizeDigits = (text: string) =>
    text.replace(/[^0-9]/g, "").slice(0, 2);

  return (
    <View style={[commonStyles.timePickerContainer, localStyles.container]}>
      <View style={commonStyles.timePickerRow}>
        <TextInput
          style={[
            commonStyles.timeInput,
            isFocused && { borderColor: Colors.light.white },
          ]}
          value={quantity}
          onChangeText={(text) => setQuantity(sanitizeDigits(text))}
          onFocus={() => {
            setIsFocused(true);
            // Clear placeholder default so typing starts fresh.
            if (quantity === emptyFallback) {
              setQuantity("");
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            if (quantity === "") {
              setQuantity(emptyFallback);
            }
          }}
          keyboardType="number-pad"
          maxLength={2}
          placeholder=""
          selectTextOnFocus={false}
          cursorColor={Colors.light.white}
          selectionColor="rgba(255,255,255,0.3)"
        />
        <Text style={[commonStyles.timeUnitLabel, localStyles.suffixText]}>
          prayer(s)
        </Text>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  suffixText: {
    marginLeft: 2,
    marginRight: 0,
    fontFamily: fonts.primary.regular,
    opacity: 0.8,
    fontSize: 14,
  },
});
