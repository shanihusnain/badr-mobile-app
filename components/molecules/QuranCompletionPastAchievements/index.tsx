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
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  applyCompletionAnalyticsView,
  formatCompletionCountLabel,
  formatCompletionTimeSpentChip,
  formatCompletionTimeSpentLabel,
  getCompletionProgressRailRows,
  getCompletionTimeSpentByPeriod,
  getQuranCompletionPastAchievement,
  getQuranCompletionPastAchievementSlice,
  getTotalCompletionTimeSpentMinutes,
  type CompletionAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionPastAchievementData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { CompletionGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { RecitationPastAchievementProgressSection } from "../QuranHoursPastAchievements/RecitationPastAchievementProgressSection";
import { RecitationCompletionDetailCard } from "../QuranHoursPastAchievements/RecitationCompletionDetailCard";
import {
  getGoalById,
} from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { TopSpace } from "@/components/atoms/TopSpace";

export type QuranCompletionPastAchievementsProps = {
  goalId: CompletionGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: CompletionAnalyticsView;
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

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonths",
  sixMonths: "progressLogging.previousSixMonths",
};

const GOAL_SUMMARY_KEY =
  "progressLogging.achievementSummaryRecitationCompletion";

const ANALYTICS_VIEWS: CompletionAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTimeSpent",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<CompletionAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
};

export function QuranCompletionPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
}: QuranCompletionPastAchievementsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [analyticsView, setAnalyticsView] = useState<CompletionAnalyticsView>(
    initialAnalyticsView,
  );
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const periodSlice = useMemo(
    () => getQuranCompletionPastAchievementSlice(period),
    [period],
  );

  const baseAchievement = useMemo(
    () => getQuranCompletionPastAchievement(period),
    [period],
  );

  const timeSpentByPeriod = useMemo(
    () => getCompletionTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyCompletionAnalyticsView(baseAchievement, periodSlice, analyticsView),
    [analyticsView, baseAchievement, periodSlice],
  );

  const chartAchievement = useMemo(() => {
    if (isDetailed && analyticsView === "completedVsTimeSpent") {
      return applyTimeSpentOnlyGreenChart(baseAchievement, timeSpentByPeriod);
    }
    return achievement;
  }, [
    achievement,
    analyticsView,
    baseAchievement,
    isDetailed,
    timeSpentByPeriod,
  ]);

  const chartFormatBarValue = useMemo(() => {
    if (isDetailed && analyticsView === "completedVsTimeSpent") {
      return (hours: number) =>
        formatCompletionTimeSpentChip(Math.round(hours * 60));
    }
    return formatCompletionCountLabel;
  }, [analyticsView, isDetailed]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalCompletionTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const progressRailRows = useMemo(
    () =>
      isDetailed
        ? getCompletionProgressRailRows(periodSlice, selectedBarIndex)
        : [],
    [isDetailed, periodSlice, selectedBarIndex],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, analyticsView]);

  const handleBarPressCompact = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const handleBarPressDetailed = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex(index);
  }, []);

  const handleCloseBarSelection = useCallback(() => {
    setSelectedBarIndex(null);
  }, []);

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        analyticsView,
        goalCategory: "completion",
      },
    });
  }, [analyticsView, goalId, period, router]);

  const selectedBaseWeek =
    selectedBarIndex !== null
      ? baseAchievement.chartData[selectedBarIndex]
      : null;

  const displayBaseCompleted =
    selectedBaseWeek?.completedHours ?? baseAchievement.completedHours;
  const displayBaseIncomplete =
    selectedBaseWeek?.incompleteHours ?? baseAchievement.incompleteHours;

  const selectedPeriodTimeSpentMinutes =
    selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const selectedBarGoalTotal = useMemo(() => {
    if (selectedBarIndex === null) {
      return 0;
    }

    if (selectedBaseWeek) {
      return Math.max(
        selectedBaseWeek.stackTotalHours,
        displayBaseCompleted + displayBaseIncomplete,
        1,
      );
    }

    return periodSlice.targetCompletions;
  }, [
    displayBaseCompleted,
    displayBaseIncomplete,
    periodSlice.targetCompletions,
    selectedBarIndex,
    selectedBaseWeek,
  ]);

  const displayGoalTotal = useMemo(() => {
    if (period === "monthly" && selectedBarIndex !== null) {
      return Math.max(
        1,
        Math.round(
          periodSlice.targetCompletions /
            Math.max(periodSlice.chartPeriods.length, 1),
        ),
      );
    }

    return periodSlice.targetCompletions;
  }, [
    period,
    periodSlice.chartPeriods.length,
    periodSlice.targetCompletions,
    selectedBarIndex,
  ]);

  const showChartHint =
    isDetailed && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const renderDetailedSummary = () => {
    if (
      selectedBarIndex !== null &&
      periodSlice.chartPeriods[selectedBarIndex] &&
      period === "monthly"
    ) {
      const selectedPeriod = periodSlice.chartPeriods[selectedBarIndex];
      const weeklyGoal = Math.max(
        1,
        Math.round(
          periodSlice.targetCompletions /
            Math.max(periodSlice.chartPeriods.length, 1),
        ),
      );
      const weekPercent = Math.min(
        100,
        Math.round((selectedPeriod.completed / weeklyGoal) * 100),
      );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t("progressLogging.completionDetailedSummaryWeek", {
            week: formatNumber(selectedBarIndex + 1),
            percent: formatNumber(weekPercent),
          })}
        </Text>
      );
    }

    if (
      selectedBarIndex !== null &&
      periodSlice.chartPeriods[selectedBarIndex] &&
      period !== "monthly"
    ) {
      const selectedPeriod = periodSlice.chartPeriods[selectedBarIndex];
      const monthPercent = Math.min(
        100,
        Math.round(
          (selectedPeriod.completed /
            Math.max(selectedPeriod.completed + selectedPeriod.incomplete, 1)) *
            100,
        ),
      );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t("progressLogging.completionDetailedSummaryMonthBar", {
            range: selectedPeriod.dateLabel,
            percent: formatNumber(monthPercent),
          })}
        </Text>
      );
    }

    const summaryKey =
      period === "monthly"
        ? "progressLogging.completionDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.completionDetailedSummaryThreeMonths"
          : "progressLogging.completionDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          goalTotal: formatNumber(periodSlice.targetCompletions),
          delta: formatNumber(
            Math.abs(periodSlice.previousPeriodDeltaPercent),
          ),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
        })}
      </Text>
    );
  };
