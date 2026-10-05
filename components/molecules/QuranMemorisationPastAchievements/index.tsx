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
  getMemorisationPastAchievement,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationPastAchievementData";
import {
  applyMemorisationAnalyticsView,
  formatMemorisationTimeSpentChip,
  formatMemorisationTimeSpentLabel,
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
import { MemorisationSurahDetailCard } from "../QuranHoursPastAchievements/MemorisationSurahDetailCard";
import { HizbMemorisationPastAchievements } from "./HizbMemorisationPastAchievementsSection";
import { memorisationPastAchievementStyles as styles } from "./memorisationPastAchievementsStyles";
import { InsightCard } from "../InsightCard";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { useGetQuranGoalAchievements } from "@/src/api/queries/useGetQuranGoalAchievements";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import { shiftPrayerAchievementsPeriodStart } from "@/src/utils/prayerGoalAchievementsMap";
import { mapQuranApiKeyInsightsToCards } from "@/src/utils/quranHoursGoalAchievementsMap";
import {
  buildMemorisationSurahAchievementFilters,
  createEmptyMemorisationSurahAchievements,
  mapMemorisationSurahAchievementsToUi,
} from "@/src/utils/quranMemorisationSurahAchievementsMap";
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
  const { width } = useWindowDimensions();
  const insightCardStyle = {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    width: width * 0.42,
    maxWidth: width * 0.42,
    minWidth: width * 0.42,
  };
  const surahContext = useOptionalMemorisationSurahContext();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [periodStartParam, setPeriodStartParam] = useState<string | null>(null);
  const [analyticsView, setAnalyticsView] =
    useState<MemorisationAnalyticsView>(initialAnalyticsView);
  const [surahFilter, setSurahFilter] = useState<MemorisationSurahFilterId>(
    initialSurahId ?? "all",
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const usesAchievementsApi = quranGoalType === "MEMORIZATION_SURAH";

  // Same All / Surah tabs on goal-logging compact + detailed screens.
  const selectedSurahId: MemorisationSurahFilterId = surahFilter;
  const refreshKey = surahContext?.refreshKey ?? 0;
  const contextGoals = surahContext?.goals ?? [];
  const isSurahDrillDown = isDetailed && selectedSurahId !== "all";

  const selectedItemNumber = useMemo(() => {
    // All → no itemNumber (…/achievements?period=M)
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
      periodStart: periodStartParam,
      itemNumber: selectedItemNumber,
      chart: achievementsChartParam,
      enabled: usesAchievementsApi && !!quranGoalType,
    });

  const showPlaceholders =
    usesAchievementsApi && (!achievementsApiData || isAchievementsLoading);

  const surahFilters = useMemo(() => {
    if (contextGoals.length > 0) {
      return buildMemorisationSurahAchievementFilters(contextGoals);
    }
    return getMemorisationPastAchievementFilters();
  }, [contextGoals, refreshKey]);

  const goalUnitLabel = useMemo(() => {
    const unit = String(achievementsApiData?.goal?.unit ?? "")
      .trim()
      .toLowerCase();
    if (unit.includes("surah")) return "surahs";
    if (unit.includes("ayah") || unit.includes("verse")) {
      return t("progressLogging.unitAyahs");
    }
    // Aggregate "All" view is surah-scoped in Figma.
    if (selectedSurahId === "all") return "surahs";
    return t("progressLogging.unitAyahs");
  }, [achievementsApiData?.goal?.unit, selectedSurahId, t]);

  const surahDisplayName =
    surahFilters.find((filter) => filter.id === selectedSurahId)?.surahName ??
    "";

  const mappedApi = useMemo(() => {
    if (!usesAchievementsApi) return null;
    if (!achievementsApiData) {
      return createEmptyMemorisationSurahAchievements(
        selectedSurahId,
        surahDisplayName || "All Surahs",
        period,
      );
    }
    return mapMemorisationSurahAchievementsToUi(achievementsApiData, period, {
      surahId: selectedSurahId,
      surahName: surahDisplayName || "All Surahs",
      goals: contextGoals,
    });
  }, [
    achievementsApiData,
    contextGoals,
    period,
    selectedSurahId,
    surahDisplayName,
    usesAchievementsApi,
  ]);

  const allPeriodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.slice;
    return getQuranMemorisationSurahPastAchievementSlice(period, "all");
  }, [mappedApi, period, refreshKey, usesAchievementsApi]);

  const periodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.slice;
    return getQuranMemorisationSurahPastAchievementSlice(
      period,
      selectedSurahId,
    );
  }, [mappedApi, period, refreshKey, selectedSurahId, usesAchievementsApi]);

  const hasLogs = useMemo(() => {
    if (usesAchievementsApi) {
      return (
        periodSlice.memorizedAyahs > 0 ||
        periodSlice.chartPeriods.some(
          (item) => item.completed > 0 || item.timeSpentMinutes > 0,
        )
      );
    }
    return hasMemorisationPastAchievementLogs(periodSlice);
  }, [periodSlice, usesAchievementsApi]);

  const baseAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.achievement;
    return getQuranMemorisationSurahPastAchievement(period, selectedSurahId);
  }, [mappedApi, period, refreshKey, selectedSurahId, usesAchievementsApi]);

  const compactAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.compact;
    return getMemorisationPastAchievement(selectedSurahId);
  }, [mappedApi, refreshKey, selectedSurahId, usesAchievementsApi]);

  const timeSpentByPeriod = useMemo(
    () => getMemorisationTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyMemorisationAnalyticsView(
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
        formatMemorisationTimeSpentChip(Math.round(hours * 60));
    }
    return (value: number) =>
      t("progressLogging.memorisationAyahCount", {
        count: formatNumber(value),
      });
  }, [analyticsView, formatNumber, t]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalMemorisationTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const goalTrackedMonths = getMemorisationGoalTrackedMonths(period);
  const totalMemorizedVerses = getTotalMemorizedVerses(periodSlice);

  const progressRailRows = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.progressRailRows;
    return getMemorisationProgressRailRows(
      allPeriodSlice,
      periodSlice,
      selectedSurahId,
      selectedBarIndex,
    );
  }, [
    allPeriodSlice,
    mappedApi,
    periodSlice,
    selectedBarIndex,
    selectedSurahId,
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
    showPlaceholders ||
    !hasLogs ||
    isPastAchievementBarEmpty(displayBaseCompleted, displayBaseIncomplete);

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

  const canNavigateBack = usesAchievementsApi
    ? !showPlaceholders &&
      (achievementsApiData?.canNavigateBack ??
        achievementsApiData?.hasPrevious ??
        false)
    : false;
  const canNavigateForward = usesAchievementsApi
    ? !showPlaceholders &&
      (achievementsApiData?.canNavigateForward ??
        achievementsApiData?.hasNext ??
        false)
    : false;

  const apiNarrative =
    mappedApi?.achievement.narrative ?? null;
  const selectedBucketNarrative = selectedBaseBar?.narrative;
  const keyInsightsHeader = mappedApi?.achievement.keyInsightsHeader ?? null;

  const insightCards = useMemo(() => {
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

  useEffect(() => {
    if (initialSurahId) {
      setSurahFilter(initialSurahId);
    }
  }, [initialSurahId]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, selectedSurahId, analyticsView, periodStartParam]);

  useEffect(() => {
    // Switching chart mode refetches; clear period cursor so latest loads.
    if (!isDetailed) return;
    setPeriodStartParam(null);
  }, [analyticsView, isDetailed]);

  const handlePeriodChange = useCallback((next: PastAchievementPeriod) => {
    setPeriod(next);
    setPeriodStartParam(null);
  }, []);

  const handleNavigateBack = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData || !canNavigateBack) return;
    if (!achievementsApiData.periodStart || !achievementsApiData.periodEnd)
      return;
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      -1,
    );
    setPeriodStartParam(nextStart);
  }, [achievementsApiData, canNavigateBack, usesAchievementsApi]);

  const handleNavigateForward = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData || !canNavigateForward)
      return;
    if (!achievementsApiData.periodStart || !achievementsApiData.periodEnd)
      return;
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      1,
    );
    setPeriodStartParam(nextStart);
  }, [achievementsApiData, canNavigateForward, usesAchievementsApi]);

  const handleBarPressDetailed = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex(index);
  }, []);

  const handleCloseBarSelection = useCallback(() => {
    setSelectedBarIndex(null);
  }, []);

  const handleSelectSurahFilter = useCallback(
    (id: MemorisationSurahFilterId) => {
      setSurahFilter(id);
      setPeriodStartParam(null);
      setSelectedBarIndex(null);
    },
    [],
  );

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        analyticsView,
        goalCategory: "surah",
        goalType: "quran_memorisation",
        selectedSurahId,
      },
    });
  }, [analyticsView, goalId, period, router, selectedSurahId]);

  const showChartHint =
    isDetailed &&
    !hintDismissed &&
    selectedBarIndex === null &&
    !showPlaceholders;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  /** Same gate as Prayer / Quran Hours: hide detail chevron until chart has data. */
  const showDetailedStatsChevron = useMemo(() => {
    if (isDetailed || showPlaceholders) return false;
    if (usesAchievementsApi) {
      const buckets = achievementsApiData?.chart?.buckets ?? [];
      return buckets.some(
        (item) =>
          (item?.completedVerses ??
            item?.completedAyahs ??
            item?.completedMinutes ??
            0) > 0,
      );
    }
    if ((compactAchievement.memorizedAyahs ?? 0) > 0) return true;
    if ((compactAchievement.progressPercent ?? 0) > 0) return true;
    return compactAchievement.chartData.some(
      (item) => (item.completedHours ?? 0) > 0,
    );
  }, [
    achievementsApiData?.chart?.buckets,
    compactAchievement.chartData,
    compactAchievement.memorizedAyahs,
    compactAchievement.progressPercent,
    isDetailed,
    showPlaceholders,
    usesAchievementsApi,
  ]);

  /** Hide 0% / empty delta chip like PrayerPastAchievements. */
  const showDeltaChip =
    !showPlaceholders &&
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
              : formatMemorisationTimeSpentLabel(selectedPeriodTimeSpentMinutes)
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
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.navBtn}
        disabled={!canNavigateBack}
        onPress={handleNavigateBack}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={
            canNavigateBack ? Colors.light.dullWhite : Colors.light.subtext
          }
        />
      </TouchableOpacity>
      <Text
        style={styles.dateRange}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {showPlaceholders && !baseAchievement.dateRangeLabel
          ? LOADING_DASH
          : baseAchievement.dateRangeLabel || LOADING_DASH}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.navBtn}
        disabled={!canNavigateForward}
        onPress={handleNavigateForward}
      >
        <Ionicons
          name="chevron-forward"
          size={24}
          color={
            canNavigateForward ? Colors.light.dullWhite : Colors.light.subtext
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderSurahFilterTabs = () => {
    if (surahFilters.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
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
              onPress={() => handleSelectSurahFilter(filter.id)}
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
    if (showPlaceholders) {
      return <Text style={styles.summaryTextDetailed}>{LOADING_DASH}</Text>;
    }

    if (selectedBucketNarrative?.trim()) {
      return (
        <Text style={styles.summaryTextDetailed}>
          {selectedBucketNarrative.trim()}
        </Text>
      );
    }

    if (
      selectedBarIndex === null &&
      typeof apiNarrative === "string" &&
      apiNarrative.trim()
    ) {
      return (
        <Text style={styles.summaryTextDetailed}>{apiNarrative.trim()}</Text>
      );
    }

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
          <InsightCard
            iconName="time-outline"
            icon={getMemorisationInsightIcon({
              iconFamily: "Ionicons",
              iconName: "time-outline",
              title: t("progressLogging.timeSpentLabel"),
              value: formatMemorisationTimeSpentLabel(totalTimeSpentMinutes),
            })}
            title={t("progressLogging.timeSpentLabel").toUpperCase()}
            value={
              showPlaceholders
                ? LOADING_DASH
                : formatMemorisationTimeSpentLabel(totalTimeSpentMinutes)
            }
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

          {renderGoalHeader()}
          {renderAnalyticsToggle()}
          {renderCompletedIncompleteStats(showPlaceholders || showNoDataDash)}

          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={
                showPlaceholders &&
                !(chartAchievement?.chartData?.length)
                  ? []
                  : (chartAchievement?.chartData ?? [])
              }
              selectedBarIndex={null}
              onBarPress={() => {}}
              chartKey={`${goalId}-${period}-${selectedSurahId}-${analyticsView}-${periodStartParam ?? "latest"}-${showPlaceholders ? "loading" : "ready"}-${refreshKey}`}
              yMax={chartAchievement?.yMax ?? compactAchievement.yMax}
              yTicks={chartAchievement?.yTicks ?? compactAchievement.yTicks}
              showHint={false}
              onDismissHint={() => setHintDismissed(true)}
              hintText={t("progressLogging.chartTapHint")}
              hintActionText={t("progressLogging.okGotIt")}
              pageCount={
                chartAchievement?.pageCount ??
                compactAchievement.chartData.length
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
          {isSurahDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.memorisationDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                surah: surahDisplayName,
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

        {renderDetailedSummary()}
        {renderSurahFilterTabs()}

        {renderGoalHeader()}
        {renderAnalyticsToggle()}
        {renderCompletedIncompleteStats(showPlaceholders || showNoDataDash)}

        {isSurahDrillDown && !hasLogs && !showPlaceholders ? (
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
            onBarPress={handleBarPressDetailed}
            chartKey={`${goalId}-${period}-${selectedSurahId}-${analyticsView}-${periodStartParam ?? "latest"}-${showPlaceholders ? "loading" : "ready"}`}
            yMax={chartAchievement?.yMax ?? 10}
            yTicks={chartAchievement?.yTicks ?? [0, 5, 10]}
            showHint={showChartHint && !showNoDataDash}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={chartAchievement?.pageCount ?? 1}
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
          visible={selectedBarIndex !== null && !showPlaceholders}
          completed={displayBaseCompleted}
          incomplete={displayBaseIncomplete}
          goalTotal={selectedBarGoalTotal}
          onClose={handleCloseBarSelection}
        />

        {progressRailRows.length > 0 && !showPlaceholders ? (
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
