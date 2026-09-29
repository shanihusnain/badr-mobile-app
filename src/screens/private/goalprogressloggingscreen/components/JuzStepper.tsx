import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  MAX_JUZ,
  MIN_JUZ,
  snapJuzOffExcluded,
  stepJuzSkippingExcluded,
} from "../quranRecitationCompletionTarget";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  /** Fully logged juz — skipped by +/- and snapped off if current. */
  excluded?: number[];
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
  excluded = [],
  showPrefix = true,
  focused = true,
  onFocus,
}: Props) {
  const formatNumber = useLocaleNumber();
  const clampedValue = snapJuzOffExcluded(value, min, max, excluded);
  const prevAvailable = stepJuzSkippingExcluded(
    clampedValue,
    -1,
    min,
    max,
    excluded,
  );
  const nextAvailable = stepJuzSkippingExcluded(
    clampedValue,
    1,
    min,
    max,
    excluded,
  );

  const handleDecrement = () => {
    onFocus?.();
    if (prevAvailable == null) return;
    onChange(prevAvailable);
  };

  const handleIncrement = () => {
    onFocus?.();
    if (nextAvailable == null) return;
    onChange(nextAvailable);
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
        disabled={prevAvailable == null}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 8 }}
        activeOpacity={0.8}
        style={localStyles.iconHit}
      >
        <Ionicons
          name="remove"
          size={14}
          color={
            prevAvailable == null
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
        disabled={nextAvailable == null}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 10 }}
        activeOpacity={0.8}
        style={localStyles.iconHit}
      >
        <Ionicons
          name="add"
          size={14}
          color={
            nextAvailable == null
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
    height: 24,
    minWidth: 64,
    paddingHorizontal: 6,
    gap: 6,
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
    minWidth: 20,
  },
});
