import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

type ListeningPastAchievementMetricsSectionProps = {
  completedMinutes: number;
  incompleteMinutes: number;
  formatDuration: (totalMinutes: number) => string;
  completedLabel: string;
  incompleteLabel: string;
  completedValueColor?: string;
  incompleteValueColor?: string;
};

type MetricChipProps = {
  label: string;
  value: string;
  valueColor: string;
};

function MetricChip({ label, value, valueColor }: MetricChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function ListeningPastAchievementMetricsSection({
  completedMinutes,
  incompleteMinutes,
  formatDuration,
  completedLabel,
  incompleteLabel,
  completedValueColor = Colors.light.white,
  incompleteValueColor = Colors.light.white,
}: ListeningPastAchievementMetricsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.chipsRow}>
        <MetricChip
          label={completedLabel}
          value={formatDuration(completedMinutes)}
          valueColor={completedValueColor}
        />
        <MetricChip
          label={incompleteLabel}
          value={formatDuration(incompleteMinutes)}
          valueColor={incompleteValueColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    alignItems: "flex-start",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipLabel: {
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: Colors.light.grey,
  },
  chipValue: {
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
});
