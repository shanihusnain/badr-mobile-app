import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  AchivementArrowIcon,
  NegativeProgressIcon,
  PositiveProgressIcon,
} from "@/assets/icons";
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
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import type { CompletionGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { useGetQuranGoalAchievements } from "@/src/api/queries/useGetQuranGoalAchievements";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import { shiftPrayerAchievementsPeriodStart } from "@/src/utils/prayerGoalAchievementsMap";
import { mapQuranApiKeyInsightsToCards } from "@/src/utils/quranHoursGoalAchievementsMap";
import {
  createEmptyRecitationCompletionAchievements,
  getRecitationCompletionTargetFromDetail,
  mapRecitationCompletionAchievementsToUi,
} from "@/src/utils/quranRecitationCompletionAchievementsMap";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { RecitationCompletionDetailCard } from "../QuranHoursPastAchievements/RecitationCompletionDetailCard";
import { InsightCard } from "../InsightCard";
import { memorisationPastAchievementStyles as styles } from "../QuranMemorisationPastAchievements/memorisationPastAchievementsStyles";
import {
  InsightCardFlashIcon,
  InsightCardGoalTrackedIcon,
  InsightCardGoodDayIcon,
  InsightCardTickIcon,
  InsightCardTimeSpentIcon,
  InsightCardWeeklyAverageIcon,
} from "@/assets/icons";

const QURAN_INSIGHT_ICON_SIZE = 14;
const LOADING_DASH = "---";

const PERIOD_INSIGHT_SUBTITLE: Record<PastAchievementPeriod, string> = {
  monthly: "VS. LAST MONTH",
  threeMonths: "VS. LAST 3 MONTHS",
  sixMonths: "VS. LAST 6 MONTHS",
};

function getCompletionInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (
    name === "checkmark-circle-outline" ||
    title.includes("COMPLETED") ||
    title.includes("RECITED")
  ) {
    return <InsightCardTickIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "flash" || title.includes("STREAK")) {
    return <InsightCardFlashIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "sparkles" || title.includes("BEST")) {
    return <InsightCardGoodDayIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "scale-balance" || title.includes("AVERAGE")) {
    return <InsightCardWeeklyAverageIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (
    name === "time-outline" ||
    title.includes("TIME") ||
    name === "book-outline"
  ) {
    return <InsightCardTimeSpentIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  return undefined;
}

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
  sixMonths: "progressLogging.previousSixMonthsShort",
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
  const { width } = useWindowDimensions();
  const formatNumber = useLocaleNumber();
  const insightCardStyle = {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    width: width * 0.42,
    maxWidth: width * 0.42,
    minWidth: width * 0.42,
  };
  const [period, setPeriodState] = useState<PastAchievementPeriod>(initialPeriod);
  const setPeriod = useCallback((next: PastAchievementPeriod) => {
    setPeriodState(next);
    setPeriodStartParam(null);
  }, []);
  const [periodStartParam, setPeriodStartParam] = useState<string | null>(null);
  const [analyticsView, setAnalyticsView] = useState<CompletionAnalyticsView>(
    initialAnalyticsView,
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const usesAchievementsApi = quranGoalType === "RECITATION_COMPLETION";

  const { data: completionGoalDetail } = useGetQuranGoalByType(
    usesAchievementsApi ? "RECITATION_COMPLETION" : null,
  );

  const achievementsChartParam =
    isDetailed && analyticsView === "completedVsTimeSpent"
      ? "COMPLETED_VS_TIME"
      : null;

  const { data: achievementsApiData, isLoading: isAchievementsLoading } =
    useGetQuranGoalAchievements(quranGoalType, {
      period,
      periodStart: periodStartParam,
      chart: achievementsChartParam,
      enabled: usesAchievementsApi && !!quranGoalType,
    });

  const showPlaceholders =
    usesAchievementsApi && (!achievementsApiData || isAchievementsLoading);

  const defaultTargetCompletions = useMemo(
    () => getRecitationCompletionTargetFromDetail(completionGoalDetail),
    [completionGoalDetail],
  );

  const mappedApi = useMemo(() => {
    if (!usesAchievementsApi) return null;
    if (!achievementsApiData) {
      return createEmptyRecitationCompletionAchievements(
        period,
        defaultTargetCompletions,
      );
    }
    return mapRecitationCompletionAchievementsToUi(
      achievementsApiData,
      period,
      { detail: completionGoalDetail },
    );
  }, [
    achievementsApiData,
    completionGoalDetail,
    defaultTargetCompletions,
    period,
    usesAchievementsApi,
  ]);

  const periodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.slice;
    return getQuranCompletionPastAchievementSlice(period);
  }, [mappedApi, period, usesAchievementsApi]);

  const canNavigateBack = usesAchievementsApi
    ? Boolean(mappedApi?.achievement.canNavigateBack)
    : false;
  const canNavigateForward = usesAchievementsApi
    ? Boolean(mappedApi?.achievement.canNavigateForward)
    : false;

  const keyInsightsHeader = mappedApi?.achievement.keyInsightsHeader ?? null;

  const apiInsightCards = useMemo(() => {
    if (!usesAchievementsApi) return [];
    return mapQuranApiKeyInsightsToCards(achievementsApiData, {
      period,
      noDataLabel: t("progressLogging.insightNoData"),
      isLoading: showPlaceholders,
    });
  }, [achievementsApiData, period, showPlaceholders, t, usesAchievementsApi]);

  const handlePreviousPeriod = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData || !canNavigateBack) return;
    if (!achievementsApiData.periodStart || !achievementsApiData.periodEnd) return;
    setPeriodStartParam(
      shiftPrayerAchievementsPeriodStart(
        achievementsApiData.periodStart,
        achievementsApiData.periodEnd,
        -1,
      ),
    );
  }, [achievementsApiData, canNavigateBack, usesAchievementsApi]);

  const handleNextPeriod = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData || !canNavigateForward)
      return;
    if (!achievementsApiData.periodStart || !achievementsApiData.periodEnd) return;
    setPeriodStartParam(
      shiftPrayerAchievementsPeriodStart(
        achievementsApiData.periodStart,
        achievementsApiData.periodEnd,
        1,
      ),
    );
  }, [achievementsApiData, canNavigateForward, usesAchievementsApi]);

  const baseAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.achievement;
    return getQuranCompletionPastAchievement(period);
  }, [mappedApi, period, usesAchievementsApi]);

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

  const totalTimeSpentMinutes = useMemo(() => {
    const fromBuckets = getTotalCompletionTimeSpentMinutes(timeSpentByPeriod);
    if (fromBuckets > 0) return fromBuckets;
    if (usesAchievementsApi) {
      const fromTotals = achievementsApiData?.totals?.timeSpentMinutes;
      if (typeof fromTotals === "number" && Number.isFinite(fromTotals)) {
        return Math.max(0, fromTotals);
      }
    }
    return fromBuckets;
  }, [
    achievementsApiData?.totals?.timeSpentMinutes,
    timeSpentByPeriod,
    usesAchievementsApi,
  ]);

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
  }, [period, goalId, analyticsView, periodStartParam]);

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

  const hasLogs = (baseAchievement.chartData ?? []).some(
    (item) =>
      (item.completedHours ?? 0) > 0 || (item.incompleteHours ?? 0) > 0,
  );

  const showNoDataDash =
    showPlaceholders ||
    !hasLogs ||
    isPastAchievementBarEmpty(displayBaseCompleted, displayBaseIncomplete);

  const showDeltaChip =
    !showPlaceholders &&
    !showNoDataDash &&
    Math.abs(baseAchievement.previousPeriodDeltaPercent) > 0;

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
    isDetailed &&
    !hintDismissed &&
    selectedBarIndex === null &&
    !showPlaceholders;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const showDetailedStatsChevron = useMemo(() => {
    if (isDetailed || showPlaceholders || showNoDataDash) return false;
    if ((achievement.achievementPercent ?? 0) > 0) return true;
    return (chartAchievement?.chartData ?? []).some(
      (item) => (item.completedHours ?? 0) > 0,
    );
  }, [
    achievement.achievementPercent,
    chartAchievement?.chartData,
    isDetailed,
    showNoDataDash,
    showPlaceholders,
  ]);

  const renderPeriodToggle = () => (
    <View style={styles.periodToggleListening}>
      {PERIODS.map((item) => {
        const isActive = period === item;
        return (
          <Pressable
            key={item}
            onPress={() => setPeriod(item)}
            style={[
              styles.periodButtonListening,
              isActive
                ? styles.periodButtonActive
                : styles.periodButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.periodButtonTextListening,
                isActive && styles.periodButtonTextActive,
              ]}
            >
              {t(PERIOD_LABEL_KEYS[item])}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderDateNav = () => (
    <View style={styles.dateNavRow}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.navBtn,
          (!canNavigateBack || showPlaceholders) && localStyles.navBtnDisabled,
        ]}
        disabled={!canNavigateBack || showPlaceholders}
        onPress={handlePreviousPeriod}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={
            canNavigateBack && !showPlaceholders
              ? Colors.light.dullWhite
              : Colors.light.subtext
          }
        />
      </TouchableOpacity>
      <Text style={styles.dateRange} numberOfLines={1} ellipsizeMode="tail">
        {showPlaceholders && !achievement.dateRangeLabel
          ? LOADING_DASH
          : achievement.dateRangeLabel || LOADING_DASH}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.navBtn,
          (!canNavigateForward || showPlaceholders) &&
            localStyles.navBtnDisabled,
        ]}
        disabled={!canNavigateForward || showPlaceholders}
        onPress={handleNextPeriod}
      >
        <Ionicons
          name="chevron-forward"
          size={24}
          color={
            canNavigateForward && !showPlaceholders
              ? Colors.light.dullWhite
              : Colors.light.subtext
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderAnalyticsToggle = () => (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.analyticsToggleScroll}
      contentContainerStyle={styles.analyticsToggle}
    >
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
    </ScrollView>
  );

  const renderCompletedIncompleteStats = (noData: boolean) => (
    <View style={styles.statsRow}>
      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>{t("progressLogging.completed")}</Text>
        <Text style={styles.statValueCompleted}>
          {noData
            ? PAST_ACHIEVEMENT_NO_DATA
            : formatCompletionCountLabel(displayBaseCompleted)}
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
              ? styles.statValueCompleted
              : styles.statValueIncomplete
          }
        >
          {analyticsView === "completedVsTimeSpent"
            ? noData
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatCompletionTimeSpentLabel(selectedPeriodTimeSpentMinutes)
            : noData
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatCompletionCountLabel(displayBaseIncomplete)}
        </Text>
      </View>
    </View>
  );

  const renderAchievementHeader = () => (
    <>
      <View style={styles.achievementPeriodRow}>
        <View style={styles.achievementBlockCompact}>
          <Text style={styles.achievementCaptionCompact}>
            {t("progressLogging.achievementsLabel").toUpperCase()}
          </Text>
          <View style={styles.achievementPercentRow}>
            <Text style={styles.achievementPercentCompact}>
              {showPlaceholders
                ? LOADING_DASH
                : showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(baseAchievement.achievementPercent)}
            </Text>
            {!showPlaceholders && !showNoDataDash ? (
              <Text style={styles.achievementPercentSymbolCompact}>%</Text>
            ) : null}
          </View>
        </View>
        {renderPeriodToggle()}
      </View>

      <View style={styles.deltaDateRow}>
        <View style={styles.deltaSlot}>
          {showDeltaChip ? (
            <View style={styles.deltaBadgeCompact}>
              {deltaIsPositive ? (
                <PositiveProgressIcon />
              ) : (
                <NegativeProgressIcon />
              )}
              <Text style={styles.deltaTextCompact} numberOfLines={1}>
                {`${formatNumber(Math.abs(baseAchievement.previousPeriodDeltaPercent))}% ${t(PERIOD_DELTA_LABEL_KEYS[period])}`}
              </Text>
            </View>
          ) : (
            <View style={styles.deltaBadgePlaceholder} />
          )}
        </View>
        <View style={styles.periodNavUnderToggle}>{renderDateNav()}</View>
      </View>
    </>
  );

  const renderGoalHeader = () => (
    <View style={styles.goalHeader}>
      <Text style={styles.goalLabel}>
        {isDetailed
          ? t("progressLogging.recitationGoalTotalLabel")
          : t("progressLogging.goal")}
      </Text>
      {isDetailed ? (
        <View style={localStyles.goalValueRow}>
          <Text style={styles.goalPillValue}>
            {showNoDataDash
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatNumber(displayGoalTotal)}
          </Text>
          <View style={styles.goalPill}>
            <Text style={styles.goalPillText}>
              {t("progressLogging.unitCompletions")}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.goalPillRow}>
          <Text style={styles.goalPillValue}>
            {showNoDataDash
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatNumber(displayGoalTotal)}{" "}
          </Text>
          <View style={styles.goalPill}>
            <Text style={styles.goalPillText}>
              {t("progressLogging.unitCompletions")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderInsights = () => {
    if (!isDetailed) return null;

    const insightCards =
      usesAchievementsApi && apiInsightCards.length > 0
        ? apiInsightCards
        : null;

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>
            {keyInsightsHeader?.trim() || PERIOD_INSIGHT_SUBTITLE[period]}
          </Text>
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          {insightCards ? (
            insightCards.map((card) => (
              <InsightCard
                key={`${card.title}-${card.value}`}
                iconName={card.iconName}
                iconFamily={card.iconFamily}
                icon={getCompletionInsightIcon(card)}
                title={card.title}
                value={card.value}
                subValue={card.subValue}
                style={insightCardStyle}
              />
            ))
          ) : (
            <>
              <InsightCard
                iconName="checkmark-circle-outline"
                icon={<InsightCardTickIcon size={QURAN_INSIGHT_ICON_SIZE} />}
                title={t("progressLogging.completed")}
                value={
                  showPlaceholders
                    ? LOADING_DASH
                    : formatNumber(baseAchievement.completedHours)
                }
                subValue={t("progressLogging.unitCompletions")}
                style={insightCardStyle}
              />
              <InsightCard
                iconName="time-outline"
                icon={
                  <InsightCardTimeSpentIcon size={QURAN_INSIGHT_ICON_SIZE} />
                }
                title={t("progressLogging.timeSpentLabel")}
                value={
                  showPlaceholders
                    ? LOADING_DASH
                    : formatCompletionTimeSpentLabel(totalTimeSpentMinutes)
                }
                style={insightCardStyle}
              />
            </>
          )}
        </ScrollView>
      </View>
    );
  };

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
            <AchivementArrowIcon size={15} color={Colors.light.subtext} />
            <Text
              style={[
                styles.sectionTitle,
                isDetailed && styles.sectionTitleDetailed,
              ]}
            >
              {t("progressLogging.pastGoalAchievements")}
            </Text>
            {!isDetailed && showDetailedStatsChevron ? (
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

        {renderAchievementHeader()}

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

        {renderGoalHeader()}
        {renderAnalyticsToggle()}
        {renderCompletedIncompleteStats(showPlaceholders || showNoDataDash)}

        {isDetailed && !hasLogs && !showPlaceholders ? (
          <View style={styles.emptyStateInline}>
            <Text style={styles.emptyStateText}>
              {t("progressLogging.recitationNoDataForPeriod")}
            </Text>
          </View>
        ) : null}

        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={
              showPlaceholders && !(chartAchievement?.chartData?.length)
                ? []
                : (chartAchievement?.chartData ?? [])
            }
            selectedBarIndex={
              isDetailed && !showPlaceholders && !showNoDataDash
                ? selectedBarIndex
                : null
            }
            onBarPress={isDetailed ? handleBarPressDetailed : () => {}}
            chartKey={`${goalId}-${period}-${analyticsView}-${periodStartParam ?? "latest"}-${showPlaceholders ? "loading" : "ready"}`}
            yMax={chartAchievement?.yMax ?? 10}
            yTicks={chartAchievement?.yTicks ?? [0, 5, 10]}
            showHint={showChartHint && !showNoDataDash}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={
              chartAchievement?.pageCount ??
              chartAchievement?.chartData?.length ??
              1
            }
            activePageIndex={
              isDetailed
                ? (selectedBarIndex ?? chartAchievement?.activePageIndex ?? 0)
                : 0
            }
            formatBarValue={chartFormatBarValue}
            showPagination={!showNoDataDash}
            barColors={
              analyticsView === "completedVsTimeSpent"
                ? [Colors.light.green, Colors.light.green]
                : [Colors.light.green, Colors.light.warning]
            }
          />
        </View>

        {isDetailed ? (
          <GraphBarSelectionFooter
            visible={selectedBarIndex !== null && !showPlaceholders}
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

      {renderInsights()}
    </View>
  );
}

const localStyles = StyleSheet.create({
  navBtnDisabled: {
    opacity: 0.4,
  },
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
