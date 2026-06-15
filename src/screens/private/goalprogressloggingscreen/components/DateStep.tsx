import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";

interface DateStepProps {
  dateLabel: string;
  selectedDate: string;
  todayString: string;
  onShiftDate: (direction: -1 | 1) => void;
  styles: any;
}

export const DateStep: React.FC<DateStepProps> = ({
  dateLabel,
  selectedDate,
  todayString,
  onShiftDate,
  styles,
}) => {
  const { i18n } = useTranslation();
  const handleShiftPrev = React.useCallback(() => {
    onShiftDate(-1);
  }, [onShiftDate]);

  const handleShiftNext = React.useCallback(() => {
    onShiftDate(1);
  }, [onShiftDate]);

  return (
    <View style={styles.dateRow}>
      <TouchableOpacity
        onPress={handleShiftPrev}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
          size={32}
          color={Colors.light.white}
        />
      </TouchableOpacity>
      <Text style={styles.dateMainText}>{dateLabel}</Text>
      <TouchableOpacity
        onPress={handleShiftNext}
        disabled={selectedDate >= todayString}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
          size={32}
          color={
            selectedDate >= todayString
              ? Colors.light.dullWhiteOpacity
              : Colors.light.white
          }
        />
      </TouchableOpacity>
    </View>
  );
};
