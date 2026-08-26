import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
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
            // Clear default so typing can replace with a 2-digit value.
            if (quantity === "1") {
              setQuantity("");
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            if (quantity === "") {
              setQuantity("1");
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
