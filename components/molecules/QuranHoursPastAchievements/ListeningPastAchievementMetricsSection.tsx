import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { INCOMPLETE_BAR_COLOR } from "./pastAchievementStyles";

type ListeningPastAchievementMetricsSectionProps = {
  completedMinutes: number;
  incompleteMinutes: number;
  formatDuration: (totalMinutes: number) => string;
  completedLabel: string;
  incompleteLabel: string;
};

type MetricChipProps = {
  label: string;
  value: string;
  tone: "completed" | "incomplete";
};

function MetricChip({ label, value, tone }: MetricChipProps) {
  const isCompleted = tone === "completed";

  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text
        style={[
          styles.chipValue,
          isCompleted ? styles.chipValueCompleted : styles.chipValueIncomplete,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function ListeningPastAchievementMetricsSection({
  completedMinutes,
  incompleteMinutes,
  formatDuration,
  completedLabel,
  incompleteLabel,
}: ListeningPastAchievementMetricsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.chipsRow}>
        <MetricChip
          label={completedLabel}
          value={formatDuration(completedMinutes)}
          tone="completed"
        />
        <MetricChip
          label={incompleteLabel}
          value={formatDuration(incompleteMinutes)}
          tone="incomplete"
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
  chipValueCompleted: {
    color: Colors.light.green,
  },
  chipValueIncomplete: {
    color: INCOMPLETE_BAR_COLOR,
  },
});
