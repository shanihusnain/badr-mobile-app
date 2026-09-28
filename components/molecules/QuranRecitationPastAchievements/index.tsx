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
  InsightCardFlashIcon,
  InsightCardGoalTrackedIcon,
  InsightCardGoodDayIcon,
  InsightCardTickIcon,
  InsightCardTimeSpentIcon,
  InsightCardWeeklyAverageIcon,
  NegativeProgressIcon,
  PositiveProgressIcon,
} from "@/assets/icons";
import {
  applyTimeSpentOnlyGreenChart,
  applyRecitationAnalyticsView,
  achievementFromPeriodSlice,
  formatGoalRecitationsLabel,
  formatRecitationTimeSpentLabel,
  formatRecitationTimeSpentChip,
  getQuranRecitationPastAchievement,
  getQuranRecitationPastAchievementSlice,
  getPastAchievementSurahFilters,
  getRecitationGoalTrackedMonths,
  getRecitationSurahBreakdownRows,
  getRecitationGoalSummarySegments,
  getRecitationSurahDetailRow,
  getRecitationSurahGoalTrackedMonths,
  getRecitationWeeklyAverage,
  getTotalTimeSpentMinutes,
  hasRecitationPastAchievementLogs,
  zeroOutPeriodSlice,
  type RecitationAnalyticsView,
  type SurahFilterId,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { SurahRecitationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationTarget";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  getActiveRecitationSurahGoal,
  useOptionalRecitationSurahContext,
} from "@/src/screens/private/goalprogressloggingscreen/recitationSurahContext";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import { useGetQuranGoalAchievements } from "@/src/api/queries/useGetQuranGoalAchievements";
import {
  buildMemorisationSurahAchievementFilters,
  createEmptyMemorisationSurahAchievements,
  mapMemorisationSurahAchievementsToUi,
} from "@/src/utils/quranMemorisationSurahAchievementsMap";
import { mapQuranApiKeyInsightsToCards } from "@/src/utils/quranHoursGoalAchievementsMap";
import type { SurahMemorisationGoal } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahGoals";
import { RecitationSurahBreakdownList } from "../QuranHoursPastAchievements/RecitationSurahBreakdownList";
import { RecitationSurahDetailCard } from "../QuranHoursPastAchievements/RecitationSurahDetailCard";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { InsightCard } from "../InsightCard";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { TopSpace } from "@/components/atoms/TopSpace";
import { memorisationPastAchievementStyles as styles } from "../QuranMemorisationPastAchievements/memorisationPastAchievementsStyles";

export type QuranRecitationPastAchievementsProps = {
  goalId: SurahRecitationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: RecitationAnalyticsView;
  initialSurahId?: string;
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

const UNIT_LABEL_KEY = "progressLogging.unitRecitations";

const ANALYTICS_VIEWS: RecitationAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTimeSpent",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<RecitationAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
};


const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonths",
  sixMonths: "progressLogging.previousSixMonths",
};

const PERIOD_INSIGHT_SUBTITLE: Record<PastAchievementPeriod, string> = {
  monthly: "VS. LAST MONTH",
  threeMonths: "VS. LAST 3 MONTHS",
  sixMonths: "VS. LAST 6 MONTHS",
};

const LOADING_DASH = "---";
const QURAN_INSIGHT_ICON_SIZE = 14;

function getRecitationInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (
    name === "checkmark-circle-outline" ||
    title.includes("COMPLETED") ||
    title.includes("ACTIVE")
  ) {
    return <InsightCardTickIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "flash" || title.includes("STREAK")) {
    return <InsightCardFlashIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "sparkles" || title.includes("BEST")) {
    return <InsightCardGoodDayIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (
    name === "scale-balance" ||
    name === "stats-chart-outline" ||
    title.includes("AVERAGE")
  ) {
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

export function QuranRecitationPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
  initialSurahId,
}: QuranRecitationPastAchievementsProps) {
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
  const surahContext = useOptionalRecitationSurahContext();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [analyticsView, setAnalyticsView] =
    useState<RecitationAnalyticsView>(initialAnalyticsView);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const usesAchievementsApi = quranGoalType === "RECITATION_SURAH";
  const contextGoals = surahContext?.goals ?? [];

  const memorisationShapedGoals = useMemo((): SurahMemorisationGoal[] => {
    return contextGoals.map((goal) => {
      const parsedId = Number(goal.id);
      return {
        id: goal.id,
        itemNumber:
          goal.itemNumber != null && goal.itemNumber > 0
            ? goal.itemNumber
            : Number.isFinite(parsedId)
              ? parsedId
              : 0,
        surahName: goal.surahName,
        totalAyahs: goal.cycleTotal,
        memorizedAyahs: goal.loggedRecitations,
        progressPercentage: goal.achievementPercent ?? 0,
        completed: goal.completed === true || goal.status === "achieved",
        status:
          goal.status === "achieved"
            ? "completed"
            : goal.status === "in-progress"
              ? "in-progress"
              : "not-started",
      };
    });
  }, [contextGoals]);

  const surahFilters = useMemo(() => {
    if (memorisationShapedGoals.length > 0) {
      return buildMemorisationSurahAchievementFilters(memorisationShapedGoals);
    }
    return getPastAchievementSurahFilters(goalId);
  }, [goalId, memorisationShapedGoals, surahContext?.refreshKey]);

  const [detailedSurahFilter, setDetailedSurahFilter] = useState<SurahFilterId>(
    () => initialSurahId ?? "all",
  );

  const selectedSurahId: SurahFilterId = isDetailed
    ? detailedSurahFilter
    : (surahContext?.activeSurahId ?? initialSurahId ?? "all");
  const refreshKey = surahContext?.refreshKey ?? 0;
  const surahGoal =
    contextGoals.find((goal) => goal.id === selectedSurahId) ??
    getActiveRecitationSurahGoal(selectedSurahId);
  const surahDisplayName =
    surahGoal?.surahName ??
    surahFilters.find((filter) => filter.id === selectedSurahId)?.surahName ??
    "";

  const isSurahDrillDown = isDetailed && selectedSurahId !== "all";

  const selectedItemNumber = useMemo(() => {
    if (selectedSurahId === "all") return null;
    const fromGoal = contextGoals.find((goal) => goal.id === selectedSurahId)
      ?.itemNumber;
    if (fromGoal != null && Number.isFinite(fromGoal)) return fromGoal;
    const fromId = Number(selectedSurahId);
    return Number.isFinite(fromId) && fromId > 0 ? fromId : null;
  }, [contextGoals, selectedSurahId]);

  const achievementsChartParam =
    isDetailed && analyticsView === "completedVsTimeSpent"
      ? "COMPLETED_VS_TIME"
      : null;

  const { data: achievementsApiData, isLoading: isAchievementsLoading } =
    useGetQuranGoalAchievements(quranGoalType, {
      period,
      itemNumber: selectedItemNumber,
      chart: achievementsChartParam,
      enabled: usesAchievementsApi && !!quranGoalType,
    });

  const showPlaceholders =
    usesAchievementsApi && (!achievementsApiData || isAchievementsLoading);

  const mappedApi = useMemo(() => {
    if (!usesAchievementsApi) return null;
    if (!achievementsApiData) {
      return createEmptyMemorisationSurahAchievements(
        selectedSurahId,
        surahDisplayName || "All Surahs",
      );
    }
    return mapMemorisationSurahAchievementsToUi(achievementsApiData, period, {
      surahId: selectedSurahId,
      surahName: surahDisplayName || "All Surahs",
      goals: memorisationShapedGoals,
    });
  }, [
    achievementsApiData,
    memorisationShapedGoals,
    period,
    selectedSurahId,
    surahDisplayName,
    usesAchievementsApi,
  ]);

  const periodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) {
      return {
        chartPeriods: mappedApi.slice.chartPeriods,
        goalTotal: mappedApi.slice.totalAyahs,
        achievementPercent: mappedApi.slice.achievementPercent,
        previousPeriodDeltaPercent: mappedApi.slice.previousPeriodDeltaPercent,
        activeDays: mappedApi.achievement.activeDays,
        activeDaysPrevious: mappedApi.achievement.activeDaysPrevious,
        longestStreak: mappedApi.achievement.longestStreak,
        longestStreakPrevious: mappedApi.achievement.longestStreakPrevious,
        dateRangeLabel: mappedApi.slice.dateRangeLabel,
        pageCount: mappedApi.slice.pageCount,
        activePageIndex: mappedApi.slice.activePageIndex,
      };
    }
    return getQuranRecitationPastAchievementSlice(
      goalId,
      period,
      selectedSurahId,
    );
  }, [
    goalId,
    mappedApi,
    period,
    refreshKey,
    selectedSurahId,
    usesAchievementsApi,
  ]);

  const hasLogs = useMemo(() => {
    if (usesAchievementsApi && mappedApi) {
      return mappedApi.slice.chartPeriods.some(
        (item) => item.completed > 0 || item.incomplete > 0,
      );
    }
    return hasRecitationPastAchievementLogs(periodSlice);
  }, [mappedApi, periodSlice, usesAchievementsApi]);

  const displaySlice = useMemo(
    () =>
      isSurahDrillDown && !hasLogs
        ? zeroOutPeriodSlice(periodSlice)
        : periodSlice,
    [hasLogs, isSurahDrillDown, periodSlice],
  );

  const baseAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) {
      return mappedApi.achievement;
    }
    return getQuranRecitationPastAchievement(goalId, period, selectedSurahId);
  }, [
    goalId,
    mappedApi,
    period,
    refreshKey,
    selectedSurahId,
    usesAchievementsApi,
  ]);

  const chartBaseAchievement = useMemo(
    () =>
      isSurahDrillDown && !hasLogs
        ? achievementFromPeriodSlice(displaySlice)
        : baseAchievement,
    [baseAchievement, displaySlice, hasLogs, isSurahDrillDown],
  );

  const timeSpentByPeriod = useMemo(
    () =>
      displaySlice.chartPeriods.map(
        (periodItem) => periodItem.timeSpentMinutes,
      ),
    [displaySlice],
  );

  const achievement = useMemo(
    () =>
      applyRecitationAnalyticsView(
        baseAchievement,
        timeSpentByPeriod,
        analyticsView,
      ),
    [analyticsView, baseAchievement, timeSpentByPeriod],
  );

  const chartAchievement = useMemo(() => {
    if (isDetailed && analyticsView === "completedVsTimeSpent") {
      return applyTimeSpentOnlyGreenChart(
        chartBaseAchievement,
        timeSpentByPeriod,
      );
    }
    return isSurahDrillDown && !hasLogs
      ? applyRecitationAnalyticsView(
          chartBaseAchievement,
          timeSpentByPeriod,
          analyticsView,
        )
      : achievement;
  }, [
    achievement,
    analyticsView,
    chartBaseAchievement,
    hasLogs,
    isDetailed,
    isSurahDrillDown,
    timeSpentByPeriod,
  ]);

  const chartFormatBarValue = useMemo(() => {
    if (isDetailed && analyticsView === "completedVsTimeSpent") {
      return (hours: number) =>
        formatRecitationTimeSpentChip(Math.round(hours * 60));
    }
    return formatGoalRecitationsLabel;
  }, [analyticsView, isDetailed]);

  const surahBreakdownRows = useMemo(() => {
    if (!isDetailed || selectedSurahId !== "all") {
      return [];
    }

    return getRecitationSurahBreakdownRows(goalId, period, selectedBarIndex);
  }, [goalId, isDetailed, period, selectedBarIndex, selectedSurahId]);

  const weeklyAverage = useMemo(
    () => getRecitationWeeklyAverage(goalId, period, selectedSurahId),
    [goalId, period, selectedSurahId],
  );

  const goalTrackedMonths = getRecitationGoalTrackedMonths(period);
  const surahGoalTrackedMonths =
    getRecitationSurahGoalTrackedMonths(periodSlice);

  const surahDetailRow = useMemo(() => {
    if (!isSurahDrillDown) {
      return null;
    }

    return getRecitationSurahDetailRow(goalId, period, selectedSurahId);
  }, [goalId, isSurahDrillDown, period, selectedSurahId]);

  const weeklyPeriodGoal = useMemo(
    () =>
      Math.round(
        periodSlice.goalTotal / Math.max(periodSlice.chartPeriods.length, 1),
      ),
    [periodSlice],
  );

  const selectedChartPeriod =
    selectedBarIndex !== null
      ? displaySlice.chartPeriods[selectedBarIndex]
      : null;

  const selectedBaseWeek =
    selectedBarIndex !== null
      ? chartBaseAchievement.chartData[selectedBarIndex]
      : null;

  const displayBaseCompleted = selectedBaseWeek
    ? selectedBaseWeek.completedHours
    : hasLogs
      ? baseAchievement.completedHours
      : 0;
  const displayBaseIncomplete = selectedBaseWeek
    ? selectedBaseWeek.incompleteHours
    : hasLogs
      ? baseAchievement.incompleteHours
      : 0;

  const displayGoalTotal = useMemo(() => {
    if (!isSurahDrillDown) {
      return periodSlice.goalTotal;
    }

    if (period === "monthly" && selectedBarIndex !== null) {
      return weeklyPeriodGoal;
    }

    return periodSlice.goalTotal;
  }, [
    isSurahDrillDown,
    period,
    periodSlice.goalTotal,
    selectedBarIndex,
    weeklyPeriodGoal,
  ]);

  const goalSummarySegments = useMemo(() => {
    if (!isSurahDrillDown) {
      return [];
    }

    const goalTotal = displayGoalTotal;
    return getRecitationGoalSummarySegments(
      displayBaseCompleted,
      displayBaseIncomplete,
      goalTotal,
    );
  }, [
    displayBaseCompleted,
    displayBaseIncomplete,
    displayGoalTotal,
    isSurahDrillDown,
  ]);

  const effectiveDetailRow = useMemo(() => {
    if (!surahDetailRow) {
      return null;
    }

    if (selectedBarIndex === null || !selectedChartPeriod) {
      return surahDetailRow;
    }

    const periodTarget =
      period === "monthly"
        ? weeklyPeriodGoal
        : selectedChartPeriod.completed + selectedChartPeriod.incomplete;

    return {
      ...surahDetailRow,
      completed: selectedChartPeriod.completed,
      target: Math.max(periodTarget, selectedChartPeriod.completed),
      isCompleted:
        selectedChartPeriod.completed >=
        (period === "monthly" ? weeklyPeriodGoal : periodTarget),
    };
  }, [
    period,
    selectedBarIndex,
    selectedChartPeriod,
    surahDetailRow,
    weeklyPeriodGoal,
  ]);

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

    return displayGoalTotal;
  }, [
    displayBaseCompleted,
    displayBaseIncomplete,
    displayGoalTotal,
    selectedBarIndex,
    selectedBaseWeek,
  ]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const selectedPeriodTimeSpentMinutes =
    selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  useEffect(() => {
    if (isDetailed && initialSurahId) {
      setDetailedSurahFilter(initialSurahId);
    }
  }, [initialSurahId, isDetailed]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, selectedSurahId, analyticsView]);

  const handleBarPress = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex(index);
  }, []);

  const handleCloseBarSelection = useCallback(() => {
    setSelectedBarIndex(null);
  }, []);

  const showNoDataDash =
    showPlaceholders ||
    !hasLogs ||
    isPastAchievementBarEmpty(displayBaseCompleted, displayBaseIncomplete);

  const formatStatCount = (value: number) =>
    showNoDataDash
      ? PAST_ACHIEVEMENT_NO_DATA
      : formatGoalRecitationsLabel(value);

  const showChartHint =
    isDetailed &&
    !hintDismissed &&
    selectedBarIndex === null &&
    !showPlaceholders;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const showDeltaChip =
    !showPlaceholders &&
    !showNoDataDash &&
    Math.abs(baseAchievement.previousPeriodDeltaPercent) > 0;

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

  const keyInsightsHeader =
    typeof mappedApi?.achievement?.keyInsightsHeader === "string"
      ? mappedApi.achievement.keyInsightsHeader
      : null;

  const apiInsightCards = useMemo(() => {
    if (!usesAchievementsApi) return [];
    return mapQuranApiKeyInsightsToCards(achievementsApiData, {
      period,
      noDataLabel: t("progressLogging.insightNoData"),
      isLoading: showPlaceholders,
    });
  }, [
    achievementsApiData,
    period,
    showPlaceholders,
    t,
    usesAchievementsApi,
  ]);

  const surahGoalLabelKey =
    isSurahDrillDown && period === "monthly" && selectedBarIndex !== null
      ? "progressLogging.goal"
      : "progressLogging.recitationGoalTotalLabel";

  const surahGoalUnitKey =
    isSurahDrillDown && period === "monthly" && selectedBarIndex !== null
      ? "progressLogging.recitationGoalWeeklyUnit"
      : null;

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        analyticsView,
        goalCategory: "surah",
        goalType: "quran_recitation",
        recitationType: "surah",
        selectedSurahId:
          selectedSurahId === "all" ? undefined : selectedSurahId,
      },
    });
  }, [analyticsView, goalId, period, router, selectedSurahId]);

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
      <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
        <Ionicons
          name="chevron-back"
          size={24}
          color={Colors.light.dullWhite}
        />
      </TouchableOpacity>
      <Text style={styles.dateRange} numberOfLines={1} ellipsizeMode="tail">
        {showPlaceholders && !achievement.dateRangeLabel
          ? LOADING_DASH
          : achievement.dateRangeLabel || LOADING_DASH}
      </Text>
      <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.light.dullWhite}
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
          {noData ? PAST_ACHIEVEMENT_NO_DATA : formatStatCount(displayBaseCompleted)}
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
              : formatRecitationTimeSpentLabel(selectedPeriodTimeSpentMinutes)
            : noData
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatStatCount(displayBaseIncomplete)}
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
            {!showPlaceholders ? (
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
          ? isSurahDrillDown
            ? t(surahGoalLabelKey)
            : t("progressLogging.recitationGoalTotalLabel")
          : t("progressLogging.goal")}
      </Text>
      {isDetailed ? (
        <View
          style={[
            localStyles.goalValueRow,
            isSurahDrillDown && localStyles.goalValueRowDrillDown,
          ]}
        >
          <View style={localStyles.goalValueBlock}>
            <Text style={styles.goalPillValue}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatNumber(displayGoalTotal)}
            </Text>
            {selectedSurahId === "all" ? (
              <View style={styles.goalPill}>
                <Text style={styles.goalPillText}>{t(UNIT_LABEL_KEY)}</Text>
              </View>
            ) : surahGoalUnitKey ? (
              <View style={styles.goalPill}>
                <Text style={styles.goalPillText}>{t(surahGoalUnitKey)}</Text>
              </View>
            ) : null}
          </View>
          {isSurahDrillDown ? (
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>recitations</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.goalPillRow}>
          <Text style={styles.goalPillValue}>
            {showNoDataDash
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatNumber(baseAchievement.goalHours)}{" "}
          </Text>
          <View style={styles.goalPill}>
            <Text style={styles.goalPillText}>{t(UNIT_LABEL_KEY)}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderSurahFilterTabs = () => {
    if (!isDetailed) {
      return null;
    }

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

  const renderInsights = () => {
    if (usesAchievementsApi) {
      if (!apiInsightCards.length) return null;

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
            {apiInsightCards.map((card, index) => (
              <InsightCard
                key={`${card.title}-${index}`}
                {...card}
                icon={getRecitationInsightIcon(card)}
                style={insightCardStyle}
              />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (!isDetailed) return null;

    const insightCards = isSurahDrillDown
      ? period === "monthly"
        ? [
            {
              iconName: "checkmark-circle-outline",
              title: t("progressLogging.recitationInsightActiveDaysTitle"),
              value: formatNumber(periodSlice.activeDays),
              subValue: t("progressLogging.recitationInsightActiveDays"),
            },
            {
              iconName: "stats-chart-outline",
              title: t("progressLogging.recitationInsightRecitations"),
              value: formatNumber(displayBaseCompleted),
              subValue: t("progressLogging.unitRecitations"),
            },
          ]
        : period === "threeMonths"
          ? [
              {
                iconName: "calendar-outline",
                title: t("progressLogging.recitationInsightGoalTracked"),
                value: formatNumber(surahGoalTrackedMonths),
                subValue: t("progressLogging.recitationInsightMonths"),
              },
              {
                iconName: "checkmark-circle-outline",
                title: t("progressLogging.completedIn"),
                value: formatNumber(periodSlice.activeDays),
                subValue: t("progressLogging.recitationInsightActiveDays"),
              },
            ]
          : [
              {
                iconName: "calendar-outline",
                title: t("progressLogging.recitationInsightGoalTracked"),
                value: formatNumber(surahGoalTrackedMonths),
                subValue: t("progressLogging.recitationInsightMonths"),
              },
              {
                iconName: "checkmark-circle-outline",
                title: t("progressLogging.recitationInsightActiveDaysTitle"),
                value: formatNumber(periodSlice.activeDays),
                subValue: t("progressLogging.recitationInsightActiveDays"),
              },
            ]
      : period === "monthly"
        ? [
            {
              iconName: "checkmark-circle-outline",
              title: t("progressLogging.recitationInsightCompleted"),
              value: formatNumber(periodSlice.activeDays),
              subValue: t("progressLogging.recitationInsightActiveDays"),
            },
            {
              iconName: "stats-chart-outline",
              title: t("progressLogging.recitationInsightWeeklyAverage"),
              value: formatNumber(weeklyAverage),
              subValue: t("progressLogging.unitRecitations"),
            },
          ]
        : period === "threeMonths"
          ? [
              {
                iconName: "calendar-outline",
                title: t("progressLogging.recitationInsightGoalTracked"),
                value: formatNumber(goalTrackedMonths),
                subValue: t("progressLogging.recitationInsightMonths"),
              },
              {
                iconName: "checkmark-circle-outline",
                title: t("progressLogging.recitationInsightCompleted"),
                value: formatNumber(periodSlice.activeDays),
                subValue: t("progressLogging.recitationInsightActiveDays"),
              },
            ]
          : [
              {
                iconName: "calendar-outline",
                title: t("progressLogging.recitationInsightAvgMonths"),
                value: formatNumber(
                  Math.max(1, Math.round(periodSlice.activeDays / 24)),
                ),
                subValue: t("progressLogging.recitationInsightMonths"),
              },
              {
                iconName: "checkmark-circle-outline",
                title: t("progressLogging.recitationInsightActiveDaysTitle"),
                value: formatNumber(periodSlice.activeDays),
                subValue: t("progressLogging.recitationInsightActiveDays"),
              },
            ];

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>
            {PERIOD_INSIGHT_SUBTITLE[period]}
          </Text>
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          {insightCards.map((card) => (
            <InsightCard
              key={card.title}
              iconName={card.iconName}
              icon={getRecitationInsightIcon({
                iconFamily: "Ionicons",
                iconName: card.iconName,
                title: card.title,
                value: card.value,
              })}
              title={card.title}
              value={card.value}
              subValue={card.subValue}
              style={insightCardStyle}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderDetailedSummary = () => {
    const deltaIsPositiveSummary = periodSlice.previousPeriodDeltaPercent >= 0;

    if (isSurahDrillDown) {
      if (
        selectedBarIndex !== null &&
        selectedChartPeriod &&
        period === "monthly"
      ) {
        const weeklyGoal = Math.round(
          periodSlice.goalTotal / Math.max(periodSlice.chartPeriods.length, 1),
        );
        const weekPercent = Math.min(
          100,
          Math.round(
            (selectedChartPeriod.completed / Math.max(weeklyGoal, 1)) * 100,
          ),
        );

        return (
          <Text style={styles.summaryTextDetailed}>
            {t("progressLogging.recitationDetailedSummaryWeekSurah", {
              week: formatNumber(selectedBarIndex + 1),
              completed: formatNumber(selectedChartPeriod.completed),
              surah: surahDisplayName,
              percent: formatNumber(weekPercent),
            })}
          </Text>
        );
      }

      if (
        selectedBarIndex !== null &&
        selectedChartPeriod &&
        period !== "monthly"
      ) {
        if (
          selectedChartPeriod.completed === 0 &&
          selectedChartPeriod.incomplete === 0
        ) {
          return (
            <Text style={styles.summaryTextDetailed}>
              {t("progressLogging.recitationNoDataForMonthRange", {
                range: selectedChartPeriod.dateLabel,
              })}
            </Text>
          );
        }

        const monthPercent = Math.min(
          100,
          Math.round(
            (selectedChartPeriod.completed /
              Math.max(
                selectedChartPeriod.completed + selectedChartPeriod.incomplete,
                1,
              )) *
              100,
          ),
        );

        return (
          <Text style={styles.summaryTextDetailed}>
            {t("progressLogging.recitationDetailedSummaryMonthBarSurah", {
              range: selectedChartPeriod.dateLabel,
              completed: formatNumber(selectedChartPeriod.completed),
              surah: surahDisplayName,
              percent: formatNumber(monthPercent),
            })}
          </Text>
        );
      }

      if (!hasLogs) {
        return (
          <Text style={styles.summaryTextDetailed}>
            {t("progressLogging.recitationNoDataForPeriod")}
          </Text>
        );
      }

      const summaryKey =
        period === "monthly"
          ? "progressLogging.recitationDetailedSummaryMonthlySurah"
          : period === "threeMonths"
            ? "progressLogging.recitationDetailedSummaryThreeMonthsSurah"
            : "progressLogging.recitationDetailedSummarySixMonthsSurah";

      return (
        <Text style={styles.summaryTextDetailed}>
          {t(summaryKey, {
            percent: formatNumber(periodSlice.achievementPercent),
            surah: surahDisplayName,
            completed: formatNumber(displayBaseCompleted),
            goalTotal: formatNumber(periodSlice.goalTotal),
            range: periodSlice.dateRangeLabel,
            delta: formatNumber(
              Math.abs(periodSlice.previousPeriodDeltaPercent),
            ),
            direction: deltaIsPositiveSummary
              ? t("progressLogging.periodComparisonIncrease")
              : t("progressLogging.periodComparisonDecrease"),
          })}
        </Text>
      );
    }

    if (selectedSurahId === "all") {
      const summaryKey =
        period === "monthly"
          ? "progressLogging.recitationDetailedSummaryMonthlyAll"
          : period === "threeMonths"
            ? "progressLogging.recitationDetailedSummaryThreeMonthsAll"
            : "progressLogging.recitationDetailedSummarySixMonthsAll";

      return (
        <Text style={styles.summaryTextDetailed}>
          {t(summaryKey, {
            percent: formatNumber(periodSlice.achievementPercent),
            goalTotal: formatNumber(periodSlice.goalTotal),
            completed: formatNumber(displayBaseCompleted),
            delta: formatNumber(
              Math.abs(periodSlice.previousPeriodDeltaPercent),
            ),
            direction: deltaIsPositive
              ? t("progressLogging.periodComparisonIncrease")
              : t("progressLogging.periodComparisonDecrease"),
          })}
        </Text>
      );
    }

    return (
      <Text style={styles.summaryTextDetailed}>
        {t("progressLogging.recitationDetailedSummarySingle", {
          percent: formatNumber(baseAchievement.achievementPercent),
          surah: surahDisplayName || "Quran Recitation",
          delta: formatNumber(
            Math.abs(baseAchievement.previousPeriodDeltaPercent),
          ),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
          periodLabel:
            period === "monthly"
              ? t("progressLogging.periodComparisonMonth")
              : period === "threeMonths"
                ? t("progressLogging.periodComparisonThreeMonths")
                : t("progressLogging.periodComparisonSixMonths"),
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
          {isSurahDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.recitationDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                surah: surahDisplayName,
              })}
            </Text>
          ) : null}
        </View>

        {renderAchievementHeader()}

        {isDetailed ? (
          <>
            {renderDetailedSummary()}
            {renderSurahFilterTabs()}
          </>
        ) : null}

        {renderGoalHeader()}
        {renderAnalyticsToggle()}
        {renderCompletedIncompleteStats(showPlaceholders || showNoDataDash)}

        {isDetailed && isSurahDrillDown && !hasLogs && !showPlaceholders ? (
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
            onBarPress={isDetailed ? handleBarPress : () => {}}
            chartKey={`${goalId}-${period}-${selectedSurahId}-${analyticsView}-${showPlaceholders ? "loading" : "ready"}`}
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

        {isDetailed && isSurahDrillDown && effectiveDetailRow ? (
          <RecitationSurahDetailCard
            row={effectiveDetailRow}
            isActive={hasLogs && periodSlice.activeDays > 0}
            analyticsView={analyticsView}
            timeSpentMinutes={selectedPeriodTimeSpentMinutes}
            formatTimeChip={formatRecitationTimeSpentChip}
          />
        ) : null}

        {isDetailed &&
        selectedSurahId === "all" &&
        surahBreakdownRows.length > 0 ? (
          <RecitationSurahBreakdownList
            rows={surahBreakdownRows}
            analyticsView={analyticsView}
            formatTimeChip={formatRecitationTimeSpentChip}
          />
        ) : null}
      </View>
      {renderInsights()}
    </View>
  );
}

const localStyles = StyleSheet.create({
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalValueRowDrillDown: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 10,
  },
  goalValueBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

