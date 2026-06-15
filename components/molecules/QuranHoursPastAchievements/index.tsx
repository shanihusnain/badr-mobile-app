import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  formatGoalHoursLabel,
  getQuranHoursPastAchievement,
  type PastAchievementPeriod,
} from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { QuranHoursGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { INCOMPLETE_BAR_COLOR } from "./pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "./QuranHoursPastAchievementChartBlock";

type Props = {
  goalId: QuranHoursGoalId;
};

const PERIODS: PastAchievementPeriod[] = [
  "monthly",
  "threeMonths",
  "sixMonths",
];

const PERIOD_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.periodMonthly",
  threeMonths: "progressLogging.periodThreeMonths",
  sixMonths: "progressLogging.periodSixMonths",
};

const GOAL_SUMMARY_KEY: Record<QuranHoursGoalId, string> = {
  "quran-listening": "progressLogging.achievementSummaryListening",
  "quran-Tajweed": "progressLogging.achievementSummaryTajweed",
};

export function QuranHoursPastAchievements({ goalId }: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [period, setPeriod] = useState<PastAchievementPeriod>("monthly");
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const achievement = useMemo(
    () => getQuranHoursPastAchievement(goalId, period),
    [goalId, period],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId]);

  const handleBarPress = useCallback((index: number) => {
    setHintDismissed(true);
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const selectedWeek =
    selectedBarIndex !== null ? achievement.chartData[selectedBarIndex] : null;

  const displayCompletedHours =
    selectedWeek?.completedHours ?? achievement.completedHours;
  const displayIncompleteHours =
    selectedWeek?.incompleteHours ?? achievement.incompleteHours;
  const displayGoalHours = selectedWeek
    ? selectedWeek.completedHours + selectedWeek.incompleteHours
    : achievement.goalHours;

  const goalProgressPercent =
    displayGoalHours > 0
      ? Math.min(100, (displayCompletedHours / displayGoalHours) * 100)
      : 0;

  const showChartHint = !hintDismissed && selectedBarIndex === null;

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={16}
            color={Colors.light.white}
          />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements")}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={[styles.achievementBlock]}>
            <Text style={styles.achievementCaption}>
              {t("progressLogging.achievementsLabel")}
            </Text>
            <Text style={styles.achievementPercent}>
              {formatNumber(achievement.achievementPercent)}
              <Text style={styles.achievementPercentSymbol}>%</Text>
            </Text>
            <View style={styles.deltaBadge}>
              <Ionicons
                name="arrow-down"
                size={11}
                color={Colors.light.green}
              />
              <Text style={styles.deltaText}>
                {formatNumber(achievement.previousPeriodDeltaPercent)}%{" "}
                {t("progressLogging.previousMonth")}
              </Text>
            </View>
          </View>
          <View style={styles.periodNavRow}>
            <View style={styles.periodToggle}>
              {PERIODS.map((item) => {
                const isActive = period === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setPeriod(item)}
                    style={[
                      styles.periodButton,
                      isActive
                        ? styles.periodButtonActive
                        : styles.periodButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        isActive && styles.periodButtonTextActive,
                      ]}
                    >
                      {t(PERIOD_LABEL_KEYS[item])}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.dateNavRow}>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-back"
                  size={14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {achievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.summaryText}>
          {t(GOAL_SUMMARY_KEY[goalId], {
            percent: formatNumber(achievement.achievementPercent),
            delta: formatNumber(achievement.previousPeriodDeltaPercent),
          })}
        </Text>

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={styles.goalPillValue}>
              {formatNumber(achievement.goalHours)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {t("progressLogging.unitHours")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.completed")}
            </Text>
            <Text style={styles.statValueCompleted}>
              {formatGoalHoursLabel(displayCompletedHours)}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.incomplete")}
            </Text>
            <Text style={styles.statValueIncomplete}>
              {formatGoalHoursLabel(displayIncompleteHours)}
            </Text>
          </View>
        </View>

        {/* <View style={styles.goalProgressTrack}> */}
        {/* <View
            style={[
              styles.goalProgressCompleted,
              { width: `${goalProgressPercent}%` },
            ]}
          /> */}
        {/* </View> */}

        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={achievement.chartData}
            selectedBarIndex={selectedBarIndex}
            onBarPress={handleBarPress}
            chartKey={`${goalId}-${period}`}
            yMax={achievement.yMax}
            yTicks={achievement.yTicks}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={achievement.pageCount}
            activePageIndex={selectedBarIndex ?? achievement.activePageIndex}
          />
        </View>

        <Text style={styles.insightsTitle}>
          {t("progressLogging.keyInsights")}
        </Text>

        <View style={styles.insightsRow}>
          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>
              {t("progressLogging.completedIn")}
            </Text>
            <View style={styles.insightValueRow}>
              <View style={styles.insightIconCircle}>
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={Colors.light.green}
                />
              </View>
              <Text style={styles.insightValue}>
                {t("progressLogging.activeDays", {
                  count: achievement.activeDays,
                })}
              </Text>
            </View>
            <Text style={styles.insightCompare}>
              {formatNumber(achievement.activeDaysPrevious)}{" "}
              {t("progressLogging.daysLabel")}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>
              {t("progressLogging.longestStreak")}
            </Text>
            <View style={styles.insightValueRow}>
              <View
                style={[
                  styles.insightIconCircle,
                  styles.insightIconCircleStreak,
                ]}
              >
                <Ionicons name="flash" size={14} color={INCOMPLETE_BAR_COLOR} />
              </View>
              <Text style={styles.insightValue}>
                {t("progressLogging.streakDays", {
                  count: achievement.longestStreak,
                })}
              </Text>
            </View>
            <Text style={styles.insightCompare}>
              {formatNumber(achievement.longestStreakPrevious)}{" "}
              {t("progressLogging.daysLabel")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  achievementBlock: {
    alignItems: "flex-start",
    gap: 4,
  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 40,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 44,
  },
  achievementPercentSymbol: {
    fontSize: 22,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.lightgreen,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  deltaText: {
    color: Colors.light.green,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  periodNavRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  periodToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
    flexShrink: 0,
  },
  periodButton: {
    borderRadius: 5,
    paddingHorizontal: 23,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  periodButtonInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  periodButtonText: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
  },
  dateNavRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
    minWidth: 0,
  },
  navBtn: {
    padding: 2,
  },
  dateRange: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
    flexShrink: 1,
  },
  summaryText: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 17,
    textAlign: "center",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goalLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  goalPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 5,
  },
  goalPillText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    opacity: 0.8,
  },
  goalPillValue: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 22,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statColumn: {
    gap: 4,
  },
  statLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statValueCompleted: {
    color: Colors.light.green,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueIncomplete: {
    color: INCOMPLETE_BAR_COLOR,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  goalProgressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
  },
  goalProgressCompleted: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  insightsTitle: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  insightsRow: {
    flexDirection: "row",
    gap: 8,
  },
  insightCard: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  insightLabel: {
    color: Colors.light.subtext,
    fontSize: 9,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  insightValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(29, 191, 115, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightIconCircleStreak: {
    backgroundColor: "rgba(255, 213, 107, 0.15)",
  },
  insightValue: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
    flexShrink: 1,
  },
  insightCompare: {
    color: Colors.light.grey,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    marginLeft: 36,
  },
});
