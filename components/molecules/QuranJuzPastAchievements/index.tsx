import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  applyJuzAnalyticsView,
  formatJuzCountLabel,
  formatJuzTimeSpentChip,
  formatJuzTimeSpentLabel,
  getJuzAyatProgressPercent,
  getJuzPastAchievementFilters,
  getJuzProgressRailRows,
  getJuzTimeSpentByPeriod,
  getQuranJuzPastAchievement,
  getQuranJuzPastAchievementSlice,
  getTotalJuzTimeSpentMinutes,
  type JuzAnalyticsView,
  type JuzFilterId,
  type JuzPastAchievementRecord,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationJuzPastAchievementData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { JuzRecitationGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { RecitationPastAchievementProgressSection } from "../QuranHoursPastAchievements/RecitationPastAchievementProgressSection";
import { RecitationJuzDetailCard } from "../QuranHoursPastAchievements/RecitationJuzDetailCard";
import { InsightCard } from "../InsightCard";
import {
  getGoalById,
} from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { TopSpace } from "@/components/atoms/TopSpace";

export type QuranJuzPastAchievementsProps = {
  goalId: JuzRecitationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: JuzAnalyticsView;
  initialJuzFilter?: JuzFilterId;
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

const GOAL_SUMMARY_KEY = "progressLogging.achievementSummaryRecitationJuz";

const ANALYTICS_VIEWS: JuzAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTimeSpent",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<JuzAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
};

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonths",
  sixMonths: "progressLogging.previousSixMonths",
};

