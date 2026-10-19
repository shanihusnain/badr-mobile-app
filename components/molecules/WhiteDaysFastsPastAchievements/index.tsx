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
  NegativeProgressIcon,
  PositiveProgressIcon,
} from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { useGetMenstruationPeriods } from "@/src/api/queries/useGetMenstruationPeriods";
import { useGetFastingGoalFrame } from "@/src/api/queries/useGetFastingGoalFrame";
import { useGetFastingGoalAchievements } from "@/src/api/queries/useGetFastingGoalAchievements";
import { expandMenstruationPeriodDates } from "@/src/utils/menstruationDates";
import {
  createEmptyMissedRamadanAchievements,
  mapFastingApiKeyInsightsToCards,
  mapFastingGoalAchievementsToMissedRamadan,
  shiftFastingAchievementsPeriodStart,
} from "@/src/utils/fastingGoalAchievementsMap";
import { PLANNED_FASTS } from "@/src/screens/private/home/plannedFasts";
import {
  applyWhiteDaysAnalyticsView,
  formatWhiteDaysChartHoursLabel,
  formatWhiteDaysFastCountLabel,
  formatWhiteDaysFastTimeSpentLabel,
  getTotalWhiteDaysTimeSpentMinutes,
  getWhiteDaysGoalTrackedMonths,
  getWhiteDaysTimeSpentByPeriod,
  type WhiteDaysAnalyticsView,
  type WhiteDaysPeriodSlice,
} from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsPastAchievementData";

function toWhiteDaysSliceFromApi(
  slice: ReturnType<typeof mapFastingGoalAchievementsToMissedRamadan>["slice"],
): WhiteDaysPeriodSlice {
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

const WHITE_DAYS_INSIGHT_ICON_SIZE = 14;

function getWhiteDaysInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={WHITE_DAYS_INSIGHT_ICON_SIZE} />;
  }
  if (name === "checkmark-circle-outline" || title.includes("COMPLETED")) {
    return <InsightCardTickIcon size={WHITE_DAYS_INSIGHT_ICON_SIZE} />;
  }
  if (name === "flash" || title.includes("STREAK")) {
    return <InsightCardFlashIcon size={WHITE_DAYS_INSIGHT_ICON_SIZE} />;
  }
  if (name === "scale-balance" || title.includes("AVERAGE")) {
    return <InsightCardWeeklyAverageIcon size={WHITE_DAYS_INSIGHT_ICON_SIZE} />;
  }
  if (name === "time-outline" || title.includes("TIME")) {
    return <InsightCardTimeSpentIcon size={WHITE_DAYS_INSIGHT_ICON_SIZE} />;
  }
  return undefined;
}

function buildWhiteDaysLocalInsightCards(options: {
  period: PastAchievementPeriod;
  hasData: boolean;
  goalTrackedMonths: number;
  longestStreakDays: number;
  monthlyAverageFasts: number;
  timeSpentLabel: string;
  noDataLabel: string;
}): InsightCardData[] {
  const {
    period,
    hasData,
    goalTrackedMonths,
    longestStreakDays,
    monthlyAverageFasts,
    timeSpentLabel,
    noDataLabel,
  } = options;

  const noDataCard = (
    title: string,
    iconName: string,
    iconFamily: InsightCardData["iconFamily"] = "Ionicons",
  ): InsightCardData => ({
    iconFamily,
    iconName,
    title,
    value: "--",
    noData: true,
    footerText: noDataLabel,
    footerNeutral: true,
  });

  if (!hasData) {
    const cards: InsightCardData[] = [
      noDataCard("LONGEST STREAK", "flash"),
      noDataCard("MONTHLY AVERAGE", "scale-balance", "MaterialCommunityIcons"),
      noDataCard("TIME SPENT", "time-outline"),
    ];
    if (period !== "monthly") {
      cards.unshift(noDataCard("GOAL TRACKED", "calendar-outline"));
    }
    return cards;
  }

  const streakCard: InsightCardData = {
    iconFamily: "Ionicons",
    iconName: "flash",
    title: "LONGEST STREAK",
    value: String(longestStreakDays),
    subValue: "days",
    trendValue: `${longestStreakDays} days`,
    trendDirection: "up",
  };
  const timeCard: InsightCardData = {
    iconFamily: "Ionicons",
    iconName: "time-outline",
    title: "TIME SPENT",
    value: timeSpentLabel,
    trendValue: timeSpentLabel,
    trendDirection: "up",
  };

  if (period === "monthly") {
    return [streakCard, timeCard];
  }

  return [
    {
      iconFamily: "Ionicons",
      iconName: "calendar-outline",
      title: "GOAL TRACKED",
      value: String(goalTrackedMonths),
      subValue: "months",
      footerText: `• ${goalTrackedMonths} months`,
      footerNeutral: true,
    },
    streakCard,
    {
      iconFamily: "MaterialCommunityIcons",
      iconName: "scale-balance",
      title: "MONTHLY AVERAGE",
      value: String(monthlyAverageFasts),
      subValue: "fasts",
      trendValue: `${monthlyAverageFasts} fasts`,
      trendDirection: "up",
    },
    timeCard,
  ];
}

