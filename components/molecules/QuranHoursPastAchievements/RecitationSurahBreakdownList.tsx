import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import type {
  RecitationAnalyticsView,
  RecitationSurahBreakdownRow,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";

type RecitationSurahBreakdownListProps = {
  rows: RecitationSurahBreakdownRow[];
  analyticsView: RecitationAnalyticsView;
  formatTimeChip: (minutes: number) => string;
};

const BAR_HEIGHT = 7;

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

export function RecitationSurahBreakdownList({
  rows,
  analyticsView,
  formatTimeChip,
}: RecitationSurahBreakdownListProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const isTimeSpentView = analyticsView === "completedVsTimeSpent";

  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.list}>
      {rows.map((row) => {
        const incomplete = Math.max(0, row.target - row.completed);

        return (
          <View key={row.surahId} style={styles.row}>
            <View style={styles.rowHeader}>
              <View style={styles.rowTitleBlock}>
                <Text style={styles.surahName}>
                  {row.surahName}
                  <Text
                    style={[
                      styles.surahName,
                      {
                        fontSize: 10,
                      },
                    ]}
                  >
                    {" "}
                    (
                    {t(getFrequencySubtextKey(row.frequency, row.quantity), {
                      count: formatNumber(row.quantity),
                    })}
                    )
                  </Text>
                </Text>
              </View>
              {isTimeSpentView ? (
                <View style={styles.badge}>
                  <Text style={[styles.completedBadgeText, styles.timeBadgeText]}>
                    {formatTimeChip(row.timeSpentMinutes)}
                  </Text>
                </View>
              ) : row.isCompleted ? (
                <View style={styles.badge}>
                  <Text style={styles.completedBadgeText}>
                    {t("progressLogging.completed")}
                  </Text>
                </View>
              ) : (
                <View style={styles.badge}>
                  <Text
                    style={[
                      styles.completedBadgeText,
                      {
                        color: Colors.light.yellow,
                      },
                    ]}
                  >
                    {t("progressLogging.incomplete")}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.barTrack}>
              {row.completed > 0 ? (
                <View
                  style={[
                    styles.barFill,
                    styles.barFillCompleted,
                    { flex: row.completed },
                  ]}
                />
              ) : null}
              {incomplete > 0 ? (
                <View
                  style={[
                    styles.barFill,
                    isTimeSpentView
                      ? styles.barFillTimeSpent
                      : styles.barFillIncomplete,
                    { flex: incomplete },
                  ]}
                />
              ) : null}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.recitationCount}>
                <Text style={styles.recitationCountCompleted}>
                  {formatNumber(row.completed)}
                </Text>
                {` / ${formatNumber(row.target)} ${t("progressLogging.unitRecitations")}`}
              </Text>
              <Text style={styles.streakText}>
                {t("progressLogging.recitationLongestStreak", {
                  count: formatNumber(row.longestStreak),
                })}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.light.white,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  list: {
    gap: 14,
  },
  row: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  rowTitleBlock: {
    flex: 1,
    gap: 2,
  },
  surahName: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  frequencySubtext: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
  },
  statsBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  recitationCount: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  recitationCountCompleted: {
    color: Colors.light.green,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  streakText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
  },
  completedBadge: {
    borderRadius: 6,
    backgroundColor: Colors.light.lightgreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completedBadgeText: {
    color: Colors.light.green,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  timeBadgeText: {
    textTransform: "none",
  },
  barTrack: {
    width: "100%",
    height: BAR_HEIGHT,
    borderRadius: 4,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
    flexDirection: "row",
  },
  barFill: {
    height: "100%",
  },
  barFillCompleted: {
    backgroundColor: Colors.light.ringSuccess,
  },
  barFillIncomplete: {
    backgroundColor: Colors.light.warning,
  },
  barFillTimeSpent: {
    backgroundColor: Colors.light.blackBackground,
  },
});
