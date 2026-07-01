import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { INCOMPLETE_BAR_COLOR } from "./pastAchievementStyles";
import type { RecitationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { JuzAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationJuzPastAchievementData";

type ProgressAnalyticsView = RecitationAnalyticsView | JuzAnalyticsView;

type RecitationPastAchievementProgressSectionProps = {
  analyticsView: ProgressAnalyticsView;
  completed: number;
  incomplete: number;
  totalTimeMinutes: number;
  longestStreak: number;
  formatCount: (value: number) => string;
  formatTimeChip: (minutes: number) => string;
  completedLabel: string;
  incompleteLabel: string;
  timeSpentLabel: string;
  streakLabel: string;
  showStreak?: boolean;
};

const THIN_BAR_HEIGHT = 4;

type MetricChipProps = {
  label: string;
  value: string;
  tone: "completed" | "incomplete" | "streak";
};

function MetricChip({ label, value, tone }: MetricChipProps) {
  const toneStyles = {
    completed: styles.chipCompleted,
    incomplete: styles.chipIncomplete,
    streak: styles.chipStreak,
  } as const;

  const toneTextStyles = {
    completed: styles.chipTextCompleted,
    incomplete: styles.chipTextIncomplete,
    streak: styles.chipTextStreak,
  } as const;

  return (
    <View style={[styles.chip, toneStyles[tone]]}>
      <Text style={[styles.chipLabel, toneTextStyles[tone]]}>{label}</Text>
      <Text
        style={[
          styles.chipValue,
          toneTextStyles[tone],
          tone === "completed"
            ? { color: Colors.light.green }
            : tone === "incomplete"
              ? { color: INCOMPLETE_BAR_COLOR }
              : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function StreakChip({
  value,
  streakLabel,
}: {
  value: string;
  streakLabel: string;
}) {
  return (
    <View style={[styles.chip, styles.chipStreak]}>
      <Ionicons name="flame" size={12} color={Colors.light.golden} />
      <Text style={styles.chipValueStreak}>
        {value} {streakLabel}
      </Text>
    </View>
  );
}

export function RecitationPastAchievementProgressSection({
  analyticsView,
  completed,
  incomplete,
  totalTimeMinutes,
  longestStreak,
  formatCount,
  formatTimeChip,
  completedLabel,
  incompleteLabel,
  timeSpentLabel,
  streakLabel,
  showStreak = false,
}: RecitationPastAchievementProgressSectionProps) {
  const streakChip =
    showStreak && longestStreak > 0 ? (
      <StreakChip
        value={formatCount(longestStreak)}
        streakLabel={streakLabel}
      />
    ) : null;

  if (analyticsView === "completedVsTimeSpent") {
    const timeWidthPercent =
      totalTimeMinutes > 0
        ? Math.min(
            100,
            Math.max(24, Math.round((totalTimeMinutes / 720) * 100)),
          )
        : 0;

    return (
      <View style={styles.section}>
        <View style={styles.chipsRow}>
          <MetricChip
            label={completedLabel}
            value={formatCount(completed)}
            tone="completed"
          />
          <MetricChip
            label={timeSpentLabel}
            value={formatTimeChip(totalTimeMinutes)}
            tone="completed"
          />
          {streakChip}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.chipsRow}>
        <MetricChip
          label={completedLabel}
          value={formatCount(completed)}
          tone="completed"
        />
        <MetricChip
          label={incompleteLabel}
          value={formatCount(incomplete)}
          tone="incomplete"
        />
        {streakChip}
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
  chipCompleted: {
    // backgroundColor: Colors.light.lightgreen,
  },
  chipIncomplete: {
    // backgroundColor: Colors.light.calendarBg,
  },
  chipStreak: {
    backgroundColor: Colors.light.calendarBg,
  },
  chipLabel: {
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  chipValue: {
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    color: Colors.light.green,
  },
  chipTextCompleted: {
    color: Colors.light.grey,
  },
  chipTextIncomplete: {
    color: Colors.light.white,
  },
  chipTextStreak: {
    color: Colors.light.white,
  },
  chipValueStreak: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  thinBarTrack: {
    width: "100%",
    height: THIN_BAR_HEIGHT,
    borderRadius: 2,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
    flexDirection: "row",
  },
  thinBarFill: {
    height: THIN_BAR_HEIGHT,
    borderRadius: 2,
  },
});
