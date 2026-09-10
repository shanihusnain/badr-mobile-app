import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import type {
  RecitationAnalyticsView,
  RecitationSurahBreakdownRow,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";

type RecitationSurahDetailCardProps = {
  row: RecitationSurahBreakdownRow;
  isActive: boolean;
  analyticsView: RecitationAnalyticsView;
  timeSpentMinutes: number;
  formatTimeChip: (minutes: number) => string;
};

function getFrequencySubtextKey(
  frequency: RecitationSurahBreakdownRow["frequency"],
  quantity: number,
): string {
  if (frequency === "weekly") {
    return quantity === 1
      ? "progressLogging.recitationFrequencyOnceWeekly"
      : "progressLogging.recitationFrequencyTimesWeekly";
  }

  return quantity === 1
    ? "progressLogging.recitationFrequencyOnceDaily"
    : "progressLogging.recitationFrequencyTimesDaily";
}

export function RecitationSurahDetailCard({
  row,
  isActive,
  analyticsView,
  timeSpentMinutes,
  formatTimeChip,
}: RecitationSurahDetailCardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();

  const incomplete = Math.max(0, row.target - row.completed);
  const isTimeSpentView = analyticsView === "completedVsTimeSpent";

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.surahMetaTitle}>
          {row.surahName}
          <Text style={styles.surahMetaFrequency}>
            {" "}
            (
            {t(getFrequencySubtextKey(row.frequency, row.quantity), {
              count: formatNumber(row.quantity),
            })}
            )
          </Text>
        </Text>
        {isActive ? (
          <View style={styles.activeBadge}>
            {isTimeSpentView ? (
              <Text
                style={[styles.activeBadgeText, styles.activeBadgeTimeSpent]}
              >
                {formatTimeChip(timeSpentMinutes)}
              </Text>
            ) : (
              <Text
                style={[
                  styles.activeBadgeText,
                  {
                    color: row.isCompleted
                      ? Colors.light.green
                      : Colors.light.yellow,
                  },
                ]}
              >
                {row.isCompleted
                  ? t("progressLogging.completed")
                  : t("progressLogging.incomplete")}
              </Text>
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.progressTrack}>
        {row.completed > 0 ? (
          <View
            style={[
              styles.progressFill,
              styles.progressCompleted,
              { flex: row.completed },
            ]}
          />
        ) : null}
        {incomplete > 0 ? (
          <View
            style={[
              styles.progressFill,
              isTimeSpentView
                ? styles.progressTimeSpent
                : styles.progressIncomplete,
              { flex: incomplete },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.recitationStat}>
          <Text style={styles.recitationCount}>
            <Text style={styles.recitationCountCompleted}>
              {formatNumber(row.completed)}
            </Text>
            {` / ${formatNumber(row.target)} ${t("progressLogging.unitRecitations")}`}
          </Text>
        </View>

        <View style={styles.streakCard}>
          <Ionicons name="flame" size={13} color={Colors.light.warning} />
          <Text style={styles.streakText}>
            {t("progressLogging.recitationLongestStreak", {
              count: formatNumber(row.longestStreak),
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
    paddingVertical: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  surahMetaTitle: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  surahMetaFrequency: {
    color: Colors.light.white,
    fontSize: 10,
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
    color: Colors.light.green,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
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
  activeBadgeTimeSpent: {
    color: Colors.light.green,
    textTransform: "none",
    letterSpacing: 0,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  recitationCountCompleted: {
    color: Colors.light.green,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  recitationStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recitationCount: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
  },
});
