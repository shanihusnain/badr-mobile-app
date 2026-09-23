import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
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
  applyJuzMemorisationAnalyticsView,
  formatMemorisationJuzTimeSpentChip,
  getJuzMemorisationCompactPastAchievement,
  getMemorisationJuzGoalTrackedMonths,
  getJuzMemorisationPastAchievementFilters,
  getMemorisationJuzProgressRailRows,
  getJuzMemorisationTimeSpentByPeriod,
  getJuzMemorisationPastAchievement,
  getJuzMemorisationPastAchievementSlice,
  getTotalJuzMemorizedVerses,
  getTotalJuzMemorisationTimeSpentMinutes,
  hasMemorisationJuzPastAchievementLogs,
  type MemorisationJuzFilterId,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationJuzPastAchievementData";
import type { MemorisationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import type { JuzMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { useOptionalMemorisationJuzContext } from "@/src/screens/private/goalprogressloggingscreen/memorisationJuzContext";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { MemorisationJuzDetailCard } from "../QuranHoursPastAchievements/MemorisationJuzDetailCard";
import { InsightCard } from "../InsightCard";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { memorisationPastAchievementStyles as styles } from "./memorisationPastAchievementsStyles";
import { useGetQuranGoalAchievements } from "@/src/api/queries/useGetQuranGoalAchievements";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import { shiftPrayerAchievementsPeriodStart } from "@/src/utils/prayerGoalAchievementsMap";
import { mapQuranApiKeyInsightsToCards } from "@/src/utils/quranHoursGoalAchievementsMap";
import {
  buildMemorisationJuzAchievementFilters,
  createEmptyMemorisationJuzAchievements,
  mapMemorisationJuzAchievementsToUi,
} from "@/src/utils/quranMemorisationJuzAchievementsMap";
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

const PERIODS: PastAchievementPeriod[] = ["monthly", "threeMonths", "sixMonths"];

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
  threeMonths: "progressLogging.previousThreeMonthsShort",
  sixMonths: "progressLogging.previousSixMonthsShort",
};

const PERIOD_INSIGHT_SUBTITLE: Record<PastAchievementPeriod, string> = {
  monthly: "VS. LAST MONTH",
  threeMonths: "VS. LAST 3 MONTHS",
  sixMonths: "VS. LAST 6 MONTHS",
};

const LOADING_DASH = "---";
const QURAN_INSIGHT_ICON_SIZE = 14;

function getMemorisationInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (
    name === "checkmark-circle-outline" ||
    title.includes("COMPLETED") ||
    title.includes("MEMORIZED")
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

export function JuzMemorisationPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
  initialJuzId = "all",
}: {
  goalId: JuzMemorisationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: MemorisationAnalyticsView;
  initialJuzId?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { width } = useWindowDimensions();
  const insightCardStyle = {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    width: width * 0.42,
    maxWidth: width * 0.42,
    minWidth: width * 0.42,
  };
  const juzContext = useOptionalMemorisationJuzContext();
  const [period, setPeriodState] = useState<PastAchievementPeriod>(initialPeriod);
  const setPeriod = useCallback((next: PastAchievementPeriod) => {
    setPeriodState(next);
    setPeriodStartParam(null);
  }, []);
  const [periodStartParam, setPeriodStartParam] = useState<string | null>(null);
  const [analyticsView, setAnalyticsView] =
    useState<MemorisationAnalyticsView>(initialAnalyticsView);
  const [detailedJuzFilter, setDetailedJuzFilter] =
    useState<MemorisationJuzFilterId>(initialJuzId ?? "all");
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const usesAchievementsApi = quranGoalType === "MEMORIZATION_JUZ";

  const selectedJuzId: MemorisationJuzFilterId = isDetailed
    ? detailedJuzFilter
    : (juzContext?.activeJuzId ?? "all");
  const refreshKey = juzContext?.refreshKey ?? 0;
  const contextGoals = juzContext?.goals ?? [];
  const isJuzDrillDown = isDetailed && selectedJuzId !== "all";

  const selectedItemNumber = useMemo(() => {
    if (selectedJuzId === "all") return null;
    const fromGoal = contextGoals.find((goal) => goal.id === selectedJuzId)
      ?.itemNumber ?? contextGoals.find((goal) => goal.id === selectedJuzId)?.juzNumber;
    if (fromGoal != null && Number.isFinite(fromGoal)) return fromGoal;
    const fromId = Number(String(selectedJuzId).replace(/^juz-/i, ""));
    return Number.isFinite(fromId) && fromId > 0 ? fromId : null;
  }, [contextGoals, selectedJuzId]);

  const achievementsModeParam =
    isDetailed && analyticsView === "completedVsTimeSpent" ? "TIME" : null;

  const { data: achievementsApiData, isLoading: isAchievementsLoading } =
    useGetQuranGoalAchievements(quranGoalType, {
      period,
      periodStart: periodStartParam,
      itemNumber: selectedItemNumber,
      mode: achievementsModeParam,
      enabled: usesAchievementsApi && !!quranGoalType,
    });

  const showPlaceholders =
    usesAchievementsApi && (!achievementsApiData || isAchievementsLoading);

  const juzFilters = useMemo(() => {
    if (contextGoals.length > 0) {
      return buildMemorisationJuzAchievementFilters(contextGoals);
    }
    return getJuzMemorisationPastAchievementFilters();
  }, [contextGoals, refreshKey]);

  const juzDisplayName =
    juzFilters.find((filter) => filter.id === selectedJuzId)?.label ?? "";

  const goalUnitLabel = useMemo(() => {
    const unit = String(achievementsApiData?.goal?.unit ?? "")
      .trim()
      .toLowerCase();
    if (unit.includes("juz")) {
      return t("monthlyGoalPlanner.juzUnit_other");
    }
    if (unit.includes("ayah") || unit.includes("verse")) {
      return t("progressLogging.unitAyahs");
    }
    if (selectedJuzId === "all") {
      return t("monthlyGoalPlanner.juzUnit_other");
    }
    return t("progressLogging.unitAyahs");
  }, [achievementsApiData?.goal?.unit, selectedJuzId, t]);

  const mappedApi = useMemo(() => {
    if (!usesAchievementsApi) return null;
    if (!achievementsApiData) {
      return createEmptyMemorisationJuzAchievements(
        selectedJuzId,
        juzDisplayName || "All Juzs",
      );
    }
    return mapMemorisationJuzAchievementsToUi(achievementsApiData, period, {
      juzId: selectedJuzId,
      juzName: juzDisplayName || "All Juzs",
      goals: contextGoals,
    });
  }, [
    achievementsApiData,
    contextGoals,
    juzDisplayName,
    period,
    selectedJuzId,
    usesAchievementsApi,
  ]);

  const allPeriodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.slice;
    return getJuzMemorisationPastAchievementSlice(period, "all");
  }, [mappedApi, period, refreshKey, usesAchievementsApi]);

  const periodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.slice;
    return getJuzMemorisationPastAchievementSlice(period, selectedJuzId);
  }, [mappedApi, period, refreshKey, selectedJuzId, usesAchievementsApi]);


  const canNavigateBack = usesAchievementsApi
    ? Boolean(mappedApi?.achievement.canNavigateBack)
    : false;
  const canNavigateForward = usesAchievementsApi
    ? Boolean(mappedApi?.achievement.canNavigateForward)
    : false;

  const keyInsightsHeader = mappedApi?.achievement.keyInsightsHeader ?? null;

  const insightCards = useMemo(() => {
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
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      -1,
    );
    setPeriodStartParam(nextStart);
  }, [achievementsApiData, canNavigateBack, usesAchievementsApi]);

  const handleNextPeriod = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData || !canNavigateForward)
      return;
    if (!achievementsApiData.periodStart || !achievementsApiData.periodEnd) return;
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      1,
    );
    setPeriodStartParam(nextStart);
  }, [achievementsApiData, canNavigateForward, usesAchievementsApi]);


  const hasLogs = useMemo(() => {
    if (usesAchievementsApi) {
      return (mappedApi?.achievement.chartData.length ?? 0) > 0;
    }
    return hasMemorisationJuzPastAchievementLogs(periodSlice);
  }, [mappedApi, periodSlice, usesAchievementsApi]);

  const baseAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.achievement;
    return getJuzMemorisationPastAchievement(period, selectedJuzId);
  }, [mappedApi, period, refreshKey, selectedJuzId, usesAchievementsApi]);

  const compactAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.compact;
    return getJuzMemorisationCompactPastAchievement(selectedJuzId);
  }, [mappedApi, refreshKey, selectedJuzId, usesAchievementsApi]);

  const timeSpentByPeriod = useMemo(
    () => getJuzMemorisationTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyJuzMemorisationAnalyticsView(
        baseAchievement,
        periodSlice,
        analyticsView,
      ),
    [analyticsView, baseAchievement, periodSlice],
  );

  const chartAchievement = useMemo(() => {
    if (analyticsView === "completedVsTimeSpent") {
      return applyTimeSpentOnlyGreenChart(baseAchievement, timeSpentByPeriod);
    }
    return achievement;
  }, [achievement, analyticsView, baseAchievement, timeSpentByPeriod]);

  const chartFormatBarValue = useMemo(() => {
    if (analyticsView === "completedVsTimeSpent") {
      return (hours: number) =>
        formatMemorisationJuzTimeSpentChip(Math.round(hours * 60));
    }
    return (value: number) =>
      t("progressLogging.memorisationAyahCount", {
        count: formatNumber(value),
      });
  }, [analyticsView, formatNumber, t]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalJuzMemorisationTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const goalTrackedMonths = getMemorisationJuzGoalTrackedMonths(period);
  const totalMemorizedVerses = getTotalJuzMemorizedVerses(periodSlice);

  const progressRailRows = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.progressRailRows;
    return getMemorisationJuzProgressRailRows(
      allPeriodSlice,
      periodSlice,
      selectedJuzId,
      selectedBarIndex,
    );
  }, [
    allPeriodSlice,
    mappedApi,
    periodSlice,
    selectedBarIndex,
    selectedJuzId,
    usesAchievementsApi,
  ]);

  const selectedBaseBar =
    selectedBarIndex !== null
      ? baseAchievement.chartData[selectedBarIndex]
      : null;

  const displayBaseCompleted =
    selectedBaseBar?.completedHours ?? baseAchievement.completedHours;
  const displayBaseIncomplete =
    selectedBaseBar?.incompleteHours ?? baseAchievement.incompleteHours;

  const showNoDataDash =
    !hasLogs ||
    isPastAchievementBarEmpty(
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
    if (isDetailed && initialJuzId) {
      setDetailedJuzFilter(initialJuzId);
    }
  }, [initialJuzId, isDetailed]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, selectedJuzId, analyticsView]);

  const handlePeriodChange = useCallback((next: PastAchievementPeriod) => {
    setPeriod(next);
  }, []);

  const handleBarPressDetailed = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex(index);
  }, []);

  const handleCloseBarSelection = useCallback(() => {
    setSelectedBarIndex(null);
  }, []);

  const handleSelectJuzFilter = useCallback((id: MemorisationJuzFilterId) => {
    setDetailedJuzFilter(id);
    setSelectedBarIndex(null);
  }, []);

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        analyticsView,
        goalCategory: "memorisation_juz",
        goalType: "quran_memorisation_juz",
        selectedMemorisationJuzFilter:
          selectedJuzId === "all" ? undefined : selectedJuzId,
      },
    });
  }, [analyticsView, goalId, period, router, selectedJuzId]);

  const showChartHint =
    isDetailed && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const showDetailedStatsChevron = useMemo(() => {
    if (isDetailed) return false;
    if (hasMemorisationJuzPastAchievementLogs(periodSlice)) return true;
    if ((compactAchievement.memorizedAyahs ?? 0) > 0) return true;
    return compactAchievement.chartData.some(
      (item) =>
        (item.completedHours ?? 0) > 0 || (item.incompleteHours ?? 0) > 0,
    );
  }, [compactAchievement.chartData, compactAchievement.memorizedAyahs, isDetailed, periodSlice]);

  const showDeltaChip =
    hasLogs &&
    !showNoDataDash &&
    Math.abs(baseAchievement.previousPeriodDeltaPercent) > 0;

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
          {noData ? PAST_ACHIEVEMENT_NO_DATA : formatNumber(displayBaseCompleted)}
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
              : formatMemorisationJuzTimeSpentChip(selectedPeriodTimeSpentMinutes)
            : noData
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatNumber(displayBaseIncomplete)}
        </Text>
      </View>
    </View>
  );

  const renderGoalHeader = () => (
    <View style={styles.goalHeader}>
      <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
      <View style={styles.goalPillRow}>
        <Text style={styles.goalPillValue}>
          {showNoDataDash
            ? PAST_ACHIEVEMENT_NO_DATA
            : formatNumber(periodSlice.totalAyahs)}{" "}
        </Text>
        <View style={styles.goalPill}>
          <Text style={styles.goalPillText}>{goalUnitLabel}</Text>
        </View>
      </View>
    </View>
  );

  const renderPeriodToggle = () => (
    <View style={styles.periodToggleListening}>
      {PERIODS.map((item) => {
        const isActive = period === item;
        return (
          <Pressable
            key={item}
            onPress={() => handlePeriodChange(item)}
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
      <TouchableOpacity activeOpacity={0.7} style={styles.navBtn} disabled>
        <Ionicons
          name="chevron-back"
          size={24}
          color={Colors.light.subtext}
        />
      </TouchableOpacity>
      <Text style={styles.dateRange} numberOfLines={1} ellipsizeMode="tail">
        {baseAchievement.dateRangeLabel}
      </Text>
      <TouchableOpacity activeOpacity={0.7} style={styles.navBtn} disabled>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.light.subtext}
        />
      </TouchableOpacity>
    </View>
  );

  const renderJuzFilterTabs = () => {
    if (!isDetailed) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.surahTabsRow}
      >
        {juzFilters.map((filter) => {
          const isActive = selectedJuzId === filter.id;
          const label =
            filter.id === "all"
              ? t("progressLogging.juzFilterAll")
              : filter.label;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.7}
              onPress={() => handleSelectJuzFilter(filter.id)}
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
          {t("progressLogging.memorisationJuzDetailedSummaryBar", {
            range: selectedPeriod.dateLabel,
            memorized: formatNumber(selectedPeriod.completed),
            juz:
              selectedJuzId === "all"
                ? t("progressLogging.memorisationAllJuzTitle")
                : juzDisplayName,
            percent: formatNumber(percent),
          })}
        </Text>
      );
    }

    const summaryKey =
      period === "monthly"
        ? "progressLogging.memorisationJuzDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.memorisationJuzDetailedSummaryThreeMonths"
          : "progressLogging.memorisationJuzDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          memorized: formatNumber(periodSlice.memorizedAyahs),
          total: formatNumber(periodSlice.totalAyahs),
          juz:
            selectedJuzId === "all"
              ? t("progressLogging.memorisationAllJuzTitle")
              : juzDisplayName,
          delta: formatNumber(Math.abs(periodSlice.previousPeriodDeltaPercent)),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
        })}
      </Text>
    );
  };

  const renderInsights = () => {
    if (usesAchievementsApi && insightCards.length > 0) {
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
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={styles.insightsScrollContent}
          >
            {insightCards.map((card, index) => (
              <InsightCard
                key={`${card.title}-${index}`}
                iconName={card.iconName}
                icon={getMemorisationInsightIcon(card)}
                title={card.title}
                value={card.value}
                subValue={card.subValue}
                trendValue={card.trendValue}
                trendDirection={card.trendDirection}
                footerText={card.footerText}
                footerNeutral={card.footerNeutral}
                noData={card.noData}
                style={insightCardStyle}
              />
            ))}
          </ScrollView>
        </View>
      );
    }

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
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.insightsScrollContent}
        >
          <InsightCard
            iconName="calendar-outline"
            icon={getMemorisationInsightIcon({
              iconFamily: "Ionicons",
              iconName: "calendar-outline",
              title: t("progressLogging.recitationInsightGoalTracked"),
              value: String(goalTrackedMonths),
            })}
            title={t("progressLogging.recitationInsightGoalTracked")}
            value={
              showPlaceholders ? LOADING_DASH : formatNumber(goalTrackedMonths)
            }
            subValue={t("progressLogging.recitationInsightMonths")}
            style={insightCardStyle}
          />
          <InsightCard
            iconName="book-outline"
            icon={getMemorisationInsightIcon({
              iconFamily: "Ionicons",
              iconName: "book-outline",
              title: t("progressLogging.memorisationInsightTotalMemorized"),
              value: String(totalMemorizedVerses),
            })}
            title={t("progressLogging.memorisationInsightTotalMemorized")}
            value={
              showPlaceholders
                ? LOADING_DASH
                : formatNumber(totalMemorizedVerses)
            }
            subValue={t("progressLogging.memorisationInsightVersesMemorized")}
            style={insightCardStyle}
          />
        </ScrollView>
      </View>
    );
  };

  if (!isDetailed) {
    return (
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AchivementArrowIcon size={15} color={Colors.light.subtext} />
            <Text style={styles.sectionTitle}>
              {t("progressLogging.pastGoalAchievements")}
            </Text>
            {showDetailedStatsChevron ? (
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

          <View style={styles.achievementPeriodRow}>
            <View style={styles.achievementBlockCompact}>
              <Text style={styles.achievementCaptionCompact}>
                {t("progressLogging.achievementsLabel").toUpperCase()}
              </Text>
              <View style={styles.achievementPercentRow}>
                <Text style={styles.achievementPercentCompact}>
                  {showNoDataDash
                    ? PAST_ACHIEVEMENT_NO_DATA
                    : formatNumber(baseAchievement.achievementPercent)}
                </Text>
                {!showNoDataDash ? (
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

          {renderGoalHeader()}
          {renderAnalyticsToggle()}
          {renderCompletedIncompleteStats(showNoDataDash)}

          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={
                showNoDataDash ? [] : (chartAchievement?.chartData ?? [])
              }
              selectedBarIndex={null}
              onBarPress={() => {}}
              chartKey={`${goalId}-${period}-${selectedJuzId}-${analyticsView}-${refreshKey}`}
              yMax={chartAchievement?.yMax ?? compactAchievement.yMax}
              yTicks={chartAchievement?.yTicks ?? compactAchievement.yTicks}
              showHint={false}
              onDismissHint={() => setHintDismissed(true)}
              hintText={t("progressLogging.chartTapHint")}
              hintActionText={t("progressLogging.okGotIt")}
              pageCount={
                showNoDataDash
                  ? 0
                  : (chartAchievement?.pageCount ??
                    compactAchievement.chartData.length)
              }
              activePageIndex={0}
              formatBarValue={chartFormatBarValue}
              showPagination={!showNoDataDash}
              barColors={
                analyticsView === "completedVsTimeSpent"
                  ? [Colors.light.green, Colors.light.green]
                  : [Colors.light.green, Colors.light.warning]
              }
            />
          </View>
        </View>

        {renderInsights()}
      </View>
    );
  }

  return (
    <View style={[styles.section, styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeaderBlock}>
          <View style={styles.cardHeader}>
            <AchivementArrowIcon size={15} color={Colors.light.subtext} />
            <Text style={[styles.sectionTitle, styles.sectionTitleDetailed]}>
              {t("progressLogging.pastGoalAchievements")}
            </Text>
          </View>
          {isJuzDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.memorisationJuzDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                juz: juzDisplayName,
              })}
            </Text>
          ) : null}
        </View>

        <View style={styles.achievementPeriodRow}>
          <View style={styles.achievementBlockCompact}>
            <Text style={styles.achievementCaptionCompact}>
              {t("progressLogging.achievementsLabel").toUpperCase()}
            </Text>
            <View style={styles.achievementPercentRow}>
              <Text style={styles.achievementPercentCompact}>
                {showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(baseAchievement.achievementPercent)}
              </Text>
              {!showNoDataDash ? (
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

        {renderDetailedSummary()}
        {renderJuzFilterTabs()}

        {renderGoalHeader()}
        {renderAnalyticsToggle()}
        {renderCompletedIncompleteStats(showNoDataDash)}

        {isJuzDrillDown && !hasLogs ? (
          <View style={styles.emptyStateInline}>
            <Text style={styles.emptyStateText}>
              {t("progressLogging.memorisationJuzNoDataForPeriod")}
            </Text>
          </View>
        ) : null}

        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={
              showNoDataDash ? [] : (chartAchievement?.chartData ?? [])
            }
            selectedBarIndex={showNoDataDash ? null : selectedBarIndex}
            onBarPress={handleBarPressDetailed}
            chartKey={`${goalId}-${period}-${selectedJuzId}-${analyticsView}`}
            yMax={chartAchievement?.yMax ?? 10}
            yTicks={chartAchievement?.yTicks ?? [0, 5, 10]}
            showHint={showChartHint && !showNoDataDash}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={
              showNoDataDash ? 0 : (chartAchievement?.pageCount ?? 1)
            }
            activePageIndex={
              selectedBarIndex ?? chartAchievement?.activePageIndex ?? 0
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
              <MemorisationJuzDetailCard
                key={`memorisation-juz-rail-${row.juzId}`}
                row={row}
                analyticsView={analyticsView}
                formatTimeChip={formatMemorisationJuzTimeSpentChip}
              />
            ))}
          </View>
        ) : null}
      </View>

      {renderInsights()}
    </View>
  );
}

