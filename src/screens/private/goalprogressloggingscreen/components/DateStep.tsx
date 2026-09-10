import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";

interface DateStepProps {
  dateLabel: string;
  selectedDate: string;
  todayString: string;
  /** Earliest selectable date (e.g. cycle start). Back is disabled at/below this. */
  minSelectableDate?: string;
  /** Latest selectable date. Defaults to todayString. */
  maxSelectableDate?: string;
  onShiftDate: (direction: -1 | 1) => void;
  styles: any;
}

export const DateStep: React.FC<DateStepProps> = ({
  dateLabel,
  selectedDate,
  todayString,
  minSelectableDate,
  maxSelectableDate,
  onShiftDate,
  styles,
}) => {
  const { i18n } = useTranslation();
  const maxDate = maxSelectableDate ?? todayString;
  const canGoPrev = !minSelectableDate || selectedDate > minSelectableDate;
  const canGoNext = selectedDate < maxDate;

  const handleShiftPrev = React.useCallback(() => {
    if (!canGoPrev) return;
    onShiftDate(-1);
  }, [canGoPrev, onShiftDate]);

  const handleShiftNext = React.useCallback(() => {
    if (!canGoNext) return;
    onShiftDate(1);
  }, [canGoNext, onShiftDate]);

  return (
    <View style={styles.dateRow}>
      <TouchableOpacity
        onPress={handleShiftPrev}
        disabled={!canGoPrev}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
          size={32}
          color={canGoPrev ? Colors.light.white : "rgba(255, 255, 255, 0.55)"}
        />
      </TouchableOpacity>
      <Text style={styles.dateMainText}>{dateLabel}</Text>
      <TouchableOpacity
        onPress={handleShiftNext}
        disabled={!canGoNext}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
          size={32}
          color={canGoNext ? Colors.light.white : "rgba(255, 255, 255, 0.55)"}
        />
      </TouchableOpacity>
    </View>
  );
};