return (
    <View style={[styles.section, isDetailed && styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeaderBlock}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name={isDetailed ? "trending-up" : "trophy-outline"}
              size={isDetailed ? 19 : 16}
              color={isDetailed ? Colors.light.subtext : Colors.light.white}
            />
            <Text
              style={[
                styles.sectionTitle,
                isDetailed && styles.sectionTitleDetailed,
              ]}
            >
              {t("progressLogging.pastGoalAchievements")}
            </Text>
            {!isDetailed ? (
              <TouchableOpacity
                onPress={handleNavigateToDetailed}
                style={{ marginLeft: "auto", padding: 4 }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.light.white}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.topRow}>
          <View style={styles.achievementBlock}>
            <Text
              style={[
                styles.achievementCaption,
                isDetailed && styles.achievementCaptionDetailed,
              ]}
            >
              {isDetailed
                ? t("progressLogging.achievementsLabel").toUpperCase()
                : t("progressLogging.achievementsLabel")}
            </Text>
            <Text
              style={[
                styles.achievementPercent,
                isDetailed && styles.achievementPercentDetailed,
              ]}
            >
              {formatNumber(achievement.achievementPercent)}
              <Text
                style={[
                  styles.achievementPercentSymbol,
                  isDetailed && styles.achievementPercentSymbolDetailed,
                ]}
              >
                %
              </Text>
            </Text>
            <View
              style={[
                styles.deltaBadge,
                !deltaIsPositive && styles.deltaBadgeNegative,
              ]}
            >
              <Ionicons
                name={deltaIsPositive ? "arrow-up" : "arrow-down"}
                size={11}
                color={
                  deltaIsPositive ? Colors.light.green : Colors.light.subtext
                }
              />
              <Text
                style={[
                  styles.deltaText,
                  !deltaIsPositive && styles.deltaTextNegative,
                ]}
              >
                {deltaIsPositive ? "+" : ""}
                {formatNumber(baseAchievement.previousPeriodDeltaPercent)}%{" "}
                {t(PERIOD_DELTA_LABEL_KEYS[period])}
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
                  size={isDetailed ? 24 : 14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {achievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={isDetailed ? 24 : 14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isDetailed ? (
          renderDetailedSummary()
        ) : (
          <Text style={styles.summaryText}>
            {t(GOAL_SUMMARY_KEY, {
              percent: formatNumber(baseAchievement.achievementPercent),
              delta: formatNumber(
                Math.abs(baseAchievement.previousPeriodDeltaPercent),
              ),
              direction: deltaIsPositive
                ? t("progressLogging.periodComparisonIncrease")
                : t("progressLogging.periodComparisonDecrease"),
            })}
          </Text>
        )}

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>
            {isDetailed
              ? t("progressLogging.recitationGoalTotalLabel")
              : t("progressLogging.goal")}
          </Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalPillValue}>
              {formatNumber(displayGoalTotal)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {t("progressLogging.unitCompletions")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.analyticsToggle}>
          {ANALYTICS_VIEWS.map((view) => {
            const isActive = analyticsView === view;
            return (
              <Pressable
                key={view}
                onPress={() => setAnalyticsView(view)}
                style={[
                  styles.analyticsButton,
                  isActive
                    ? styles.analyticsButtonActive
                    : styles.analyticsButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.analyticsButtonText,
                    isActive && styles.analyticsButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {t(ANALYTICS_VIEW_LABEL_KEYS[view])}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isDetailed ? (
          <RecitationPastAchievementProgressSection
            analyticsView={analyticsView}
            completed={displayBaseCompleted}
            incomplete={displayBaseIncomplete}
            totalTimeMinutes={selectedPeriodTimeSpentMinutes}
            longestStreak={0}
            formatCount={formatCompletionCountLabel}
            formatTimeChip={formatCompletionTimeSpentChip}
            completedLabel={t("progressLogging.completed")}
            incompleteLabel={t("progressLogging.incomplete")}
            timeSpentLabel={t("progressLogging.timeSpentLabel")}
            streakLabel={t("progressLogging.daysLabel")}
            showStreak={false}
          />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>
                {t("progressLogging.completed")}
              </Text>
              <Text style={styles.statValueCompleted}>
                {formatCompletionCountLabel(displayBaseCompleted)}
              </Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>
                {analyticsView === "completedVsTimeSpent"
                  ? t("progressLogging.timeSpentLabel")
                  : t("progressLogging.incomplete")}
              </Text>
              <Text
                style={
                  analyticsView === "completedVsTimeSpent"
                    ? styles.statValueTimeSpent
                    : styles.statValueIncomplete
                }
              >
                {analyticsView === "completedVsTimeSpent"
                  ? formatCompletionTimeSpentLabel(
                      selectedPeriodTimeSpentMinutes,
                    )
                  : formatCompletionCountLabel(displayBaseIncomplete)}
              </Text>
            </View>
          </View>
        )}

        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={chartAchievement.chartData}
            selectedBarIndex={isDetailed ? selectedBarIndex : null}
            onBarPress={
              isDetailed ? handleBarPressDetailed : handleBarPressCompact
            }
            chartKey={`${goalId}-${period}-${analyticsView}`}
            yMax={chartAchievement.yMax}
            yTicks={chartAchievement.yTicks}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={chartAchievement.pageCount}
            activePageIndex={selectedBarIndex ?? chartAchievement.activePageIndex}
            formatBarValue={chartFormatBarValue}
            showPagination={isDetailed}
            barColors={
              analyticsView === "completedVsTimeSpent"
                ? [Colors.light.green, Colors.light.green]
                : [Colors.light.green, Colors.light.warning]
            }
          />
        </View>

        {isDetailed ? (
          <GraphBarSelectionFooter
            visible={selectedBarIndex !== null}
            completed={displayBaseCompleted}
            incomplete={displayBaseIncomplete}
            goalTotal={selectedBarGoalTotal}
            onClose={handleCloseBarSelection}
          />
        ) : null}

        {isDetailed && progressRailRows.length > 0 ? (
          <View style={styles.progressRailSection}>
            {progressRailRows.map((row) => (
              <RecitationCompletionDetailCard
                key={`completion-rail-${row.completionNumber}`}
                row={row}
                analyticsView={analyticsView}
                formatTimeChip={formatCompletionTimeSpentChip}
              />
            ))}
          </View>
        ) : null}
      </View>

      <PastAchievementStudyMaterial items={studyMaterial} isDetailed={isDetailed} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  sectionDetailed: {
    marginTop: 0,
  },
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cardHeaderBlock: {
    gap: 4,
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
  sectionTitleDetailed: {
    color: Colors.light.white,
    fontSize: 13,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  achievementCaptionDetailed: {
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 40,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 44,
  },
  achievementPercentDetailed: {
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    textTransform: "uppercase",
  },
  achievementPercentSymbol: {
    fontSize: 22,
  },
  achievementPercentSymbolDetailed: {
    fontSize: 16,
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
  deltaBadgeNegative: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  deltaText: {
    color: Colors.light.green,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  deltaTextNegative: {
    color: Colors.light.subtext,
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
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
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
  summaryTextDetailed: {
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
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  goalPillText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    opacity: 0.6,
  },
  goalPillValue: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 22,
  },
  analyticsToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 6,
    gap: 4,
  },
  analyticsButton: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  analyticsButtonActive: {
    backgroundColor: Colors.light.green,
  },
  analyticsButtonInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  analyticsButtonText: {
    color: Colors.light.grey,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
  },
  analyticsButtonTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
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
  statValueTimeSpent: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  progressRailSection: {
    gap: 14,
    marginTop: 4,
  },
  insightsTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
