import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { AchivementArrowIcon } from "@/assets/icons/AchivementArrowIcon";
import {
  InsightCardFlashIcon,
  InsightCardGoalTrackedIcon,
  InsightCardTickIcon,
  InsightCardTimeSpentIcon,
  InsightCardWeeklyAverageIcon,
} from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  applyMissedRamadanAnalyticsView,
  formatMissedRamadanChartHoursLabel,
  formatMissedRamadanFastCountLabel,
  formatMissedRamadanFastTimeLabel,
  getMissedRamadanFastsPastAchievement,
  getMissedRamadanFastsPastAchievementSlice,
  getMissedRamadanTimeSpentByPeriod,
  getMissedRamadanGoalTrackedMonths,
  getMissedRamadanFastTimeSpentForDate,
  getTotalMissedRamadanFastsCompleted,
  getTotalMissedRamadanTimeSpentMinutes,
  isMissedRamadanFastCompletedOnDate,
  isMissedRamadanFastSkippedOnDate,
  type MissedRamadanAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsPastAchievementData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import {
  applyProphetDawoodAnalyticsView,
  formatDawoodAchievementHijriFooter,
  formatProphetDawoodChartHoursLabel,
  formatProphetDawoodFastCountLabel,
  formatProphetDawoodFastTimeLabel,
  getProphetDawoodFastsPastAchievement,
  getProphetDawoodFastsPastAchievementSlice,
  getProphetDawoodGoalTrackedMonths,
  getProphetDawoodFastTimeSpentForDate,
  getProphetDawoodTimeSpentByPeriod,
  getTotalProphetDawoodFastsCompleted,
  getTotalProphetDawoodTimeSpentMinutes,
  isProphetDawoodFastCompletedOnDate,
  isProphetDawoodFastMissedOnDate,
  type ProphetDawoodAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsPastAchievementData";
import { TopSpace } from "@/components/atoms/TopSpace";
import { FontAwesome } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { InsightCard } from "../InsightCard";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { useGetFastingGoalAchievements } from "@/src/api/queries/useGetFastingGoalAchievements";
import {
  createEmptyMissedRamadanAchievements,
  mapFastingApiKeyInsightsToCards,
  mapFastingGoalAchievementsToMissedRamadan,
  shiftFastingAchievementsPeriodStart,
} from "@/src/utils/fastingGoalAchievementsMap";

type Props = {
  refreshKey?: number;
  variant?: "missedRamadan" | "prophetDawood";
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?:
  | MissedRamadanAnalyticsView
  | ProphetDawoodAnalyticsView;
};

const FASTING_INSIGHT_ICON_SIZE = 14;

function getMissedRamadanInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={FASTING_INSIGHT_ICON_SIZE} />;
  }
  if (name === "checkmark-circle-outline" || title.includes("COMPLETED")) {
    return <InsightCardTickIcon size={FASTING_INSIGHT_ICON_SIZE} />;
  }
  if (name === "flash" || title.includes("STREAK")) {
    return <InsightCardFlashIcon size={FASTING_INSIGHT_ICON_SIZE} />;
  }
  if (name === "scale-balance" || title.includes("AVERAGE")) {
    return <InsightCardWeeklyAverageIcon size={FASTING_INSIGHT_ICON_SIZE} />;
  }
  if (name === "time-outline" || title.includes("TIME")) {
    return <InsightCardTimeSpentIcon size={FASTING_INSIGHT_ICON_SIZE} />;
  }
  return undefined;
}

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

const ANALYTICS_VIEWS: MissedRamadanAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTime",
];

const DAWOOD_ANALYTICS_VIEWS: ProphetDawoodAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTime",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<MissedRamadanAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTime: "progressLogging.analyticsCompletedVsTime",
};

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonths",
  sixMonths: "progressLogging.previousSixMonths",
};

