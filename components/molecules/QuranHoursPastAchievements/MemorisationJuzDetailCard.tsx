import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import type { MemorisationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import type { MemorisationJuzProgressRailRow } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationJuzPastAchievementData";

type MemorisationJuzDetailCardProps = {
  row: MemorisationJuzProgressRailRow;
  analyticsView: MemorisationAnalyticsView;
  formatTimeChip: (minutes: number) => string;
};

export function MemorisationJuzDetailCard({
  row,
  analyticsView,
  formatTimeChip,
}: MemorisationJuzDetailCardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const isTimeSpentView = analyticsView === "completedVsTimeSpent";
  const incompleteVerses = Math.max(0, row.totalVerses - row.completedVerses);
  const title = `${row.juzName} | ${row.rangeLabel}`;

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.metaTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.activeBadge}>
          {isTimeSpentView ? (
            <Text style={[styles.activeBadgeText, styles.activeBadgeTimeSpent]}>
              {formatTimeChip(row.timeSpentMinutes)}
            </Text>
          ) : (
            <Text
              style={[
                styles.activeBadgeText,
                {
                  color: row.isCompleted
                    ? Colors.light.green
                    : Colors.light.warning,
                },
              ]}
            >
              {row.isCompleted
                ? t("progressLogging.completed")
                : t("progressLogging.incomplete")}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.progressTrack}>
        {row.completedVerses > 0 ? (
          <View
            style={[
              styles.progressFill,
              styles.progressCompleted,
              { flex: row.completedVerses },
            ]}
          />
        ) : null}
        {incompleteVerses > 0 ? (
          <View
            style={[
              styles.progressFill,
              isTimeSpentView
                ? styles.progressTimeSpent
                : styles.progressIncomplete,
              { flex: incompleteVerses },
            ]}
          />
        ) : null}
      </View>

      <Text style={styles.verseCount}>
        <Text style={styles.verseCountCompleted}>
          {formatNumber(row.completedVerses)}
        </Text>
        {` / ${formatNumber(row.totalVerses)} ${t("progressLogging.juzVerseProgressUnit")}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  metaTitle: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  activeBadge: {
    borderRadius: 6,
    backgroundColor: Colors.light.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  activeBadgeTimeSpent: {
    color: Colors.light.green,
    textTransform: "none",
    letterSpacing: 0,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
    flexDirection: "row",
  },
  progressFill: {
    height: "100%",
  },
  progressCompleted: {
    backgroundColor: Colors.light.ringSuccess,
  },
  progressIncomplete: {
    backgroundColor: Colors.light.warning,
  },
  progressTimeSpent: {
    backgroundColor: Colors.light.blackBackground,
  },
  verseCount: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  verseCountCompleted: {
    color: Colors.light.green,
  },
});
