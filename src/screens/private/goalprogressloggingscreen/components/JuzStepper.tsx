import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { MAX_JUZ, MIN_JUZ } from "../quranRecitationCompletionTarget";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  /** Kept for call-site compatibility; compact stepper uses local styles. */
  styles?: Record<string, object>;
  showPrefix?: boolean;
  /** Full-white border when focused; muted border when not. Default true. */
  focused?: boolean;
  onFocus?: () => void;
};

const BORDER_FOCUSED = Colors.light.white;
const BORDER_MUTED = "rgba(255, 255, 255, 0.4)";

/**
 * Compact juz +/- pill — matches Figma Step 4 (~74×24 on the 228px flow card).
 * Intentionally smaller than `recitationCounter*` used by RecitationCountStep.
 */
export function JuzStepper({
  value,
  min = MIN_JUZ,
  max = MAX_JUZ,
  onChange,
  showPrefix = true,
  focused = true,
  onFocus,
}: Props) {
  const formatNumber = useLocaleNumber();
  const clampedValue = Math.min(Math.max(value, min), max);

  const handleDecrement = () => {
    onFocus?.();
    if (clampedValue <= min) return;
    onChange(clampedValue - 1);
  };

  const handleIncrement = () => {
    onFocus?.();
    if (clampedValue >= max) return;
    onChange(clampedValue + 1);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onFocus}
      style={[
        localStyles.pill,
        { borderColor: focused ? BORDER_FOCUSED : BORDER_MUTED },
      ]}
    >
      <TouchableOpacity
        onPress={handleDecrement}
        disabled={clampedValue <= min}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 8 }}
        activeOpacity={0.8}
        style={localStyles.iconHit}
      >
        <Ionicons
          name="remove"
          size={14}
          color={
            clampedValue <= min
              ? Colors.light.dullWhiteOpacity
              : Colors.light.white
          }
        />
      </TouchableOpacity>

      <Text style={localStyles.valueText}>
        {showPrefix
          ? `j${formatNumber(clampedValue)}`
          : formatNumber(clampedValue)}
      </Text>

      <TouchableOpacity
        onPress={handleIncrement}
        disabled={clampedValue >= max}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 10 }}
        activeOpacity={0.8}
        style={localStyles.iconHit}
      >
        <Ionicons
          name="add"
          size={14}
          color={
            clampedValue >= max
              ? Colors.light.dullWhiteOpacity
              : Colors.light.white
          }
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: 24,
    minWidth: 74,
    paddingHorizontal: 8,
    gap: 10,
    borderWidth: 1,
    borderRadius: 6,
  },
  iconHit: {
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    textAlign: "center",
    minWidth: 22,
  },
});
