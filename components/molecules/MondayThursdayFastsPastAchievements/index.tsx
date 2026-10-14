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
  applyMondayThursdayAnalyticsView,
  formatMondayThursdayChartHoursLabel,
  formatMondayThursdayFastCountLabel,
  formatMondayThursdayFastTimeLabel,
  getMondayThursdayGoalTrackedMonths,
  getMondayThursdayTimeSpentByPeriod,
  getTotalMondayThursdayFastsCompleted,
  getTotalMondayThursdayTimeSpentMinutes,
  type MondayThursdayAnalyticsView,
  type MondayThursdayPeriodSlice,
} from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsPastAchievementData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { TopSpace } from "@/components/atoms/TopSpace";
import { FontAwesome } from "@expo/vector-icons";
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

const FASTING_INSIGHT_ICON_SIZE = 14;

function getMondayThursdayInsightIcon(card: InsightCardData) {
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

function toMondayThursdaySliceFromApi(
  slice: ReturnType<typeof mapFastingGoalAchievementsToMissedRamadan>["slice"],
): MondayThursdayPeriodSlice {
  return {
    chartPeriods: slice.chartPeriods,
    targetFasts: slice.targetFasts,
    completedFasts: slice.completedFasts,
    incompleteFasts: slice.incompleteFasts,
    achievementPercent: slice.achievementPercent,
    previousPeriodDeltaPercent: slice.previousPeriodDeltaPercent,
    dateRangeLabel: slice.dateRangeLabel,
    periodStartDate: slice.periodStartDate,
    periodEndDate: slice.periodEndDate,
    pageCount: slice.pageCount,
    activePageIndex: slice.activePageIndex,
    completedDates: slice.completedDates,
    missedDates: slice.skippedDates,
    upcomingDates: slice.upcomingDates,
    calendarMonthDate: slice.calendarMonthDate,
  };
}

type Props = {
  refreshKey?: number;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: MondayThursdayAnalyticsView;
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

const ANALYTICS_VIEWS: MondayThursdayAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTime",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<MondayThursdayAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTime: "progressLogging.analyticsCompletedVsTime",
};

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonths",
  sixMonths: "progressLogging.previousSixMonths",
};