export function QuranJuzPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
  initialJuzFilter = "all",
}: QuranJuzPastAchievementsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [selectedJuzFilter, setSelectedJuzFilter] =
    useState<JuzFilterId>(initialJuzFilter);
  const [analyticsView, setAnalyticsView] = useState<JuzAnalyticsView>(
    initialAnalyticsView,
  );
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const juzFilters = useMemo(() => getJuzPastAchievementFilters(), []);

  const allPeriodSlice = useMemo(
    () => getQuranJuzPastAchievementSlice(period, "all"),
    [period],
  );

  const periodSlice = useMemo(
    () => getQuranJuzPastAchievementSlice(period, selectedJuzFilter),
    [period, selectedJuzFilter],
  );

  const isJuzDrillDown = isDetailed && selectedJuzFilter !== "all";

  const baseAchievement = useMemo(
    () => getQuranJuzPastAchievement(period, selectedJuzFilter),
    [period, selectedJuzFilter],
  );

  const timeSpentByPeriod = useMemo(
    () => getJuzTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () => applyJuzAnalyticsView(baseAchievement, periodSlice, analyticsView),
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
        formatJuzTimeSpentChip(Math.round(hours * 60));
    }
    return formatJuzCountLabel;
  }, [analyticsView, isDetailed]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalJuzTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, selectedJuzFilter, analyticsView]);

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

  const juzDisplayName =
    selectedJuzFilter === "all"
      ? t("progressLogging.juzFilterAll")
      : t("progressLogging.juzRowTitle", {
          number: formatNumber(selectedJuzFilter),
        });

  const progressRailRows = useMemo(
    () =>
      isDetailed
        ? getJuzProgressRailRows(
            allPeriodSlice,
            periodSlice,
            selectedJuzFilter,
            selectedBarIndex,
          )
        : [],
    [
      allPeriodSlice,
      isDetailed,
      periodSlice,
      selectedBarIndex,
      selectedJuzFilter,
    ],
  );

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

    return periodSlice.targetJuzCount;
  }, [
    displayBaseCompleted,
    displayBaseIncomplete,
    periodSlice.targetJuzCount,
    selectedBarIndex,
    selectedBaseWeek,
  ]);

  const displayGoalTotal = useMemo(() => {
    if (isJuzDrillDown && period === "monthly" && selectedBarIndex !== null) {
      return Math.max(
        1,
        Math.round(
          periodSlice.targetJuzCount /
            Math.max(periodSlice.chartPeriods.length, 1),
        ),
      );
    }

    return periodSlice.targetJuzCount;
  }, [
    isJuzDrillDown,
    period,
    periodSlice.chartPeriods.length,
    periodSlice.targetJuzCount,
    selectedBarIndex,
  ]);

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        analyticsView,
        goalCategory: "juz",
        selectedJuzFilter: String(selectedJuzFilter),
      },
    });
  }, [analyticsView, goalId, period, router, selectedJuzFilter]);

  const renderInsights = () => {
    if (!isDetailed) return null;

    const selectedJuzRecord = periodSlice.juzRecords.find(
      (record) =>
        selectedJuzFilter === "all" || record.juzNumber === selectedJuzFilter,
    );

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>
            {period === "monthly"
              ? "VS. LAST MONTH"
              : period === "threeMonths"
                ? "VS. LAST 3 MONTHS"
                : "VS. LAST 6 MONTHS"}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          <InsightCard
            iconName="calendar-outline"
            title={t("progressLogging.completed")}
            value={formatNumber(baseAchievement.completedHours)}
            subValue={t("progressLogging.unitJuz")}
            style={styles.insightCardFixed}
          />
          <InsightCard
            iconName="book-outline"
            title="AYAT RECITED"
            value={formatNumber(selectedJuzRecord?.completedAyatCount ?? 0)}
            subValue={`of ${formatNumber(selectedJuzRecord?.totalAyatCount ?? 0)}`}
            style={styles.insightCardFixed}
          />
          <InsightCard
            iconName="time-outline"
            title={t("progressLogging.timeSpentLabel")}
            value={formatJuzTimeSpentLabel(totalTimeSpentMinutes)}
            style={styles.insightCardFixed}
          />
        </ScrollView>
      </View>
    );
  };

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
          periodSlice.targetJuzCount /
            Math.max(periodSlice.chartPeriods.length, 1),
        ),
      );
      const weekPercent = Math.min(
        100,
        Math.round((selectedPeriod.completed / weeklyGoal) * 100),
      );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t("progressLogging.juzDetailedSummaryWeek", {
            week: formatNumber(selectedBarIndex + 1),
            juz: juzDisplayName,
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
          {t("progressLogging.juzDetailedSummaryMonthBar", {
            range: selectedPeriod.dateLabel,
            juz: juzDisplayName,
            percent: formatNumber(monthPercent),
          })}
        </Text>
      );
    }

    const summaryKey =
      period === "monthly"
        ? "progressLogging.juzDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.juzDetailedSummaryThreeMonths"
          : "progressLogging.juzDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          goalTotal: formatNumber(periodSlice.targetJuzCount),
          juz: juzDisplayName,
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

  const renderJuzFilterTabs = () => {
    if (!isDetailed) {
      return null;
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.juzTabsRowDetailed}
      >
        {juzFilters.map((juz) => {
          const isActive = selectedJuzFilter === juz.id;

          return (
            <TouchableOpacity
              key={String(juz.id)}
              activeOpacity={0.7}
              onPress={() => setSelectedJuzFilter(juz.id)}
              style={[
                styles.juzTabDetailed,
                isActive ? styles.juzTabDetailedActive : styles.juzTabDetailedInactive,
              ]}
            >
              <Text
                style={[
                  styles.juzTabDetailedText,
                  isActive && styles.juzTabDetailedTextActive,
                ]}
                numberOfLines={1}
              >
                {juz.id === "all"
                  ? t("progressLogging.juzFilterAll")
                  : t("progressLogging.juzFilterTab", {
                      number: formatNumber(juz.id),
                    })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderJuzRow = (item: JuzPastAchievementRecord) => {
    const progressPercent = getJuzAyatProgressPercent(
      item.completedAyatCount,
      item.totalAyatCount,
    );
    const isCompleted = item.status === "completed";

    return (
      <View key={`juz-${item.juzNumber}`} style={styles.juzRow}>
        <View style={styles.juzRowHeader}>
          <Text style={styles.juzRowTitle}>
            {t("progressLogging.juzRowTitle", {
              number: formatNumber(item.juzNumber),
            })}
          </Text>
          <View
            style={[
              styles.statusChip,
              isCompleted
                ? styles.statusChipCompleted
                : styles.statusChipIncomplete,
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                isCompleted
                  ? styles.statusChipTextCompleted
                  : styles.statusChipTextIncomplete,
              ]}
            >
              {isCompleted
                ? t("progressLogging.completed")
                : t("progressLogging.incomplete")}
            </Text>
          </View>
        </View>

        <View style={styles.goalProgressTrack}>
          <View
            style={[
              styles.goalProgressCompleted,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.ayatProgressLabel}>
          {t("progressLogging.ayatProgressLabel", {
            completed: formatNumber(item.completedAyatCount),
            total: formatNumber(item.totalAyatCount),
          })}
        </Text>
      </View>
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
          {isJuzDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.juzDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                juz: juzDisplayName,
              })}
            </Text>
          ) : null}
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
          <>
            {renderDetailedSummary()}
            {renderJuzFilterTabs()}
          </>
        ) : (
          <>
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.juzTabsRow}
            >
              {juzFilters.map((juz) => {
                const isActive = selectedJuzFilter === juz.id;
                return (
                  <Pressable
                    key={String(juz.id)}
                    onPress={() => setSelectedJuzFilter(juz.id)}
                    style={[
                      styles.juzTab,
                      isActive ? styles.juzTabActive : styles.juzTabInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.juzTabText,
                        isActive && styles.juzTabTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {juz.id === "all"
                        ? t("progressLogging.juzFilterAll")
                        : t("progressLogging.juzFilterTab", {
                            number: formatNumber(juz.id),
                          })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
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
                {t("progressLogging.unitJuz")}
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
            formatCount={formatJuzCountLabel}
            formatTimeChip={formatJuzTimeSpentChip}
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
                {formatJuzCountLabel(displayBaseCompleted)}
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
                  ? formatJuzTimeSpentLabel(selectedPeriodTimeSpentMinutes)
                  : formatJuzCountLabel(displayBaseIncomplete)}
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
            chartKey={`${goalId}-${period}-${selectedJuzFilter}-${analyticsView}`}
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
              <RecitationJuzDetailCard
                key={`juz-rail-${row.juzNumber}`}
                row={row}
                analyticsView={analyticsView}
                formatTimeChip={formatJuzTimeSpentChip}
              />
            ))}
          </View>
        ) : null}
      </View>

      {renderInsights()}

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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardHeaderBlock: {
    gap: 4,
  },
  drillDownHeader: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  goalInfoLabel: {
    color: Colors.light.white,
    fontSize: 18,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  summaryBold: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 20,
  },
  insightsSection: {
    marginTop: 16,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  insightsTitleLabel: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightsSubtitleLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightsScrollContent: {
    flexDirection: "row",
    gap: 10,
  },
  insightCardFixed: {
    width: 160,
    minWidth: 160,
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
  juzTabsRowDetailed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  juzTabDetailed: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.blackBackground,
  },
  juzTabDetailedActive: {
    backgroundColor: Colors.light.green,
    borderWidth: 1,
    borderColor: Colors.light.green,
  },
  juzTabDetailedInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  juzTabDetailedText: {
    color: Colors.light.grey,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  juzTabDetailedTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
  },
  juzTabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  juzTab: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.blackBackground,
  },
  juzTabActive: {
    backgroundColor: Colors.light.green,
    borderWidth: 1,
    borderColor: Colors.light.green,
  },
  juzTabInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  juzTabText: {
    color: Colors.light.grey,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  juzTabTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
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
  juzRowsSection: {
    gap: 14,
    marginTop: 4,
  },
  juzRow: {
    gap: 8,
  },
  juzRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  juzRowTitle: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    flexShrink: 0,
  },
  statusChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusChipCompleted: {
    backgroundColor: Colors.light.lightgreen,
  },
  statusChipIncomplete: {
    backgroundColor: Colors.light.calendarBg,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  statusChipTextCompleted: {
    color: Colors.light.green,
  },
  statusChipTextIncomplete: {
    color: Colors.light.yellow,
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
  ayatProgressLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
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
