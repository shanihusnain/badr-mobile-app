import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  formatMemorisationAyahLabel,
  getMemorisationPastAchievement,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationPastAchievementData";
import {
  applyMemorisationAnalyticsView,
  formatMemorisationAyahCountLabel,
  formatMemorisationTimeSpentChip,
  getMemorisationGoalTrackedMonths,
  getMemorisationPastAchievementFilters,
  getMemorisationProgressRailRows,
  getMemorisationTimeSpentByPeriod,
  getQuranMemorisationSurahPastAchievement,
  getQuranMemorisationSurahPastAchievementSlice,
  getTotalMemorisationTimeSpentMinutes,
  getTotalMemorizedVerses,
  hasMemorisationPastAchievementLogs,
  type MemorisationAnalyticsView,
  type MemorisationSurahFilterId,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import type {
  HizbMemorisationGoalId,
  SurahMemorisationGoalId,
} from "@/src/screens/private/goalprogressloggingscreen/types";
import { isHizbMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbTarget";
import { isSurahMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationTarget";
import { useOptionalMemorisationSurahContext } from "@/src/screens/private/goalprogressloggingscreen/memorisationSurahContext";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { RecitationPastAchievementProgressSection } from "../QuranHoursPastAchievements/RecitationPastAchievementProgressSection";
import { MemorisationSurahDetailCard } from "../QuranHoursPastAchievements/MemorisationSurahDetailCard";
import { HizbMemorisationPastAchievements } from "./HizbMemorisationPastAchievementsSection";
import { memorisationPastAchievementStyles as styles } from "./memorisationPastAchievementsStyles";
import { InsightCard } from "../InsightCard";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  getGoalById,
} from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";

export type QuranMemorisationPastAchievementsProps = {
  goalId: SurahMemorisationGoalId | HizbMemorisationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: MemorisationAnalyticsView;
  initialSurahId?: string;
  initialHizbId?: string;
};

type Props = QuranMemorisationPastAchievementsProps;

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

const ANALYTICS_VIEWS: MemorisationAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTimeSpent",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<MemorisationAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
};

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonths",
  sixMonths: "progressLogging.previousSixMonths",
};

function SurahMemorisationPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
  initialSurahId = "all",
}: {
  goalId: SurahMemorisationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: MemorisationAnalyticsView;
  initialSurahId?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
const surahContext = useOptionalMemorisationSurahContext();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [analyticsView, setAnalyticsView] =
    useState<MemorisationAnalyticsView>(initialAnalyticsView);
  const [detailedSurahFilter, setDetailedSurahFilter] =
    useState<MemorisationSurahFilterId>(initialSurahId ?? "all");
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];

  const surahFilters = useMemo(() => getMemorisationPastAchievementFilters(), []);
  const selectedSurahId: MemorisationSurahFilterId = isDetailed
    ? detailedSurahFilter
    : (surahContext?.activeSurahId ?? "all");
  const refreshKey = surahContext?.refreshKey ?? 0;
  const isSurahDrillDown = isDetailed && selectedSurahId !== "all";

  const surahDisplayName =
    surahFilters.find((filter) => filter.id === selectedSurahId)?.surahName ??
    "";

  const allPeriodSlice = useMemo(
    () => getQuranMemorisationSurahPastAchievementSlice(period, "all"),
    [period, refreshKey],
  );

  const periodSlice = useMemo(
    () =>
      getQuranMemorisationSurahPastAchievementSlice(period, selectedSurahId),
    [period, selectedSurahId, refreshKey],
  );

  const hasLogs = useMemo(
    () => hasMemorisationPastAchievementLogs(periodSlice),
    [periodSlice],
  );

  const baseAchievement = useMemo(
    () => getQuranMemorisationSurahPastAchievement(period, selectedSurahId),
    [period, selectedSurahId, refreshKey],
  );

  const compactAchievement = useMemo(
    () => getMemorisationPastAchievement(selectedSurahId),
    [selectedSurahId, refreshKey],
  );

  const timeSpentByPeriod = useMemo(
    () => getMemorisationTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      isDetailed
        ? applyMemorisationAnalyticsView(
            baseAchievement,
            periodSlice,
            analyticsView,
          )
        : null,
    [analyticsView, baseAchievement, isDetailed, periodSlice],
  );

  const chartAchievement = useMemo(() => {
    if (!isDetailed || !achievement) return null;
    if (analyticsView === "completedVsTimeSpent") {
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
        formatMemorisationTimeSpentChip(Math.round(hours * 60));
    }
    return (value: number) =>
      t("progressLogging.memorisationAyahCount", {
        count: formatNumber(value),
      });
  }, [analyticsView, formatNumber, isDetailed, t]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalMemorisationTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const goalTrackedMonths = getMemorisationGoalTrackedMonths(period);
  const totalMemorizedVerses = getTotalMemorizedVerses(periodSlice);

  const progressRailRows = useMemo(
    () =>
      isDetailed
        ? getMemorisationProgressRailRows(
            allPeriodSlice,
            periodSlice,
            selectedSurahId,
            selectedBarIndex,
          )
        : [],
    [
      allPeriodSlice,
      isDetailed,
      periodSlice,
      selectedBarIndex,
      selectedSurahId,
    ],
  );

  const selectedBaseBar =
    selectedBarIndex !== null
      ? baseAchievement.chartData[selectedBarIndex]
      : null;

  const displayBaseCompleted =
    selectedBaseBar?.completedHours ?? baseAchievement.completedHours;
  const displayBaseIncomplete =
    selectedBaseBar?.incompleteHours ?? baseAchievement.incompleteHours;

  const showNoDataDash = isPastAchievementBarEmpty(
    displayBaseCompleted,
    displayBaseIncomplete,
  );

  const selectedPeriodTimeSpentMinutes =
    selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const selectedBarGoalTotal = useMemo(() => {
    if (selectedBarIndex === null) return 0;
    if (selectedBaseBar) {
      return Math.max(
        selectedBaseBar.stackTotalHours,
        displayBaseCompleted + displayBaseIncomplete,
        1,
      );
    }
    return periodSlice.totalAyahs;
  }, [
    displayBaseCompleted,
    displayBaseIncomplete,
    periodSlice.totalAyahs,
    selectedBarIndex,
    selectedBaseBar,
  ]);

  useEffect(() => {
    if (isDetailed && initialSurahId) {
      setDetailedSurahFilter(initialSurahId);
    }
  }, [initialSurahId, isDetailed]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, selectedSurahId, analyticsView]);

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
        goalCategory: "surah",
        goalType: "quran_memorisation",
        selectedSurahId:
          selectedSurahId === "all" ? undefined : selectedSurahId,
      },
    });
  }, [analyticsView, goalId, period, router, selectedSurahId]);

  const formatStatCount = (value: number) =>
    showNoDataDash
      ? PAST_ACHIEVEMENT_NO_DATA
      : formatMemorisationAyahCountLabel(value);

  const showChartHint =
    isDetailed && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const renderSurahFilterTabs = () => {
    if (!isDetailed) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.surahTabsRow}
      >
        {surahFilters.map((filter) => {
          const isActive = selectedSurahId === filter.id;
          const label =
            filter.id === "all"
              ? t("progressLogging.surahFilterAll")
              : filter.surahName;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.7}
              onPress={() => setDetailedSurahFilter(filter.id)}
              style={[
                styles.surahTab,
                isActive ? styles.surahTabActive : styles.surahTabInactive,
              ]}
            >
              <Text
                style={[
                  styles.surahTabText,
                  isActive && styles.surahTabTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderDetailedSummary = () => {
    if (
      selectedBarIndex !== null &&
      periodSlice.chartPeriods[selectedBarIndex]
    ) {
      const selectedPeriod = periodSlice.chartPeriods[selectedBarIndex];
      const percent = Math.min(
        100,
        Math.round(
          (selectedPeriod.completed /
            Math.max(selectedPeriod.completed + selectedPeriod.incomplete, 1)) *
            100,
        ),
      );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t("progressLogging.memorisationDetailedSummaryBar", {
            range: selectedPeriod.dateLabel,
            memorized: formatNumber(selectedPeriod.completed),
            surah:
              selectedSurahId === "all"
                ? t("progressLogging.memorisationAllSurahsTitle")
                : surahDisplayName,
            percent: formatNumber(percent),
          })}
        </Text>
      );
    }

    const summaryKey =
      period === "monthly"
        ? "progressLogging.memorisationDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.memorisationDetailedSummaryThreeMonths"
          : "progressLogging.memorisationDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          memorized: formatNumber(periodSlice.memorizedAyahs),
          total: formatNumber(periodSlice.totalAyahs),
          surah:
            selectedSurahId === "all"
              ? t("progressLogging.memorisationAllSurahsTitle")
              : surahDisplayName,
          delta: formatNumber(Math.abs(periodSlice.previousPeriodDeltaPercent)),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
        })}
      </Text>
    );
  };

  const renderInsights = () => {
    if (!isDetailed) return null;

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
            title={t("progressLogging.recitationInsightGoalTracked")}
            value={formatNumber(goalTrackedMonths)}
            subValue={t("progressLogging.recitationInsightMonths")}
            style={styles.insightCardFixed}
          />
          <InsightCard
            iconName="book-outline"
            title={t("progressLogging.memorisationInsightTotalMemorized")}
            value={formatNumber(totalMemorizedVerses)}
            subValue={t("progressLogging.memorisationInsightVersesMemorized")}
            style={styles.insightCardFixed}
          />
        </ScrollView>
      </View>
    );
  };