type Props = {
  refreshKey?: number;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: WhiteDaysAnalyticsView;
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

const ANALYTICS_VIEWS: WhiteDaysAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTime",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<WhiteDaysAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  // Same wording as prayer/quran detailed graph: "Completed vs. Time Spent"
  completedVsTime: "progressLogging.analyticsCompletedVsTimeSpent",
};

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonthsShort",
  sixMonths: "progressLogging.previousSixMonthsShort",
};

const WHITE_DAYS_BAR_COLORS: [string, string] = [
  Colors.light.white,
  "rgba(255, 255, 255, 0.4)",
];
export function WhiteDaysFastsPastAchievements({
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
    useState<WhiteDaysAnalyticsView>(
      isDetailed ? initialAnalyticsView : "completedVsIncomplete",
    );
  const [apiPeriodStart, setApiPeriodStart] = useState<string | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(
    null,
  );
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById("fasting-whiteDays");
  const studyMaterial = goalData?.studyMaterial ?? [];
  const { data: menstruationPeriodsResponse } = useGetMenstruationPeriods(true);
  const { data: fastingFrame } = useGetFastingGoalFrame("WHITE_DAYS");
  const {
    data: achievementsApiData,
    isLoading: isAchievementsLoading,
    isFetching: isAchievementsFetching,
  } = useGetFastingGoalAchievements("WHITE_DAYS", {
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
    if (mappedApi) return toWhiteDaysSliceFromApi(mappedApi.slice);
    return toWhiteDaysSliceFromApi(emptyApiMapped.slice);
  }, [emptyApiMapped, mappedApi, refreshKey]);

  const cycleStartDate = useMemo(() => {
    const fromFrame = String(fastingFrame?.cycle?.startDate ?? "").slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromFrame)) return fromFrame;
    return String(PLANNED_FASTS.cycleStartDate).slice(0, 10);
  }, [fastingFrame?.cycle?.startDate]);

  const cycleEndDate = useMemo(() => {
    const fromFrame = String(fastingFrame?.cycle?.endDate ?? "").slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromFrame)) return fromFrame;
    return String(PLANNED_FASTS.cycleEndDate).slice(0, 10);
  }, [fastingFrame?.cycle?.endDate]);

  const menstruationDates = useMemo(() => {
    return expandMenstruationPeriodDates(
      menstruationPeriodsResponse?.data?.periods,
      { rangeStart: cycleStartDate, rangeEnd: cycleEndDate },
    );
  }, [
    menstruationPeriodsResponse?.data?.periods,
    cycleStartDate,
    cycleEndDate,
    refreshKey,
  ]);

  const inCycle = useCallback(
    (date: string) => date >= cycleStartDate && date <= cycleEndDate,
    [cycleEndDate, cycleStartDate],
  );

  const calendarCompletedDates = useMemo(
    () => periodSlice.completedDates.filter(inCycle),
    [inCycle, periodSlice.completedDates],
  );

  const calendarMissedDates = useMemo(
    () =>
      periodSlice.missedDates.filter(
        (date) => inCycle(date) && !menstruationDates.includes(date),
      ),
    [inCycle, menstruationDates, periodSlice.missedDates],
  );

  const calendarUpcomingDates = useMemo(
    () =>
      periodSlice.upcomingDates.filter(
        (date) => inCycle(date) && !menstruationDates.includes(date),
      ),
    [inCycle, menstruationDates, periodSlice.upcomingDates],
  );

  const baseAchievement = useMemo(() => {
    if (mappedApi) return mappedApi.achievement;
    return emptyApiMapped.achievement;
  }, [emptyApiMapped, mappedApi, refreshKey]);

  const timeSpentByPeriod = useMemo(
    () => getWhiteDaysTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyWhiteDaysAnalyticsView(baseAchievement, periodSlice, analyticsView),
    [analyticsView, baseAchievement, periodSlice],
  );

  const totalTimeSpentMinutes = useMemo(() => {
    if (mappedApi) return mappedApi.totalTimeSpentMinutes;
    return getTotalWhiteDaysTimeSpentMinutes(timeSpentByPeriod);
  }, [mappedApi, timeSpentByPeriod]);

  const apiLockedOrEmpty =
    Boolean(mappedApi?.locked) ||
    (!isAchievementsLoading &&
      (mappedApi == null ||
        (mappedApi.slice.completedFasts === 0 &&
          mappedApi.slice.incompleteFasts === 0 &&
          mappedApi.slice.chartPeriods.every(
            (p) => p.completed === 0 && p.incomplete === 0,
          ))));

  const hasLogs = useMemo(
    () => !isAchievementsLoading && !apiLockedOrEmpty,
    [apiLockedOrEmpty, isAchievementsLoading],
  );

  const goalTrackedMonths = getWhiteDaysGoalTrackedMonths(period);

  const apiInsightCards = useMemo(() => {
    return mapFastingApiKeyInsightsToCards(achievementsApiData, {
      period,
      noDataLabel: t("progressLogging.insightNoData"),
      isLoading: isAchievementsLoading || isAchievementsFetching,
    });
  }, [
    achievementsApiData,
    isAchievementsFetching,
    isAchievementsLoading,
    period,
    t,
  ]);

  const longestStreakDays = useMemo(() => {
    const dates = [...periodSlice.completedDates].sort();
    if (dates.length === 0) return 0;
    let best = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i += 1) {
      const prev = new Date(`${dates[i - 1]}T12:00:00`);
      const next = new Date(`${dates[i]}T12:00:00`);
      const diffDays = Math.round(
        (next.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (diffDays === 1) {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 1;
      }
    }
    return best;
  }, [periodSlice.completedDates]);

  const monthlyAverageFasts = useMemo(() => {
    const months = Math.max(goalTrackedMonths, 1);
    return Math.round(periodSlice.completedFasts / months);
  }, [goalTrackedMonths, periodSlice.completedFasts]);

  useEffect(() => {
    setApiPeriodStart(null);
  }, [period]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setSelectedCalendarDate(null);
    setHintDismissed(false);
  }, [period, analyticsView, refreshKey, apiPeriodStart]);

  const handlePeriodChange = useCallback((next: PastAchievementPeriod) => {
    setPeriod(next);
  }, []);

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
        goalId: "fasting-whiteDays",
        period,
        analyticsView:
          analyticsView === "completedVsTime"
            ? "completedVsTimeSpent"
            : "completedVsIncomplete",
        goalCategory: "fasting",
        goalType: "white_days_fasts",
      },
    });
  }, [analyticsView, period, router]);

  // Calendar for monthly Completed vs Incomplete; Time Spent / other periods → chart.
  const showCalendar =
    period === "monthly" && analyticsView === "completedVsIncomplete";

  const canNavigateBack =
    !showCalendar &&
    Boolean(mappedApi?.canNavigateBack) &&
    !isAchievementsLoading;
  const canNavigateForward =
    !showCalendar &&
    Boolean(mappedApi?.canNavigateForward) &&
    !isAchievementsLoading;

  const handleNavigateBack = useCallback(() => {
    if (!canNavigateBack || !mappedApi) return;
    const next = shiftFastingAchievementsPeriodStart(
      mappedApi.periodStart,
      mappedApi.periodEnd,
      -1,
    );
    if (next) setApiPeriodStart(next);
  }, [canNavigateBack, mappedApi]);

  const handleNavigateForward = useCallback(() => {
    if (!canNavigateForward || !mappedApi) return;
    const next = shiftFastingAchievementsPeriodStart(
      mappedApi.periodStart,
      mappedApi.periodEnd,
      1,
    );
    if (next) setApiPeriodStart(next);
  }, [canNavigateForward, mappedApi]);

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

  const selectedPeriodTimeSpentMinutes = selectedCalendarDate
    ? 0
    : selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const showNoDataDash =
    isAchievementsLoading ||
    (selectedCalendarDate == null &&
      (!hasLogs ||
        isPastAchievementBarEmpty(displayCompleted, displayIncomplete)));

  /** Same gate as Prayer/Quran: hide detail chevron until there is logged data. */
  const showDetailedStatsChevron = !isDetailed && hasLogs && !showNoDataDash;

  const showChart = !showCalendar;
  const showChartHint =
    showChart &&
    hasLogs &&
    !showNoDataDash &&
    !hintDismissed &&
    selectedBarIndex === null;
  // Match Prayer/Quran: hide delta when no data or 0% (no “0% previous month”).
  const displayedDeltaPct = showNoDataDash
    ? null
    : (baseAchievement.previousPeriodDeltaPercent ?? null);
  const showDeltaChip =
    !showNoDataDash &&
    displayedDeltaPct !== null &&
    Math.abs(displayedDeltaPct) > 0;
  const deltaIsPositive = (displayedDeltaPct ?? 0) > 0;

  const cycleRangeLabel = useMemo(() => {
    const start = new Date(`${cycleStartDate}T12:00:00`);
    const end = new Date(`${cycleEndDate}T12:00:00`);
    const startLabel = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endLabel = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const year = String(end.getFullYear()).slice(-2);
    return `${startLabel} — ${endLabel}, ${year}`;
  }, [cycleEndDate, cycleStartDate]);

  const dateRangeLabel = showCalendar
    ? cycleRangeLabel
    : baseAchievement.dateRangeLabel;

  const chartAchievement = useMemo(() => {
    if (!showChart) return null;
    if (analyticsView === "completedVsTime") {
      return applyTimeSpentOnlyGreenChart(baseAchievement, timeSpentByPeriod);
    }
    return baseAchievement;
  }, [analyticsView, baseAchievement, showChart, timeSpentByPeriod]);

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

  const chartFormatBarValue =
    analyticsView === "completedVsTime"
      ? formatWhiteDaysChartHoursLabel
      : formatWhiteDaysFastCountLabel;

  const renderDetailedSummary = () => {
    if (!isDetailed) return null;

    const summaryKey =
      period === "monthly"
        ? "progressLogging.whiteDaysDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.whiteDaysDetailedSummaryThreeMonths"
          : "progressLogging.whiteDaysDetailedSummarySixMonths";

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
    const vsLabel =
      period === "monthly"
        ? "VS. LAST MONTH"
        : period === "threeMonths"
          ? "VS. LAST 3 MONTHS"
          : "VS. LAST 6 MONTHS";

    const cards: InsightCardData[] =
      apiInsightCards.length > 0
        ? apiInsightCards
        : isDetailed || showNoDataDash
          ? buildWhiteDaysLocalInsightCards({
              period,
              hasData: hasLogs && !showNoDataDash,
              goalTrackedMonths,
              longestStreakDays,
              monthlyAverageFasts,
              timeSpentLabel: formatWhiteDaysFastTimeSpentLabel(
                totalTimeSpentMinutes,
              ),
              noDataLabel: t("progressLogging.insightNoData"),
            })
          : [];

    if (cards.length === 0) return null;

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>
            {achievementsApiData?.keyInsightsHeader?.trim() || vsLabel}
          </Text>
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          {cards.map((card, index) => (
            <InsightCard
              key={`${card.title}-${index}`}
              {...card}
              icon={getWhiteDaysInsightIcon(card)}
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

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.achievementBlock}>
            <Text style={styles.achievementCaption}>
              {analyticsView === "completedVsTime"
                ? t("progressLogging.timeSpentLabel").toUpperCase()
                : "ACHIEVEMENT"}
            </Text>
            <View style={styles.achievementPercentRow}>
              <Text style={styles.achievementPercent}>
                {showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(baseAchievement.achievementPercent)}
              </Text>
              <Text style={styles.achievementPercentSymbol}>%</Text>
            </View>
          </View>
          <View style={styles.periodToggle}>
            {PERIODS.map((item) => {
              const isActive = period === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => handlePeriodChange(item)}
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
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.deltaSlot}>
            {showDeltaChip ? (
              <View style={styles.deltaBadge}>
                {deltaIsPositive ? (
                  <PositiveProgressIcon />
                ) : (
                  <NegativeProgressIcon />
                )}
                <Text style={styles.deltaText} numberOfLines={1}>
                  {`${formatNumber(Math.abs(displayedDeltaPct ?? 0))}% ${t(
                    PERIOD_DELTA_LABEL_KEYS[period],
                  )}`}
                </Text>
              </View>
            ) : (
              <View style={styles.deltaBadgePlaceholder} />
            )}
          </View>

          <View style={styles.periodNavRow}>
            <View style={styles.dateNavRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navBtn}
                onPress={handleNavigateBack}
                disabled={!canNavigateBack}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={
                    canNavigateBack
                      ? Colors.light.dullWhite
                      : Colors.light.subtext
                  }
                />
              </TouchableOpacity>
              <Text
                style={styles.dateRange}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {isAchievementsLoading ? "---" : dateRangeLabel || "---"}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navBtn}
                onPress={handleNavigateForward}
                disabled={!canNavigateForward}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={
                    canNavigateForward
                      ? Colors.light.dullWhite
                      : Colors.light.subtext
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isDetailed ? renderDetailedSummary() : null}

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

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.completed")}
            </Text>
            <Text
              style={
                isDetailed
                  ? styles.statValueCompletedWhite
                  : styles.statValueCompleted
              }
            >
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatWhiteDaysFastCountLabel(displayCompleted)}
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
                  ? formatWhiteDaysFastTimeSpentLabel(
                      selectedPeriodTimeSpentMinutes,
                    )
                  : formatWhiteDaysFastCountLabel(displayIncomplete)}
            </Text>
          </View>
        </View>

        {showCalendar ? (
          <>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDotFilledWhite}>
                  <View style={styles.legendDotFilledWhiteInner} />
                </View>
                <Text style={styles.legendText}>
                  {t("progressLogging.whiteDaysLegendCompletedFast")}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendWarningWrap}>
                  <View style={styles.legendDotOutlinedWhite} />
                  <FontAwesome
                    name="warning"
                    size={5}
                    color={Colors.light.golden}
                  />
                </View>
                <Text style={styles.legendText}>
                  {t("progressLogging.whiteDaysLegendMissedFast")}
                </Text>
              </View>
              {isDetailed ? (
                <>
                  <View style={styles.legendItem}>
                    <View style={styles.legendDotOutlinedWhite} />
                    <Text style={styles.legendText}>
                      {t("progressLogging.whiteDaysLegendUpcomingFast")}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendDotMenstruation} />
                    <Text style={styles.legendText}>
                      {t("progressLogging.whiteDaysLegendMenstruation")}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
            <TopSpace top={2} />
            <CalendarGrid
              mode="white_days_achievement"
              currentDate={cycleStartDate}
              windowStartDate={cycleStartDate}
              windowEndDate={cycleEndDate}
              completedFastDates={hasLogs ? calendarCompletedDates : []}
              missedFastDates={hasLogs ? calendarMissedDates : []}
              incompletePlannedFastDates={hasLogs ? calendarUpcomingDates : []}
              menstruationDates={hasLogs ? menstruationDates : []}
              onDayPress={
                isDetailed && hasLogs ? handleCalendarDayPress : undefined
              }
              selectedDate={
                hasLogs ? (selectedCalendarDate ?? undefined) : undefined
              }
              bgColor={Colors.light.greybuttonBackground}
            />
            {isDetailed && hasLogs && selectedCalendarDate ? (
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
            onStartShouldSetResponder={() => isDetailed}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              // No logs → empty chartData so X-axis labels are hidden (same as
              // Quran Hours loading / empty backend payload).
              chartData={
                !hasLogs || showNoDataDash
                  ? []
                  : (chartAchievement?.chartData ?? achievement.chartData)
              }
              selectedBarIndex={
                isDetailed && hasLogs && !showNoDataDash
                  ? selectedBarIndex
                  : null
              }
              onBarPress={
                !hasLogs || showNoDataDash
                  ? () => {}
                  : isDetailed
                    ? handleBarPressDetailed
                    : handleBarPressCompact
              }
              chartKey={`white-days-${period}-${analyticsView}-${refreshKey}-${isDetailed ? "detailed" : "compact"}-${hasLogs ? "ready" : "empty"}`}
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
                  : WHITE_DAYS_BAR_COLORS
              }
              valueLabelColor={Colors.light.white}
              showPagination={isDetailed && hasLogs && !showNoDataDash}
            />
            {isDetailed ? (
              <GraphBarSelectionFooter
                visible={selectedBarIndex !== null && hasLogs && !showNoDataDash}
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
    gap: 4,
  },
  sectionTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0,
    textTransform: "uppercase",
    flexShrink: 1,
    marginLeft: 6,
  },
  achievementBlock: {
    gap: 6,
    marginTop: 6,
    marginBottom: -2,
  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
    marginTop: 10,
  },
  achievementPercentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  achievementPercentSymbol: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: 1,
    marginLeft: 2,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 4,
    height: 24,
  },
  deltaBadgePlaceholder: {
    height: 24,
  },
  deltaText: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  deltaSlot: {
    minWidth: 0,
    marginRight: 8,
    justifyContent: "center",
    height: 24,
  },
  periodNavRow: {
    width: 185,
    height: 24,
    justifyContent: "center",
    alignItems: "stretch",
    flexShrink: 0,
    marginTop: -26,
  },
  periodToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
    maxWidth: "70%",
  },
  periodButton: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 0,
    paddingVertical: 8,
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
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: Colors.light.green,
  },
  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  navBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dateRange: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
  },
  summaryText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0,
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
  analyticsToggleScroll: {
    marginHorizontal: -14,
  },
  analyticsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  analyticsButton: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  analyticsButtonActive: {
    backgroundColor: Colors.light.green,
  },
  analyticsButtonInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  analyticsButtonText: {
    color: Colors.light.dullWhite,
    fontSize: 14,
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
  statValueCompletedWhite: {
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
    marginTop: 26,
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
  legendDotFilledWhite: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.white,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  legendDotFilledWhiteInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.light.white,
  },
  legendDotOutlinedWhite: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.white,
    backgroundColor: "transparent",
  },
  legendDotMenstruation: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.red,
    borderWidth: 1.2,
    borderColor: Colors.light.white,
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
