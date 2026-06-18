import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { MAX_JUZ, MIN_JUZ } from "../quranRecitationCompletionTarget";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  styles: Record<string, object>;
  showPrefix?: boolean;
};

export function JuzStepper({
  value,
  min = MIN_JUZ,
  max = MAX_JUZ,
  onChange,
  styles,
  showPrefix = true,
}: Props) {
  const formatNumber = useLocaleNumber();
  const clampedValue = Math.min(Math.max(value, min), max);

  const handleDecrement = () => {
    if (clampedValue <= min) return;
    onChange(clampedValue - 1);
  };

  const handleIncrement = () => {
    if (clampedValue >= max) return;
    onChange(clampedValue + 1);
  };

  return (
    <View
      style={[
        styles.recitationCounterRow,
        {
          paddingVertical: 2,
          paddingHorizontal: 6,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.light.white,
          alignSelf: "center",
        },
      ]}
    >
      <View style={styles.recitationCounterControls}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={clampedValue <= min}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
        >
          <Ionicons name="remove" size={24} color={Colors.light.white} />
        </TouchableOpacity>

        <View style={styles.recitationCounterValue}>
          <Text style={styles.recitationCounterValueText}>
            {showPrefix
              ? `J${formatNumber(clampedValue)}`
              : formatNumber(clampedValue)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={clampedValue >= max}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={24}
            color={
              clampedValue >= max
                ? Colors.light.dullWhiteOpacity
                : Colors.light.white
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