const MON_THU_BAR_COLORS: [string, string] = [
  Colors.light.white,
  "rgba(255, 255, 255, 0.4)",
];
export function MondayThursdayFastsPastAchievements({
  refreshKey = 0,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
}: Props) {
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
    useState<MondayThursdayAnalyticsView>(initialAnalyticsView);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(
    null,
  );
  const [hintDismissed, setHintDismissed] = useState(false);
  const [apiPeriodStart, setApiPeriodStart] = useState<string | null>(null);
  const goalData = getGoalById("fasting-mondayThursday");
  const studyMaterial = goalData?.studyMaterial ?? [];

  const {
    data: achievementsApiData,
    isLoading: isAchievementsLoading,
    isFetching: isAchievementsFetching,
  } = useGetFastingGoalAchievements("MONDAY_THURSDAY", {
    period,
    periodStart: apiPeriodStart,
  });

  const mappedApi = useMemo(() => {
    if (!achievementsApiData) return null;
    return mapFastingGoalAchievementsToMissedRamadan(
      achievementsApiData,
      period,
    );
  }, [achievementsApiData, period]);

  const emptyApiMapped = useMemo(
    () => createEmptyMissedRamadanAchievements(period),
    [period],
  );

  const periodSlice = useMemo(() => {
    if (mappedApi) return toMondayThursdaySliceFromApi(mappedApi.slice);
    return toMondayThursdaySliceFromApi(emptyApiMapped.slice);
  }, [emptyApiMapped, mappedApi, refreshKey]);

  const baseAchievement = useMemo(() => {
    if (mappedApi) return mappedApi.achievement;
    return emptyApiMapped.achievement;
  }, [emptyApiMapped, mappedApi, refreshKey]);

  const achievement = useMemo(
    () =>
      applyMondayThursdayAnalyticsView(
        baseAchievement,
        periodSlice,
        analyticsView,
      ),
    [analyticsView, baseAchievement, periodSlice],
  );

  const timeSpentByPeriod = useMemo(
    () => getMondayThursdayTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const totalTimeSpentMinutes = useMemo(() => {
    if (mappedApi) return mappedApi.totalTimeSpentMinutes;
    return getTotalMondayThursdayTimeSpentMinutes(timeSpentByPeriod);
  }, [mappedApi, timeSpentByPeriod]);

  const goalTrackedMonths = getMondayThursdayGoalTrackedMonths(period);
  const totalFastsCompleted = getTotalMondayThursdayFastsCompleted(periodSlice);

  const apiInsightCards = useMemo(
    () =>
      mapFastingApiKeyInsightsToCards(achievementsApiData, {
        period,
        noDataLabel: t("progressLogging.previousMonth"),
        isLoading: isAchievementsLoading || isAchievementsFetching,
      }),
    [
      achievementsApiData,
      isAchievementsFetching,
      isAchievementsLoading,
      period,
      t,
    ],
  );

  const canNavigateBack =
    Boolean(mappedApi?.canNavigateBack) && !isAchievementsLoading;
  const canNavigateForward =
    Boolean(mappedApi?.canNavigateForward) && !isAchievementsLoading;

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
  }, [period, analyticsView, refreshKey, apiPeriodStart]);

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
        goalId: "fasting-mondayThursday",
        period,
        analyticsView:
          analyticsView === "completedVsTime"
            ? "completedVsTimeSpent"
            : "completedVsIncomplete",
        goalCategory: "fasting",
        goalType: "monday_thursday_fasts",
      },
    });
  }, [analyticsView, period, router]);

  const displayCompleted = selectedCalendarDate
    ? periodSlice.completedDates.includes(selectedCalendarDate)
      ? 1
      : 0
    : selectedBarIndex !== null
      ? (periodSlice.chartPeriods[selectedBarIndex]?.completed ?? 0)
      : periodSlice.completedFasts;
  const displayIncomplete = selectedCalendarDate
    ? periodSlice.missedDates.includes(selectedCalendarDate)
      ? 1
      : 0
    : selectedBarIndex !== null
      ? (periodSlice.chartPeriods[selectedBarIndex]?.incomplete ?? 0)
      : periodSlice.incompleteFasts;

  const apiLockedOrEmpty =
    Boolean(mappedApi?.locked) ||
    (!isAchievementsLoading &&
      (mappedApi == null ||
        (mappedApi.slice.completedFasts === 0 &&
          mappedApi.slice.incompleteFasts === 0 &&
          mappedApi.slice.chartPeriods.every(
            (p) => p.completed === 0 && p.incomplete === 0,
          ))));

  const showNoDataDash =
    isAchievementsLoading ||
    apiLockedOrEmpty ||
    (selectedCalendarDate == null &&
      isPastAchievementBarEmpty(displayCompleted, displayIncomplete));

  const selectedPeriodTimeSpentMinutes = selectedCalendarDate
    ? 0
    : selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const showCalendar = isDetailed
    ? period === "monthly"
    : period === "monthly" && analyticsView === "completedVsIncomplete";
  const showChart = !showCalendar;
  const showChartHint =
    showChart && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = achievement.previousPeriodDeltaPercent >= 0;

  const chartAchievement = useMemo(() => {
    if (!showChart) return null;
    if (analyticsView === "completedVsTime") {
      return applyTimeSpentOnlyGreenChart(achievement, timeSpentByPeriod);
    }
    return achievement;
  }, [analyticsView, achievement, showChart, timeSpentByPeriod]);

  const selectedBarGoalTotal = useMemo(() => {
    if (selectedBarIndex === null) return 0;
    const selectedBar = achievement.chartData[selectedBarIndex];
    if (!selectedBar) return periodSlice.targetFasts;
    return Math.max(
      selectedBar.stackTotalHours,
      displayCompleted + displayIncomplete,
      1,
    );
  }, [
    achievement.chartData,
    displayCompleted,
    displayIncomplete,
    periodSlice.targetFasts,
    selectedBarIndex,
  ]);

  const chartFormatBarValue =
    analyticsView === "completedVsTime"
      ? formatMondayThursdayChartHoursLabel
      : formatMondayThursdayFastCountLabel;

  const renderDetailedSummary = () => {
    if (!isDetailed) return null;

    const summaryKey =
      period === "monthly"
        ? "progressLogging.mondayThursdayDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.mondayThursdayDetailedSummaryThreeMonths"
          : "progressLogging.mondayThursdayDetailedSummarySixMonths";

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

  const renderFastingInsights = () => {
    if (apiInsightCards.length > 0) {
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
                icon={getMondayThursdayInsightIcon(card)}
                style={insightCardWidthStyle}
              />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (!isDetailed) return null;

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
        title: t("progressLogging.mondayThursdayInsightTotalCompleted"),
        value: formatNumber(totalFastsCompleted),
        subValue: t("progressLogging.mondayThursdayInsightFastsCompleted"),
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
              icon={getMondayThursdayInsightIcon(card)}
              style={insightCardWidthStyle}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.section, isDetailed && styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AchivementArrowIcon />
          <Text
            style={[styles.sectionTitle, isDetailed && styles.sectionTitleDetailed]}
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
                {isAchievementsLoading
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
            {t("progressLogging.achievementSummaryMondayThursday", {
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

        {isAchievementsLoading || isAchievementsFetching ? (
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

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.completed")}
            </Text>
            <Text style={styles.statValueCompleted}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatMondayThursdayFastCountLabel(displayCompleted)}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {analyticsView === "completedVsTime"
                ? t("progressLogging.timeSpentLabel")
                : t("progressLogging.incomplete")}
            </Text>
            <Text
              style={
                analyticsView === "completedVsTime"
                  ? styles.statValueTimeSpent
                  : styles.statValueIncomplete
              }
            >
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : analyticsView === "completedVsTime"
                  ? formatMondayThursdayFastTimeLabel(
                      selectedPeriodTimeSpentMinutes,
                    )
                  : formatMondayThursdayFastCountLabel(displayIncomplete)}
            </Text>
          </View>
        </View>

        {showCalendar ? (
          <>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDotFilled} />
                <Text style={styles.legendText}>
                  {t("progressLogging.mondayThursdayLegendCompletedFast")}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendWarningWrap}>
                  <View style={styles.legendDotMissed} />
                  <FontAwesome
                    name="warning"
                    size={5}
                    color={Colors.light.golden}
                  />
                </View>
                <Text style={styles.legendText}>
                  {t("progressLogging.mondayThursdayLegendMissedFast")}
                </Text>
              </View>
              {isDetailed ? (
                <View style={styles.legendItem}>
                  <View style={styles.legendDotUpcoming} />
                  <Text style={styles.legendText}>
                    {t("progressLogging.mondayThursdayLegendUpcomingFast")}
                  </Text>
                </View>
              ) : null}
            </View>
            <TopSpace top={12} />
            <CalendarGrid
              mode="monday_thursday_achievement"
              currentDate={periodSlice.calendarMonthDate}
              completedFastDates={periodSlice.completedDates}
              missedFastDates={periodSlice.missedDates}
              incompletePlannedFastDates={periodSlice.upcomingDates}
              onDayPress={isDetailed ? handleCalendarDayPress : undefined}
              selectedDate={selectedCalendarDate ?? undefined}
              bgColor={Colors.light.greybuttonBackground}
            />
            {isDetailed && selectedCalendarDate ? (
              <GraphBarSelectionFooter
                visible={selectedCalendarDate !== null}
                completed={displayCompleted}
                incomplete={displayIncomplete}
                goalTotal={Math.max(displayCompleted + displayIncomplete, 1)}
                onClose={handleCloseCalendarSelection}
              />
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
              chartKey={`monday-thursday-${period}-${analyticsView}-${apiPeriodStart ?? "current"}-${refreshKey}-${isDetailed ? "detailed" : "compact"}`}
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
                analyticsView === "completedVsTime"
                  ? [Colors.light.white, Colors.light.white]
                  : MON_THU_BAR_COLORS
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
    backgroundColor: Colors.light.ringMonThu,
  },
  legendDotMissed: {
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
    borderColor: Colors.light.ringMonThu,
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
  insightsSection: {
    marginTop: 16,
    gap: 12,
  },
  insightsHeader: {
    gap: 2,
  },
  insightsTitleLabel: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightsSubtitleLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  insightsScrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  insightCardFixed: {
    width: 160,
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
