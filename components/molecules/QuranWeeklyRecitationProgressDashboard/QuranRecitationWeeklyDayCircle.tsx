import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import type { WeeklySurahDayStatus } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import { getWeeklyDayCircleColors } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";

type Props = {
  status: WeeklySurahDayStatus;
  size: number;
  isSelected?: boolean;
};

export function QuranRecitationWeeklyDayCircle({
  status,
  size,
  isSelected = false,
}: Props) {
  const colors = getWeeklyDayCircleColors(status);

  return (
    <View
      style={[
        styles.outer,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
        },
        isSelected && styles.outerSelected,
      ]}
    >
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.backgroundColor,
            borderWidth: colors.borderWidth,
            borderColor: colors.borderColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerSelected: {
    transform: [{ scale: 1.04 }],
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
