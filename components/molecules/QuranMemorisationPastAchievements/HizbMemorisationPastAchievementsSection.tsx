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
import { getHizbMemorisationPastAchievement } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementData";
import {
  applyMemorisationHizbAnalyticsView,
  formatMemorisationHizbTimeSpentChip,
  formatMemorisationHizbTimeSpentLabel,
  getMemorisationHizbGoalTrackedMonths,
  getMemorisationHizbPastAchievementFilters,
  getMemorisationHizbProgressRailRows,
  getMemorisationHizbTimeSpentByPeriod,
  getQuranMemorisationHizbPastAchievement,
  getQuranMemorisationHizbPastAchievementSlice,
  getTotalHizbMemorizedVerses,
  getTotalMemorisationHizbTimeSpentMinutes,
  hasMemorisationHizbPastAchievementLogs,
  type MemorisationHizbFilterId,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementSliceData";
import type { MemorisationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import type { HizbMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { useOptionalMemorisationHizbContext } from "@/src/screens/private/goalprogressloggingscreen/memorisationHizbContext";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { MemorisationHizbDetailCard } from "../QuranHoursPastAchievements/MemorisationHizbDetailCard";
import { InsightCard } from "../InsightCard";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { memorisationPastAchievementStyles as styles } from "./memorisationPastAchievementsStyles";
import { useGetQuranGoalAchievements } from "@/src/api/queries/useGetQuranGoalAchievements";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import { shiftPrayerAchievementsPeriodStart } from "@/src/utils/prayerGoalAchievementsMap";
import { mapQuranApiKeyInsightsToCards } from "@/src/utils/quranHoursGoalAchievementsMap";
import {
  buildMemorisationHizbAchievementFilters,
  createEmptyMemorisationHizbAchievements,
  mapMemorisationHizbAchievementsToUi,
} from "@/src/utils/quranMemorisationHizbAchievementsMap";
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

const LOADING_DASH = "—";

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

export function HizbMemorisationPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
  initialHizbId = "all",
}: {
  goalId: HizbMemorisationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: MemorisationAnalyticsView;
  initialHizbId?: string;
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
  const hizbContext = useOptionalMemorisationHizbContext();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [periodStartParam, setPeriodStartParam] = useState<string | null>(null);
  const [analyticsView, setAnalyticsView] =
    useState<MemorisationAnalyticsView>(initialAnalyticsView);
  const [hizbFilter, setHizbFilter] = useState<MemorisationHizbFilterId>(
    initialHizbId ?? "all",
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const usesAchievementsApi = quranGoalType === "MEMORIZATION_HIZB";

  const selectedHizbId: MemorisationHizbFilterId = hizbFilter;
  const refreshKey = hizbContext?.refreshKey ?? 0;
  const contextGoals = hizbContext?.goals ?? [];
  const isHizbDrillDown = isDetailed && selectedHizbId !== "all";

  const selectedItemNumber = useMemo(() => {
    if (selectedHizbId === "all") return null;
    const fromGoal = contextGoals.find((goal) => goal.id === selectedHizbId)
      ?.itemNumber;
    if (fromGoal != null && Number.isFinite(fromGoal)) return fromGoal;
    const fromId = Number(selectedHizbId);
    return Number.isFinite(fromId) && fromId > 0 ? fromId : null;
  }, [contextGoals, selectedHizbId]);

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

  const hizbFilters = useMemo(() => {
    if (contextGoals.length > 0) {
      return buildMemorisationHizbAchievementFilters(contextGoals);
    }
    return getMemorisationHizbPastAchievementFilters();
  }, [contextGoals, refreshKey]);

  const hizbDisplayName =
    hizbFilters.find((filter) => filter.id === selectedHizbId)?.hizbName ?? "";

  const goalUnitLabel = useMemo(() => {
    const unit = String(achievementsApiData?.goal?.unit ?? "")
      .trim()
      .toLowerCase();
    if (unit.includes("hizb")) {
      return t("monthlyGoalPlanner.hizbUnit_other");
    }
    if (unit.includes("ayah") || unit.includes("verse")) {
      return t("progressLogging.unitAyahs");
    }
    if (selectedHizbId === "all") {
      return t("monthlyGoalPlanner.hizbUnit_other");
    }
    return t("progressLogging.unitAyahs");
  }, [achievementsApiData?.goal?.unit, selectedHizbId, t]);

  const mappedApi = useMemo(() => {
    if (!usesAchievementsApi) return null;
    if (!achievementsApiData) {
      return createEmptyMemorisationHizbAchievements(
        selectedHizbId,
        hizbDisplayName || "All Hizbs",
      );
    }
    return mapMemorisationHizbAchievementsToUi(achievementsApiData, period, {
      hizbId: selectedHizbId,
      hizbName: hizbDisplayName || "All Hizbs",
      goals: contextGoals,
    });
  }, [
    achievementsApiData,
    contextGoals,
    hizbDisplayName,
    period,
    selectedHizbId,
    usesAchievementsApi,
  ]);

  const allPeriodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.slice;
    return getQuranMemorisationHizbPastAchievementSlice(period, "all");
  }, [mappedApi, period, refreshKey, usesAchievementsApi]);

  const periodSlice = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.slice;
    return getQuranMemorisationHizbPastAchievementSlice(period, selectedHizbId);
  }, [mappedApi, period, refreshKey, selectedHizbId, usesAchievementsApi]);

  const hasLogs = useMemo(() => {
    if (usesAchievementsApi) {
      return (
        periodSlice.memorizedAyahs > 0 ||
        periodSlice.chartPeriods.some(
          (item) => item.completed > 0 || item.timeSpentMinutes > 0,
        )
      );
    }
    return hasMemorisationHizbPastAchievementLogs(periodSlice);
  }, [periodSlice, usesAchievementsApi]);

  const baseAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.achievement;
    return getQuranMemorisationHizbPastAchievement(period, selectedHizbId);
  }, [mappedApi, period, refreshKey, selectedHizbId, usesAchievementsApi]);

  const compactAchievement = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.compact;
    return getHizbMemorisationPastAchievement(selectedHizbId);
  }, [mappedApi, refreshKey, selectedHizbId, usesAchievementsApi]);

  const timeSpentByPeriod = useMemo(
    () => getMemorisationHizbTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyMemorisationHizbAnalyticsView(
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
        formatMemorisationHizbTimeSpentChip(Math.round(hours * 60));
    }
    return (value: number) =>
      t("progressLogging.memorisationAyahCount", {
        count: formatNumber(value),
      });
  }, [analyticsView, formatNumber, t]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalMemorisationHizbTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const goalTrackedMonths = getMemorisationHizbGoalTrackedMonths(period);
  const totalMemorizedVerses = getTotalHizbMemorizedVerses(periodSlice);

  const progressRailRows = useMemo(() => {
    if (usesAchievementsApi && mappedApi) return mappedApi.progressRailRows;
    return getMemorisationHizbProgressRailRows(
      allPeriodSlice,
      periodSlice,
      selectedHizbId,
      selectedBarIndex,
    );
  }, [
    allPeriodSlice,
    mappedApi,
    periodSlice,
    selectedBarIndex,
    selectedHizbId,
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
    if (initialHizbId) {
      setHizbFilter(initialHizbId);
    }
  }, [initialHizbId]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, selectedHizbId, analyticsView, periodStartParam]);

  useEffect(() => {
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

  const handleSelectHizbFilter = useCallback((id: MemorisationHizbFilterId) => {
    setHizbFilter(id);
    setPeriodStartParam(null);
    setSelectedBarIndex(null);
  }, []);

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        analyticsView,
        goalCategory: "hizb",
        goalType: "quran_memorisation_hizb",
        selectedHizbFilter:
          selectedHizbId === "all" ? undefined : selectedHizbId,
      },
    });
  }, [analyticsView, goalId, period, router, selectedHizbId]);

  const showChartHint =
    isDetailed && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const showDetailedStatsChevron = useMemo(() => {
    if (isDetailed) return false;
    if (showPlaceholders) return false;
    if ((compactAchievement.memorizedAyahs ?? 0) > 0) return true;
    if ((compactAchievement.progressPercent ?? 0) > 0) return true;
    return compactAchievement.chartData.some(
      (item) => (item.completedHours ?? 0) > 0,
    );
  }, [
    compactAchievement.chartData,
    compactAchievement.memorizedAyahs,
    compactAchievement.progressPercent,
    isDetailed,
    showPlaceholders,
  ]);

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
              : formatMemorisationHizbTimeSpentLabel(selectedPeriodTimeSpentMinutes)
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
          color={canNavigateBack ? Colors.light.white : Colors.light.subtext}
        />
      </TouchableOpacity>
      <Text style={styles.dateRange} numberOfLines={1} ellipsizeMode="tail">
        {showPlaceholders
          ? LOADING_DASH
          : baseAchievement.dateRangeLabel}
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
            canNavigateForward ? Colors.light.white : Colors.light.subtext
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderHizbFilterTabs = () => {
    if (!isDetailed) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.surahTabsRow}
      >
        {hizbFilters.map((filter) => {
          const isActive = selectedHizbId === filter.id;
          const label =
            filter.id === "all"
              ? t("progressLogging.hizbFilterAll")
              : filter.hizbName;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.7}
              onPress={() => handleSelectHizbFilter(filter.id)}
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
          {t("progressLogging.memorisationHizbDetailedSummaryBar", {
            range: selectedPeriod.dateLabel,
            memorized: formatNumber(selectedPeriod.completed),
            hizb:
              selectedHizbId === "all"
                ? t("progressLogging.memorisationAllHizbsTitle")
                : hizbDisplayName,
            percent: formatNumber(percent),
          })}
        </Text>
      );
    }

    const summaryKey =
      period === "monthly"
        ? "progressLogging.memorisationHizbDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.memorisationHizbDetailedSummaryThreeMonths"
          : "progressLogging.memorisationHizbDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          memorized: formatNumber(periodSlice.memorizedAyahs),
          total: formatNumber(periodSlice.totalAyahs),
          hizb:
            selectedHizbId === "all"
              ? t("progressLogging.memorisationAllHizbsTitle")
              : hizbDisplayName,
          delta: formatNumber(Math.abs(periodSlice.previousPeriodDeltaPercent)),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
        })}
      </Text>
    );
  };

  const renderInsights = () => {
    if (usesAchievementsApi) {
      if (insightCards.length === 0 && !showPlaceholders) return null;
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
            {(insightCards.length > 0
              ? insightCards
              : [
                  {
                    iconFamily: "Ionicons" as const,
                    iconName: "calendar-outline",
                    title: t("progressLogging.recitationInsightGoalTracked"),
                    value: LOADING_DASH,
                  },
                  {
                    iconFamily: "Ionicons" as const,
                    iconName: "book-outline",
                    title: t(
                      "progressLogging.memorisationInsightTotalMemorized",
                    ),
                    value: LOADING_DASH,
                  },
                ]
            ).map((card, index) => (
              <InsightCard
                key={`${card.title}-${index}`}
                iconName={card.iconName}
                icon={getMemorisationInsightIcon(card)}
                title={card.title}
                value={String(card.value ?? LOADING_DASH)}
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
            value={formatNumber(goalTrackedMonths)}
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
            value={formatNumber(totalMemorizedVerses)}
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

          {renderGoalHeader()}
          {renderAnalyticsToggle()}
          {renderCompletedIncompleteStats(showPlaceholders || showNoDataDash)}

          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={
                showPlaceholders || showNoDataDash
                  ? []
                  : (chartAchievement?.chartData ?? [])
              }
              selectedBarIndex={null}
              onBarPress={() => {}}
              chartKey={`${goalId}-${period}-${selectedHizbId}-${analyticsView}-${periodStartParam ?? "latest"}-${showPlaceholders ? "loading" : "ready"}-${refreshKey}`}
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
          {isHizbDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.memorisationHizbDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                hizb: hizbDisplayName,
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

        {renderDetailedSummary()}
        {renderHizbFilterTabs()}

        {renderGoalHeader()}
        {renderAnalyticsToggle()}
        {renderCompletedIncompleteStats(showPlaceholders || showNoDataDash)}

        {isHizbDrillDown && !hasLogs && !showPlaceholders ? (
          <View style={styles.emptyStateInline}>
            <Text style={styles.emptyStateText}>
              {t("progressLogging.memorisationHizbNoDataForPeriod")}
            </Text>
          </View>
        ) : null}

        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={
              showPlaceholders || showNoDataDash
                ? []
                : (chartAchievement?.chartData ?? [])
            }
            selectedBarIndex={
              showPlaceholders || showNoDataDash ? null : selectedBarIndex
            }
            onBarPress={handleBarPressDetailed}
            chartKey={`${goalId}-${period}-${selectedHizbId}-${analyticsView}-${periodStartParam ?? "latest"}-${showPlaceholders ? "loading" : "ready"}`}
            yMax={chartAchievement?.yMax ?? 10}
            yTicks={chartAchievement?.yTicks ?? [0, 5, 10]}
            showHint={showChartHint && !showPlaceholders && !showNoDataDash}
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
              <MemorisationHizbDetailCard
                key={`memorisation-hizb-rail-${row.hizbId}`}
                row={row}
                analyticsView={analyticsView}
                formatTimeChip={formatMemorisationHizbTimeSpentChip}
              />
            ))}
          </View>
        ) : null}
      </View>

      {renderInsights()}
    </View>
  );
}
