import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";

type Props = {
  dateLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onShiftDate: (direction: -1 | 1) => void;
  styles: {
    dateRow: object;
    dateMainText: object;
  };
};

export function WhiteDaysFastDateStep({
  dateLabel,
  canGoPrev,
  canGoNext,
  onShiftDate,
  styles,
}: Props) {
  const { i18n } = useTranslation();

  return (
    <View style={styles.dateRow}>
      <TouchableOpacity
        onPress={() => onShiftDate(-1)}
        disabled={!canGoPrev}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
          size={32}
          color={
            canGoPrev ? Colors.light.white : Colors.light.dullWhiteOpacity
          }
        />
      </TouchableOpacity>
      <Text style={styles.dateMainText}>{dateLabel}</Text>
      <TouchableOpacity
        onPress={() => onShiftDate(1)}
        disabled={!canGoNext}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
          size={32}
          color={
            canGoNext ? Colors.light.white : Colors.light.dullWhiteOpacity
          }
        />
      </TouchableOpacity>
    </View>
  );
}