if (!isDetailed) {
    const selectedBar =
      selectedBarIndex !== null
        ? compactAchievement.chartData[selectedBarIndex]
        : null;
    const displayMemorized =
      selectedBar?.completedHours ?? compactAchievement.memorizedAyahs;
    const displayRemaining =
      selectedBar?.incompleteHours ?? compactAchievement.remainingAyahs;
    const compactShowNoDataDash =
      selectedBarIndex !== null &&
      isPastAchievementBarEmpty(displayMemorized, displayRemaining);
    const compactChartHint = !hintDismissed && selectedBarIndex === null;

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
          </View>

          <View style={styles.achievementRow}>
            <View style={styles.achievementBlock}>
              <Text style={styles.achievementCaption}>
                {t("progressLogging.memorisationCumulativeProgress")}
              </Text>
              <Text style={styles.achievementPercent}>
                {compactShowNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(compactAchievement.progressPercent)}
                <Text style={styles.achievementPercentSymbol}>%</Text>
              </Text>
              {compactAchievement.completed ? (
                <View style={styles.completedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={Colors.light.green}
                  />
                  <Text style={styles.completedBadgeText}>
                    {t("progressLogging.surahStatusCompleted")}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={styles.summaryText}>
            {t("progressLogging.memorisationCumulativeSummary", {
              memorized: formatNumber(compactAchievement.memorizedAyahs),
              total: formatNumber(compactAchievement.totalAyahs),
              surah: compactAchievement.surahName,
            })}
          </Text>

          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>
              {t("progressLogging.analyticsCompletedVsIncomplete")}
            </Text>
            <View style={styles.goalPillRow}>
              <Text style={styles.goalPillValue}>
                {compactShowNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(compactAchievement.totalAyahs)}{" "}
              </Text>
              <View style={styles.goalPill}>
                <Text style={styles.goalPillText}>
                  {t("progressLogging.unitAyahs")}
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
                {compactShowNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatMemorisationAyahLabel(displayMemorized)}
              </Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>
                {t("progressLogging.remaining")}
              </Text>
              <Text style={styles.statValueIncomplete}>
                {compactShowNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatMemorisationAyahLabel(displayRemaining)}
              </Text>
            </View>
          </View>

          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={compactAchievement.chartData}
              selectedBarIndex={selectedBarIndex}
              onBarPress={handleBarPressCompact}
              chartKey={`${goalId}-${selectedSurahId}-${refreshKey}`}
              yMax={compactAchievement.yMax}
              yTicks={compactAchievement.yTicks}
              showHint={compactChartHint}
              onDismissHint={() => setHintDismissed(true)}
              hintText={t("progressLogging.chartTapHint")}
              hintActionText={t("progressLogging.okGotIt")}
              pageCount={compactAchievement.chartData.length}
              activePageIndex={selectedBarIndex ?? 0}
              formatBarValue={chartFormatBarValue}
            />
          </View>
        </View>

        <PastAchievementStudyMaterial items={studyMaterial} showSeeAll={false} />
      </View>
    );
  }

  return (
    <View style={[styles.section, styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeaderBlock}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="trending-up"
              size={19}
              color={Colors.light.subtext}
            />
            <Text style={[styles.sectionTitle, styles.sectionTitleDetailed]}>
              {t("progressLogging.pastGoalAchievements")}
            </Text>
          </View>
          {isSurahDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.memorisationDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                surah: surahDisplayName,
              })}
            </Text>
          ) : null}
        </View>

        <View style={styles.topRow}>
          <View style={styles.achievementBlock}>
            <Text
              style={[
                styles.achievementCaption,
                styles.achievementCaptionDetailed,
              ]}
            >
              {t("progressLogging.achievementsLabel").toUpperCase()}
            </Text>
            <Text
              style={[
                styles.achievementPercent,
                styles.achievementPercentDetailed,
              ]}
            >
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatNumber(baseAchievement.achievementPercent)}
              <Text style={styles.achievementPercentSymbolDetailed}>%</Text>
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
                  size={24}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {baseAchievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {renderDetailedSummary()}
        {renderSurahFilterTabs()}

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>
            {t("progressLogging.memorisationGoalTotalLabel")}
          </Text>
          <View style={styles.goalPillRow}>
            <Text style={styles.goalPillValue}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatNumber(periodSlice.totalAyahs)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {t("progressLogging.unitAyahs")}
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

        <RecitationPastAchievementProgressSection
          analyticsView={analyticsView}
          completed={displayBaseCompleted}
          incomplete={displayBaseIncomplete}
          totalTimeMinutes={selectedPeriodTimeSpentMinutes}
          longestStreak={0}
          formatCount={formatStatCount}
          formatTimeChip={(minutes) =>
            showNoDataDash
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatMemorisationTimeSpentChip(minutes)
          }
          completedLabel={t("progressLogging.completed")}
          incompleteLabel={t("progressLogging.incomplete")}
          timeSpentLabel={t("progressLogging.timeSpentLabel")}
          streakLabel={t("progressLogging.daysLabel")}
          showStreak={false}
        />

        {isSurahDrillDown && !hasLogs ? (
          <View style={styles.emptyStateInline}>
            <Text style={styles.emptyStateText}>
              {t("progressLogging.memorisationNoDataForPeriod")}
            </Text>
          </View>
        ) : null}

        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={chartAchievement?.chartData ?? []}
            selectedBarIndex={selectedBarIndex}
            onBarPress={handleBarPressDetailed}
            chartKey={`${goalId}-${period}-${selectedSurahId}-${analyticsView}`}
            yMax={chartAchievement?.yMax ?? 10}
            yTicks={chartAchievement?.yTicks ?? [0, 5, 10]}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={chartAchievement?.pageCount ?? 1}
            activePageIndex={
              selectedBarIndex ?? chartAchievement?.activePageIndex ?? 0
            }
            formatBarValue={chartFormatBarValue}
            showPagination
            barColors={
              analyticsView === "completedVsTimeSpent"
                ? [Colors.light.green, Colors.light.green]
                : [Colors.light.green, Colors.light.warning]
            }
          />
        </View>

        <GraphBarSelectionFooter
          visible={selectedBarIndex !== null}
          completed={displayBaseCompleted}
          incomplete={displayBaseIncomplete}
          goalTotal={selectedBarGoalTotal}
          onClose={handleCloseBarSelection}
        />

        {progressRailRows.length > 0 ? (
          <View style={styles.progressRailSection}>
            {progressRailRows.map((row) => (
              <MemorisationSurahDetailCard
                key={`memorisation-rail-${row.surahId}`}
                row={row}
                analyticsView={analyticsView}
                formatTimeChip={formatMemorisationTimeSpentChip}
              />
            ))}
          </View>
        ) : null}
      </View>

      {renderInsights()}
    </View>
  );
}

export function QuranMemorisationPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod,
  initialAnalyticsView,
  initialSurahId,
  initialHizbId,
}: Props) {
  if (isHizbMemorisationGoalId(goalId)) {
    return (
      <HizbMemorisationPastAchievements
        goalId={goalId}
        isDetailed={isDetailed}
        initialPeriod={initialPeriod}
        initialAnalyticsView={initialAnalyticsView}
        initialHizbId={initialHizbId}
      />
    );
  }

  if (isSurahMemorisationGoalId(goalId)) {
    return (
      <SurahMemorisationPastAchievements
        goalId={goalId}
        isDetailed={isDetailed}
        initialPeriod={initialPeriod}
        initialAnalyticsView={initialAnalyticsView}
        initialSurahId={initialSurahId}
      />
    );
  }

  return null;
}