const RAMADAN_BAR_COLORS: [string, string] = [
  Colors.light.white,
  "rgba(255, 255, 255, 0.4)",
];
const DAWOOD_BAR_COLORS: [string, string] = [
  Colors.light.white,
  "rgba(255, 255, 255, 0.4)",
];
export function MissedRamadanFastsPastAchievements({
  refreshKey = 0,
  variant = "missedRamadan",
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
}: Props) {
  const isDawood = variant === "prophetDawood";
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const formatNumber = useLocaleNumber();
  const insightCardWidthStyle = useMemo(
    () => ({
      ...styles.insightCardFixed,
      width: width * 0.42,
      maxWidth: width * 0.42,
      minWidth: width * 0.42,
    }),
    [width],
  );
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [analyticsView, setAnalyticsView] =
    useState<MissedRamadanAnalyticsView>(initialAnalyticsView);
  const [dawoodAnalyticsView, setDawoodAnalyticsView] =
    useState<ProphetDawoodAnalyticsView>(
      isDawood
        ? ((initialAnalyticsView as ProphetDawoodAnalyticsView) ??
          "completedVsIncomplete")
        : "completedVsIncomplete",
    );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [apiPeriodStart, setApiPeriodStart] = useState<string | null>(null);
  const goalData = getGoalById(isDawood ? "fasting-Dawwod" : "fasting-ramadan");
  const studyMaterial = goalData?.studyMaterial ?? [];

  const usesAchievementsApi = !isDawood;
  const {
    data: achievementsApiData,
    isLoading: isAchievementsLoading,
    isFetching: isAchievementsFetching,
  } = useGetFastingGoalAchievements("MISSED_RAMADAN", {
    period,
    periodStart: apiPeriodStart,
    enabled: usesAchievementsApi,
  });

  const mappedApi = useMemo(() => {
    if (!usesAchievementsApi || !achievementsApiData) return null;
    return mapFastingGoalAchievementsToMissedRamadan(
      achievementsApiData,
      period,
    );
  }, [achievementsApiData, period, usesAchievementsApi]);

  const emptyApiMapped = useMemo(
    () => createEmptyMissedRamadanAchievements(period),
    [period],
  );

  const periodSlice = useMemo(() => {
    if (isDawood) return getProphetDawoodFastsPastAchievementSlice(period);
    if (mappedApi) return mappedApi.slice;
    if (usesAchievementsApi) return emptyApiMapped.slice;
    return getMissedRamadanFastsPastAchievementSlice(period);
  }, [
    emptyApiMapped,
    isDawood,
    mappedApi,
    period,
    refreshKey,
    usesAchievementsApi,
  ]);

  const baseAchievement = useMemo(() => {
    if (isDawood) return getProphetDawoodFastsPastAchievement(period);
    if (mappedApi) return mappedApi.achievement;
    if (usesAchievementsApi) return emptyApiMapped.achievement;
    return getMissedRamadanFastsPastAchievement(period);
  }, [
    emptyApiMapped,
    isDawood,
    mappedApi,
    period,
    refreshKey,
    usesAchievementsApi,
  ]);

  const timeSpentByPeriod = useMemo(
    () =>
      isDawood
        ? getProphetDawoodTimeSpentByPeriod(
          periodSlice as ReturnType<
            typeof getProphetDawoodFastsPastAchievementSlice
          >,
        )
        : getMissedRamadanTimeSpentByPeriod(
          periodSlice as ReturnType<
            typeof getMissedRamadanFastsPastAchievementSlice
          >,
        ),
    [isDawood, periodSlice],
  );

  const activeAnalyticsView = isDawood ? dawoodAnalyticsView : analyticsView;

  const achievement = useMemo(() => {
    if (isDawood) {
      return applyProphetDawoodAnalyticsView(
        baseAchievement,
        periodSlice as ReturnType<
          typeof getProphetDawoodFastsPastAchievementSlice
        >,
        dawoodAnalyticsView,
      );
    }
    return applyMissedRamadanAnalyticsView(
      baseAchievement,
      periodSlice as ReturnType<
        typeof getMissedRamadanFastsPastAchievementSlice
      >,
      analyticsView,
    );
  }, [
    analyticsView,
    baseAchievement,
    dawoodAnalyticsView,
    isDawood,
    periodSlice,
  ]);

  const totalTimeSpentMinutes = useMemo(() => {
    if (isDawood) {
      return getTotalProphetDawoodTimeSpentMinutes(timeSpentByPeriod);
    }
    if (mappedApi) return mappedApi.totalTimeSpentMinutes;
    return getTotalMissedRamadanTimeSpentMinutes(timeSpentByPeriod);
  }, [isDawood, mappedApi, timeSpentByPeriod]);

  const dawoodPeriodSlice = isDawood
    ? (periodSlice as ReturnType<
      typeof getProphetDawoodFastsPastAchievementSlice
    >)
    : null;

  const goalTrackedMonths = isDawood
    ? getProphetDawoodGoalTrackedMonths(period)
    : getMissedRamadanGoalTrackedMonths(period);
  const totalFastsCompleted = isDawood
    ? dawoodPeriodSlice
      ? getTotalProphetDawoodFastsCompleted(dawoodPeriodSlice)
      : 0
    : getTotalMissedRamadanFastsCompleted(
      periodSlice as ReturnType<
        typeof getMissedRamadanFastsPastAchievementSlice
      >,
    );

  const apiInsightCards = useMemo(() => {
    if (!usesAchievementsApi) return [] as InsightCardData[];
    return mapFastingApiKeyInsightsToCards(achievementsApiData, {
      period,
      noDataLabel: t("progressLogging.previousMonth"),
      isLoading: isAchievementsLoading || isAchievementsFetching,
    });
  }, [
    achievementsApiData,
    isAchievementsFetching,
    isAchievementsLoading,
    period,
    t,
    usesAchievementsApi,
  ]);

  const canNavigateBack =
    usesAchievementsApi && !!mappedApi?.canNavigateBack && !isAchievementsLoading;
  const canNavigateForward =
    usesAchievementsApi &&
    !!mappedApi?.canNavigateForward &&
    !isAchievementsLoading;

  const handlePrevPeriod = useCallback(() => {
    if (!canNavigateBack || !mappedApi) return;
    const next = shiftFastingAchievementsPeriodStart(
      mappedApi.periodStart,
      mappedApi.periodEnd,
      -1,
    );
    if (next) setApiPeriodStart(next);
  }, [canNavigateBack, mappedApi]);

  const handleNextPeriod = useCallback(() => {
    if (!canNavigateForward || !mappedApi) return;
    const next = shiftFastingAchievementsPeriodStart(
      mappedApi.periodStart,
      mappedApi.periodEnd,
      1,
    );
    if (next) setApiPeriodStart(next);
  }, [canNavigateForward, mappedApi]);

  useEffect(() => {
    setApiPeriodStart(null);
  }, [period]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setSelectedCalendarDate(null);
    setHintDismissed(false);
  }, [period, analyticsView, dawoodAnalyticsView, refreshKey, apiPeriodStart]);

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

  const handleCalendarDayPress = useCallback((date: string) => {
    setSelectedCalendarDate((current) => (current === date ? null : date));
  }, []);

  const handleCloseCalendarSelection = useCallback(() => {
    setSelectedCalendarDate(null);
  }, []);

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId: isDawood ? "fasting-Dawwod" : "fasting-ramadan",
        period,
        analyticsView:
          activeAnalyticsView === "completedVsTime"
            ? "completedVsTimeSpent"
            : "completedVsIncomplete",
        goalCategory: "fasting",
        goalType: isDawood ? "prophet_dawood_fasts" : "missed_ramadan_fasts",
      },
    });
  }, [activeAnalyticsView, isDawood, period, router]);

  const missedRamadanSliceForDates = !isDawood
    ? (periodSlice as ReturnType<
        typeof getMissedRamadanFastsPastAchievementSlice
      >)
    : null;

  const displayCompleted = selectedCalendarDate
    ? isDawood
      ? isProphetDawoodFastCompletedOnDate(selectedCalendarDate)
        ? 1
        : 0
      : usesAchievementsApi
        ? missedRamadanSliceForDates?.completedDates.includes(
            selectedCalendarDate,
          )
          ? 1
          : 0
        : isMissedRamadanFastCompletedOnDate(selectedCalendarDate)
          ? 1
          : 0
    : selectedBarIndex !== null
      ? (periodSlice.chartPeriods[selectedBarIndex]?.completed ?? 0)
      : periodSlice.completedFasts;
  const displayIncomplete = selectedCalendarDate
    ? isDawood
      ? dawoodPeriodSlice &&
        isProphetDawoodFastMissedOnDate(selectedCalendarDate, dawoodPeriodSlice)
        ? 1
        : 0
      : usesAchievementsApi
        ? missedRamadanSliceForDates?.skippedDates.includes(selectedCalendarDate) ||
          missedRamadanSliceForDates?.incompletePlannedDates.includes(
            selectedCalendarDate,
          )
          ? 1
          : 0
        : isMissedRamadanFastSkippedOnDate(selectedCalendarDate)
          ? 1
          : 0
    : selectedBarIndex !== null
      ? (periodSlice.chartPeriods[selectedBarIndex]?.incomplete ?? 0)
      : periodSlice.incompleteFasts;

  const apiLockedOrEmpty =
    usesAchievementsApi &&
    (Boolean(mappedApi?.locked) ||
      (!isAchievementsLoading &&
        (mappedApi == null ||
          (mappedApi.slice.completedFasts === 0 &&
            mappedApi.slice.incompleteFasts === 0 &&
            mappedApi.slice.chartPeriods.every(
              (p) => p.completed === 0 && p.incomplete === 0,
            )))));

  const showNoDataDash =
    (usesAchievementsApi &&
      (isAchievementsLoading || apiLockedOrEmpty)) ||
    (selectedCalendarDate == null &&
      isPastAchievementBarEmpty(displayCompleted, displayIncomplete));

  const selectedPeriodTimeSpentMinutes = selectedCalendarDate
    ? isDawood
      ? getProphetDawoodFastTimeSpentForDate(selectedCalendarDate)
      : usesAchievementsApi
        ? 0
        : getMissedRamadanFastTimeSpentForDate(selectedCalendarDate)
    : selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const showCalendar = isDetailed
    ? period === "monthly"
    : period === "monthly" && activeAnalyticsView === "completedVsIncomplete";
  const showChart = !showCalendar;
  const showChartHint =
    showChart && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const chartAchievement = useMemo(() => {
    if (!showChart) return null;
    if (activeAnalyticsView === "completedVsTime") {
      return applyTimeSpentOnlyGreenChart(baseAchievement, timeSpentByPeriod);
    }
    return baseAchievement;
  }, [activeAnalyticsView, baseAchievement, showChart, timeSpentByPeriod]);

  const selectedBarGoalTotal = useMemo(() => {
    if (selectedBarIndex === null) return 0;
    const selectedBar = baseAchievement.chartData[selectedBarIndex];
    if (!selectedBar) return periodSlice.targetFasts;
    return Math.max(
      selectedBar.stackTotalHours,
      displayCompleted + displayIncomplete,
      1,
    );
  }, [
    baseAchievement.chartData,
    displayCompleted,
    displayIncomplete,
    periodSlice.targetFasts,
    selectedBarIndex,
  ]);

  const missedRamadanSlice = !isDawood
    ? (periodSlice as ReturnType<
      typeof getMissedRamadanFastsPastAchievementSlice
    >)
    : null;

  const renderFastingInsights = () => {
    if (!isDawood && apiInsightCards.length > 0) {
      return (
        <View style={styles.insightsSection}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitleLabel}>
              {t("progressLogging.keyInsights")}
            </Text>
            <Text style={styles.insightsSubtitleLabel}>
              {mappedApi?.keyInsightsHeader?.trim() ||
                (period === "monthly"
                  ? "VS. LAST MONTH"
                  : period === "threeMonths"
                    ? "VS. LAST 3 MONTHS"
                    : "VS. LAST 6 MONTHS")}
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
                icon={getMissedRamadanInsightIcon(card)}
                style={insightCardWidthStyle}
              />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (isDetailed) {
      const totalCompletedTitle = isDawood
        ? t("progressLogging.dawoodInsightTotalCompleted")
        : t("progressLogging.missedRamadanInsightTotalCompleted");
      const totalCompletedSub = isDawood
        ? t("progressLogging.dawoodInsightFastsCompleted")
        : t("progressLogging.missedRamadanInsightFastsCompleted");

      const detailedCards: InsightCardData[] = [
        {
          iconFamily: "Ionicons",
          iconName: "calendar-outline",
          title: t("progressLogging.recitationInsightGoalTracked"),
          value: formatNumber(goalTrackedMonths),
          subValue: t("progressLogging.recitationInsightMonths"),
        },
        {
          iconFamily: "Ionicons",
          iconName: "checkmark-circle-outline",
          title: totalCompletedTitle,
          value: formatNumber(totalFastsCompleted),
          subValue: totalCompletedSub,
        },
      ];

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
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.insightsScrollContent}
          >
            {detailedCards.map((card, index) => (
              <InsightCard
                key={`${card.title}-${index}`}
                {...card}
                icon={getMissedRamadanInsightIcon(card)}
                style={insightCardWidthStyle}
              />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (!isDawood || !dawoodPeriodSlice || period === "monthly") {
      return null;
    }

    const dawoodCards: InsightCardData[] = [
      {
        iconFamily: "Ionicons",
        iconName: "calendar-outline",
        title: t("progressLogging.dawoodInsightGoalTracked"),
        value: formatNumber(dawoodPeriodSlice.trackedMonths),
        subValue: t("progressLogging.dawoodInsightMonths"),
      },
      {
        iconFamily: "Ionicons",
        iconName: "sync-outline",
        title: t("progressLogging.dawoodInsightCycles"),
        value: formatNumber(dawoodPeriodSlice.cycleCount),
        subValue: t("progressLogging.dawoodInsightCyclesUnit"),
      },
    ];

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>
            {period === "threeMonths"
              ? t("progressLogging.dawoodInsightsVsLast3Months")
              : t("progressLogging.dawoodInsightsVsLast6Months")}
          </Text>
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          {dawoodCards.map((card, index) => (
            <InsightCard
              key={`${card.title}-${index}`}
              {...card}
              icon={getMissedRamadanInsightIcon(card)}
              style={insightCardWidthStyle}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderDetailedSummary = () => {
    if (!isDetailed) return null;

    const summaryKey = isDawood
      ? period === "monthly"
        ? "progressLogging.dawoodDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.dawoodDetailedSummaryThreeMonths"
          : "progressLogging.dawoodDetailedSummarySixMonths"
      : period === "monthly"
        ? "progressLogging.missedRamadanDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.missedRamadanDetailedSummaryThreeMonths"
          : "progressLogging.missedRamadanDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          completed: formatNumber(periodSlice.completedFasts),
          total: formatNumber(periodSlice.targetFasts),
          delta: formatNumber(Math.abs(periodSlice.previousPeriodDeltaPercent)),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
        })}
      </Text>
    );
  };

  const chartFormatBarValue = isDawood
    ? activeAnalyticsView === "completedVsTime"
      ? formatProphetDawoodChartHoursLabel
      : formatProphetDawoodFastCountLabel
    : analyticsView === "completedVsTime"
      ? formatMissedRamadanChartHoursLabel
      : formatMissedRamadanFastCountLabel;

  return (
    <View style={[styles.section, isDetailed && styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AchivementArrowIcon />
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
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatNumber(baseAchievement.achievementPercent)}
              <Text
                style={
                  isDetailed
                    ? styles.achievementPercentSymbolDetailed
                    : styles.achievementPercentSymbol
                }
              >
                %
              </Text>
            </Text>
            <View
              style={[
                styles.deltaBadge,
                isDetailed && !deltaIsPositive && styles.deltaBadgeNegative,
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
                  isDetailed && !deltaIsPositive && styles.deltaTextNegative,
                  !isDetailed && {
                    color: deltaIsPositive
                      ? Colors.light.green
                      : Colors.light.white,
                  },
                ]}
              >
                {deltaIsPositive ? "+" : ""}
                {formatNumber(baseAchievement.previousPeriodDeltaPercent)}%{" "}
                {t(
                  isDetailed
                    ? PERIOD_DELTA_LABEL_KEYS[period]
                    : "progressLogging.previousMonth",
                )}
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
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navBtn}
                disabled={!canNavigateBack}
                onPress={handlePrevPeriod}
              >
                <Ionicons
                  name="chevron-back"
                  size={isDetailed ? 24 : 14}
                  color={
                    canNavigateBack
                      ? Colors.light.dullWhite
                      : Colors.light.graylightshade
                  }
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {usesAchievementsApi && isAchievementsLoading
                  ? "---"
                  : baseAchievement.dateRangeLabel || "---"}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navBtn}
                disabled={!canNavigateForward}
                onPress={handleNextPeriod}
              >
                <Ionicons
                  name="chevron-forward"
                  size={isDetailed ? 24 : 14}
                  color={
                    canNavigateForward
                      ? Colors.light.dullWhite
                      : Colors.light.graylightshade
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isDetailed ? (
          renderDetailedSummary()
        ) : (
          <Text style={styles.summaryText}>
            {t(
              isDawood
                ? "progressLogging.achievementSummaryDawood"
                : "progressLogging.achievementSummaryMissedRamadan",
              {
                percent: formatNumber(baseAchievement.achievementPercent),
                delta: formatNumber(
                  Math.abs(baseAchievement.previousPeriodDeltaPercent),
                ),
                direction: deltaIsPositive
                  ? t("progressLogging.periodComparisonIncrease")
                  : t("progressLogging.periodComparisonDecrease"),
              },
            )}
          </Text>
        )}

        {usesAchievementsApi &&
        (isAchievementsLoading || isAchievementsFetching) ? (
          <View style={{ alignItems: "center", paddingVertical: 8 }}>
            <ActivityIndicator color={Colors.light.white} />
          </View>
        ) : null}

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalPillValue}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatNumber(periodSlice.targetFasts)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {t("progressLogging.unitFasts")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.analyticsToggle}>
          {(isDawood ? DAWOOD_ANALYTICS_VIEWS : ANALYTICS_VIEWS).map((view) => {
            const isActive = activeAnalyticsView === view;
            return (
              <Pressable
                key={view}
                onPress={() =>
                  isDawood
                    ? setDawoodAnalyticsView(view)
                    : setAnalyticsView(view)
                }
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

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.completed")}
            </Text>
            <Text
              style={
                isDawood
                  ? styles.statValueCompletedDawood
                  : isDetailed
                    ? styles.statValueCompletedRamadan
                    : styles.statValueCompleted
              }
            >
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : isDawood
                  ? formatProphetDawoodFastCountLabel(displayCompleted)
                  : formatMissedRamadanFastCountLabel(displayCompleted)}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {!isDawood && analyticsView === "completedVsTime"
                ? t("progressLogging.timeSpentLabel")
                : isDawood && dawoodAnalyticsView === "completedVsTime"
                  ? t("progressLogging.timeSpentLabel")
                  : t("progressLogging.incomplete")}
            </Text>
            <Text
              style={
                (!isDawood && analyticsView === "completedVsTime") ||
                  (isDawood && dawoodAnalyticsView === "completedVsTime")
                  ? styles.statValueTimeSpent
                  : styles.statValueIncomplete
              }
            >
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : !isDawood && analyticsView === "completedVsTime"
                  ? formatMissedRamadanFastTimeLabel(
                      selectedPeriodTimeSpentMinutes,
                    )
                  : isDawood && dawoodAnalyticsView === "completedVsTime"
                    ? formatProphetDawoodFastTimeLabel(
                        selectedPeriodTimeSpentMinutes,
                      )
                    : isDawood
                      ? formatProphetDawoodFastCountLabel(displayIncomplete)
                      : formatMissedRamadanFastCountLabel(displayIncomplete)}
            </Text>
          </View>
        </View>

        {showCalendar ? (
          <>
            <View style={styles.legendRow}>
              {isDawood ? (
                <>
                  <View style={styles.legendItem}>
                    <Feather
                      name="refresh-ccw"
                      size={12}
                      color={Colors.light.ringDawood}
                    />
                    <Text style={styles.legendText}>
                      {t("progressLogging.dawoodLegendNewCycleStart")}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendDotFilledDawood} />
                    <Text style={styles.legendText}>
                      {t("progressLogging.dawoodLegendCompletedFast")}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendIncompleteDawood}>
                      <FontAwesome
                        name="warning"
                        size={5}
                        color={Colors.light.warning}
                      />
                    </View>
                    <Text style={styles.legendText}>
                      {t("progressLogging.dawoodLegendIncompletePlannedFast")}
                    </Text>
                  </View>
                  {isDetailed ? (
                    <View style={styles.legendItem}>
                      <View style={styles.legendDotUpcomingDawood} />
                      <Text style={styles.legendText}>
                        {t("progressLogging.dawoodLegendUpcomingFast")}
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <>
                  <View style={styles.legendItem}>
                    <View style={styles.legendDotFilled} />
                    <Text style={styles.legendText}>
                      {t("progressLogging.missedRamadanLegendCompletedFast")}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendWarningWrap}>
                      <View style={styles.legendDotSkipped} />
                      <FontAwesome
                        name="warning"
                        size={5}
                        color={Colors.light.warning}
                      />
                    </View>
                    <Text style={styles.legendText}>
                      {t(
                        "progressLogging.missedRamadanLegendIncompletePlanned",
                      )}
                    </Text>
                  </View>
                  {isDetailed ? (
                    <View style={styles.legendItem}>
                      <View style={styles.legendDotUpcoming} />
                      <Text style={styles.legendText}>
                        {t("progressLogging.missedRamadanLegendUpcomingFast")}
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
            <TopSpace top={12} />
            {isDawood && dawoodPeriodSlice ? (
              <CalendarGrid
                mode="dawood_achievement"
                currentDate={dawoodPeriodSlice.calendarMonthDate}
                completedFastDates={dawoodPeriodSlice.completedDates}
                missedFastDates={dawoodPeriodSlice.missedDates}
                incompletePlannedFastDates={dawoodPeriodSlice.upcomingDates}
                cycleRestartDate={
                  dawoodPeriodSlice.hasCycleReset
                    ? dawoodPeriodSlice.cycleRestartDate
                    : null
                }
                onDayPress={isDetailed ? handleCalendarDayPress : undefined}
                selectedDate={selectedCalendarDate ?? undefined}
                bgColor={Colors.light.greybuttonBackground}
              />
            ) : (
              <CalendarGrid
                mode="missed_ramadan_achievement"
                currentDate={
                  periodSlice.calendarMonthDate ||
                  periodSlice.periodStartDate ||
                  new Date().toISOString().slice(0, 8) + "01"
                }
                completedFastDates={missedRamadanSlice?.completedDates ?? []}
                missedFastDates={missedRamadanSlice?.skippedDates ?? []}
                incompletePlannedFastDates={
                  missedRamadanSlice?.upcomingDates ?? []
                }
                onDayPress={isDetailed ? handleCalendarDayPress : undefined}
                selectedDate={selectedCalendarDate ?? undefined}
                bgColor={Colors.light.greybuttonBackground}
              />
            )}
            {isDetailed && selectedCalendarDate ? (
              <GraphBarSelectionFooter
                visible={selectedCalendarDate !== null}
                completed={displayCompleted}
                incomplete={displayIncomplete}
                goalTotal={Math.max(displayCompleted + displayIncomplete, 1)}
                onClose={handleCloseCalendarSelection}
              />
            ) : null}
            {isDawood && dawoodPeriodSlice && !isDetailed ? (
              <View style={styles.hijriFooterRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={Colors.light.subtext}
                />
                <Text style={styles.hijriFooterText}>
                  {formatDawoodAchievementHijriFooter(
                    dawoodPeriodSlice.periodStartDate,
                    dawoodPeriodSlice.periodEndDate,
                  )}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={chartAchievement?.chartData ?? achievement.chartData}
              selectedBarIndex={selectedBarIndex}
              onBarPress={
                isDetailed ? handleBarPressDetailed : handleBarPressCompact
              }
              chartKey={`${isDawood ? "prophet-dawood" : "missed-ramadan"}-${period}-${activeAnalyticsView}-${refreshKey}-${isDetailed ? "detailed" : "compact"}`}
              yMax={chartAchievement?.yMax ?? achievement.yMax}
              yTicks={chartAchievement?.yTicks ?? achievement.yTicks}
              showHint={showChartHint}
              onDismissHint={() => setHintDismissed(true)}
              hintText={t("progressLogging.chartTapHint")}
              hintActionText={t("progressLogging.okGotIt")}
              pageCount={chartAchievement?.pageCount ?? achievement.pageCount}
              activePageIndex={
                selectedBarIndex ??
                chartAchievement?.activePageIndex ??
                achievement.activePageIndex
              }
              formatBarValue={chartFormatBarValue}
              barColors={
                isDawood
                  ? activeAnalyticsView === "completedVsTime"
                    ? [Colors.light.white, Colors.light.white]
                    : DAWOOD_BAR_COLORS
                  : activeAnalyticsView === "completedVsTime"
                    ? [Colors.light.white, Colors.light.white]
                    : RAMADAN_BAR_COLORS
              }
              valueLabelColor={Colors.light.white}
              showPagination={isDetailed}
            />
            {isDetailed ? (
              <GraphBarSelectionFooter
                visible={selectedBarIndex !== null}
                completed={displayCompleted}
                incomplete={displayIncomplete}
                goalTotal={selectedBarGoalTotal}
                onClose={handleCloseBarSelection}
              />
            ) : null}
          </View>
        )}
      </View>
      {renderFastingInsights()}
      <PastAchievementStudyMaterial
        items={studyMaterial}
        isDetailed={isDetailed}
      />
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
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
    lineHeight: 22,
    transform: [{ translateY: -8 }],
  },
  achievementPercentDetailed: {
    fontSize: 48,
    lineHeight: 52,
  },
  achievementPercentSymbolDetailed: {
    fontSize: 24,
    lineHeight: 24,
    transform: [{ translateY: -10 }],
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.calendarBg,
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
  deltaBadgeNegative: {
    backgroundColor: Colors.light.calendarBg,
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
  },
  periodButton: {
    borderRadius: 5,
    paddingVertical: 6,
    width: 46,
    alignItems: "center",
    justifyContent: "center",
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
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueCompletedRamadan: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueCompletedDawood: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueIncomplete: {
    color: Colors.light.white,
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
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
    backgroundColor: Colors.light.calendarBg,
    padding: 12,
    borderRadius: 6,
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendWarningWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  legendDotFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.ringRamadan,
  },
  legendDotOutlined: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.ringRamadan,
    backgroundColor: "transparent",
  },
  legendDotSkipped: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.warning,
    backgroundColor: "transparent",
  },
  legendDotUpcoming: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.ringRamadan,
    backgroundColor: "transparent",
    opacity: 0.65,
  },
  legendDotFilledDawood: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.ringDawood,
  },
  legendDotOutlinedDawood: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.ringDawood,
    backgroundColor: "transparent",
  },
  legendIncompleteDawood: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: Colors.light.warning,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  legendDotUpcomingDawood: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.ringDawood,
    backgroundColor: "transparent",
    opacity: 0.65,
  },
  legendText: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  hijriFooterRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
  },
  hijriFooterText: {
    flex: 1,
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 16,
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
    paddingRight: 20,
  },
  insightCardFixed: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
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
