import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { InsightCardFlashIcon } from "@/assets/icons";
import type { MemorisationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import type { MemorisationHizbProgressRailRow } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementSliceData";

type MemorisationHizbDetailCardProps = {
  row: MemorisationHizbProgressRailRow;
  analyticsView: MemorisationAnalyticsView;
  formatTimeChip: (minutes: number) => string;
};

export function MemorisationHizbDetailCard({
  row,
  analyticsView,
  formatTimeChip,
}: MemorisationHizbDetailCardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const isTimeSpentView = analyticsView === "completedVsTimeSpent";
  const incompleteVerses = Math.max(0, row.totalVerses - row.completedVerses);
  const longestStreak = row.longestStreak ?? 0;
  const title = `${row.hizbName} | ${row.rangeLabel}`;

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.metaTitle} numberOfLines={2}>
          {title}
        </Text>
        {isTimeSpentView ? (
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>
              {formatTimeChip(row.timeSpentMinutes)}
            </Text>
          </View>
        ) : row.isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>
              {t("progressLogging.completed")}
            </Text>
          </View>
        ) : (
          <View style={styles.incompleteBadge}>
            <Text style={styles.incompleteBadgeText}>
              {t("progressLogging.incomplete")}
            </Text>
          </View>
        )}
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

      <View style={styles.statsRow}>
        <Text style={styles.verseCount}>
          <Text style={styles.verseCountCompleted}>
            {formatNumber(row.completedVerses)}
          </Text>
          {` / ${formatNumber(row.totalVerses)} ${t("progressLogging.juzVerseProgressUnit")}`}
        </Text>
        <View style={styles.streakRow}>
          <InsightCardFlashIcon size={12} color={Colors.light.green} />
          <Text style={styles.streakText}>
            {t("progressLogging.recitationLongestStreak", {
              count: formatNumber(longestStreak),
            })}
          </Text>
        </View>
      </View>
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
  completedBadge: {
    borderRadius: 6,
    backgroundColor: Colors.light.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completedBadgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  incompleteBadge: {
    borderRadius: 6,
    backgroundColor: Colors.light.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  incompleteBadgeText: {
    color: Colors.light.warning,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  timeBadge: {
    borderRadius: 6,
    backgroundColor: Colors.light.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeBadgeText: {
    color: Colors.light.green,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
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
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  verseCount: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    flexShrink: 1,
  },
  verseCountCompleted: {
    color: Colors.light.green,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },
  streakText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
  },
});
