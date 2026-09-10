import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export type ComparisonBarItem = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
};

type PastAchievementComparisonBarsProps = {
  bars: ComparisonBarItem[];
};

const BAR_HEIGHT = 40;
const MIN_BAR_WIDTH_PERCENT = 28;

export function PastAchievementComparisonBars({
  bars,
}: PastAchievementComparisonBarsProps) {
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <View style={styles.barsContainer}>
      {bars.map((bar) => {
        const widthPercent = Math.max(
          MIN_BAR_WIDTH_PERCENT,
          (bar.value / maxValue) * 100,
        );

        return (
          <View key={bar.label} style={styles.barRow}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${widthPercent}%`,
                  backgroundColor: bar.color,
                },
              ]}
            >
              <Text style={styles.barText} numberOfLines={1}>
                {bar.label} {bar.displayValue}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barsContainer: {
    gap: 10,
  },
  barRow: {
    width: "100%",
    height: BAR_HEIGHT,
    borderRadius: 8,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
    justifyContent: "center",
  },
  barFill: {
    height: BAR_HEIGHT,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  barText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
});
