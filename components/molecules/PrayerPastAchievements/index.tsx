import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
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
  applyPrayerAnalyticsView,
  formatPrayerCountLabel,
  formatPrayerTimeSpentLabel,
  getPrayerPastAchievement,
  type PrayerAnalyticsView,
  type PrayerPastAchievement,
} from "@/src/screens/private/goalprogressloggingscreen/prayerPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { InsightCard } from "../InsightCard";
import { PRAYER_INSIGHT_CARDS, type InsightCardData } from "./insightCardsData";
import {
  getGoalById,
  type GoalId,
} from "@/src/screens/private/home/components/goalsData";
import {
  useGetPrayerGoalAchievements,
  type PrayerGoalAchievementsData,
} from "@/src/api/queries/useGetPrayerGoalAchievements";
import {
  mapPrayerGoalAchievementsToUi,
  shiftPrayerAchievementsPeriodStart,
} from "@/src/utils/prayerGoalAchievementsMap";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import {
  NegativeProgressIcon,
  PositiveProgressIcon,
  AchivementArrowIcon,
  InsightCardTickIcon,
  InsightCardFlashIcon,
  InsightCardGoodDayIcon,
  InsightCardWeeklyAverageIcon,
  InsightCardTimeSpentIcon,
  InsightCardGoalTrackedIcon,
} from "@/assets/icons";

type Props = {
  goalId: GoalId;
  isDetailed?: boolean;
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
  threeMonths: "progressLogging.previousThreeMonthsShort",
  sixMonths: "progressLogging.previousSixMonthsShort",
};

const ANALYTICS_VIEWS: PrayerAnalyticsView[] = [
  "completedVsIncomplete",
  "inMosqueVsOutOfMosque",
  "completedByCategory",
  "completedVsTimeSpent",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<PrayerAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
  inMosqueVsOutOfMosque: "progressLogging.analyticsInMosqueVsOutOfMosque",
  completedByCategory: "Completed by Category",
};

const PERIOD_PHRASE: Record<PastAchievementPeriod, string> = {
  monthly: "Over the past month",
  threeMonths: "Over the past three months",
  sixMonths: "Over the past six months",
};

const MISSED_PRAYER_TABS = ["All", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const SUNNAH_RAWATIB_TABS = [
  "All",
  "Before Fajr",
  "Before Dhuhr",
  "After Dhuhr",
  "Before Asr",
  "After Maghrib",
  "After Isha",
];
const QIYAM_TABS = ["All", "After Isha", "Tahajjud"];

const LOADING_DASH = "---";

function trendFromDelta(
  delta: number | null | undefined,
  formatUnit: (abs: number) => string,
): Pick<InsightCardData, "trendValue" | "trendDirection"> {
  if (delta == null || delta === 0) return {};
  const abs = Math.abs(delta);
  return {
    trendValue: formatUnit(abs),
    trendDirection: delta > 0 ? "up" : "down",
  };
}

function firstNumber(
  ...values: Array<number | null | undefined>
): number | null {
  for (const value of values) {
    if (typeof value === "number" && !Number.isNaN(value)) return value;
  }
  return null;
}

function formatInsightDuration(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  return `${Math.floor(safe / 60)}h ${safe % 60}m`;
}

function minutesAsPeriodPercent(minutes: number, days: number): number {
  const totalMinutes = Math.max(days, 1) * 24 * 60;
  const raw = (Math.max(0, minutes) / totalMinutes) * 100;
  if (raw === 0) return 0;
  if (raw < 1) return Math.round(raw * 100) / 100;
  if (raw < 10) return Math.round(raw * 10) / 10;
  return Math.round(raw);
}

function metricCard({
  title,
  iconFamily,
  iconName,
  value,
  subValue,
  delta,
  formatDelta,
  noData,
  noDataLabel,
  zeroDeltaFooter,
}: {
  title: string;
  iconFamily: InsightCardData["iconFamily"];
  iconName: string;
  value: number | null;
  subValue?: string;
  delta?: number | null;
  formatDelta: (abs: number) => string;
  noData: boolean;
  noDataLabel: string;
  zeroDeltaFooter?: string;
}): InsightCardData {
  if (noData || value == null || value === 0) {
    return {
      iconFamily,
      iconName,
      title,
      value: "-- --",
      noData: true,
      footerText: noDataLabel,
    };
  }

  const trend = trendFromDelta(delta, formatDelta);
  return {
    iconFamily,
    iconName,
    title,
    value: String(value),
    subValue,
    ...trend,
    ...(!trend.trendValue && zeroDeltaFooter
      ? { footerText: zeroDeltaFooter, footerNeutral: true }
      : {}),
  };
}

const TAHIYYAT_INSIGHT_ICON_SIZE = 14;

function getTahiyyatAlWudhuInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={TAHIYYAT_INSIGHT_ICON_SIZE} />;
  }
  if (name === "checkmark-circle-outline" || title.includes("COMPLETED")) {
    return <InsightCardTickIcon size={TAHIYYAT_INSIGHT_ICON_SIZE} />;
  }
  if (name === "flash" || title.includes("STREAK")) {
    return <InsightCardFlashIcon size={TAHIYYAT_INSIGHT_ICON_SIZE} />;
  }
  if (name === "sparkles" || title.includes("BEST")) {
    return <InsightCardGoodDayIcon size={TAHIYYAT_INSIGHT_ICON_SIZE} />;
  }
  if (name === "scale-balance" || title.includes("AVERAGE")) {
    return <InsightCardWeeklyAverageIcon size={TAHIYYAT_INSIGHT_ICON_SIZE} />;
  }
  if (name === "time-outline" || title.includes("TIME")) {
    return <InsightCardTimeSpentIcon size={TAHIYYAT_INSIGHT_ICON_SIZE} />;
  }
  return undefined;
}

function mapApiKeyInsightsToCards(
  data: PrayerGoalAchievementsData | null | undefined,
  period: PastAchievementPeriod,
  t: (key: string, options?: Record<string, string | number>) => string,
  isLoading = false,
): InsightCardData[] {
  const insights = data?.keyInsights ?? {};
  const noDataLabel = t("progressLogging.insightNoData");
  const dayTrendLabel = (abs: number) =>
    t("progressLogging.insightsDayCount", { count: abs });
  const prayerTrendLabel = (abs: number) =>
    `${abs} ${t("progressLogging.insightPrayer", { count: abs })}`;
  const monthTrendLabel = (abs: number) =>
    `${abs} ${t("progressLogging.recitationInsightMonths")}`;

  const cards: InsightCardData[] = [];

  if (period !== "monthly") {
    const months = firstNumber(insights.goalTrackedMonths) ?? 0;
    cards.push(
      metricCard({
        title: t("progressLogging.recitationInsightGoalTracked"),
        iconFamily: "Ionicons",
        iconName: "calendar-outline",
        value: months,
        subValue: t("progressLogging.recitationInsightMonths"),
        delta: insights.goalTrackedDelta,
        formatDelta: monthTrendLabel,
        noData: isLoading,
        noDataLabel,
        zeroDeltaFooter: `${months} ${t("progressLogging.recitationInsightMonths")}`,
      }),
    );
  }

  cards.push(
    metricCard({
      title: t("progressLogging.completedIn"),
      iconFamily: "Ionicons",
      iconName: "checkmark-circle-outline",
      value: firstNumber(insights.activeDaysCount) ?? 0,
      subValue: t("progressLogging.recitationInsightActiveDays"),
      delta: insights.activeDaysDelta,
      formatDelta: dayTrendLabel,
      noData: isLoading,
      noDataLabel,
    }),
  );

  cards.push(
    metricCard({
      title: t("progressLogging.longestStreak"),
      iconFamily: "Ionicons",
      iconName: "flash",
      value: firstNumber(insights.longestStreak) ?? 0,
      subValue: t("progressLogging.daysLabel"),
      delta: insights.longestStreakDelta,
      formatDelta: dayTrendLabel,
      noData: isLoading,
      noDataLabel,
    }),
  );

  cards.push(
    metricCard({
      title: t("progressLogging.insightBestDay"),
      iconFamily: "Ionicons",
      iconName: "sparkles",
      value:
        firstNumber(
          insights.bestDayCount,
          insights.personalBest,
          insights.bestDay,
        ) ?? 0,
      subValue: t("progressLogging.insightPrayer", { count: 2 }),
      delta: firstNumber(insights.bestDayDelta, insights.personalBestDelta),
      formatDelta: prayerTrendLabel,
      noData: isLoading,
      noDataLabel,
    }),
  );

  if (period === "monthly") {
    cards.push(
      metricCard({
        title: t("progressLogging.insightWeeklyAverage"),
        iconFamily: "MaterialCommunityIcons",
        iconName: "scale-balance",
        value: firstNumber(insights.weeklyAverage) ?? 0,
        subValue: t("progressLogging.insightPrayer", { count: 2 }),
        delta: insights.weeklyAverageDelta,
        formatDelta: prayerTrendLabel,
        noData: isLoading,
        noDataLabel,
      }),
    );
  } else {
    cards.push(
      metricCard({
        title: t("progressLogging.insightMonthlyAverage"),
        iconFamily: "MaterialCommunityIcons",
        iconName: "scale-balance",
        value: firstNumber(insights.monthlyAverage) ?? 0,
        subValue: t("progressLogging.insightPrayer", { count: 2 }),
        delta: insights.monthlyAverageDelta,
        formatDelta: prayerTrendLabel,
        noData: isLoading,
        noDataLabel,
      }),
    );
  }

  const timeSpent =
    firstNumber(insights.timeSpentMinutes, data?.totalMinutesSpent) ?? 0;
  const timeDelta = firstNumber(
    insights.timeSpentDeltaMinutes,
    insights.timeSpentDelta,
  );
  cards.push({
    ...metricCard({
      title: t("progressLogging.timeSpentLabel").toUpperCase(),
      iconFamily: "Ionicons",
      iconName: "time-outline",
      value: timeSpent,
      delta: timeDelta,
      formatDelta: (abs) => formatInsightDuration(abs),
      noData: isLoading,
      noDataLabel,
    }),
    ...(!isLoading && timeSpent > 0
      ? { value: formatInsightDuration(timeSpent) }
      : {}),
  });

  return cards;
}

const EMPTY_PRAYER_ACHIEVEMENT: PrayerPastAchievement = {
  dateRangeLabel: LOADING_DASH,
  achievementPercent: 0,
  previousPeriodDeltaPercent: 0,
  chartData: [],
  goalPrayers: 0,
  periodGoalPrayers: 0,
  completedPrayers: 0,
  incompletePrayers: 0,
  totalTimeSpentMinutes: 0,
  yMax: 10,
  yTicks: [0, 5, 10],
  pageCount: 0,
  activePageIndex: 0,
};

export function PrayerPastAchievements({ goalId, isDetailed = false }: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [selectedPrayerTab, setSelectedPrayerTab] = useState<string>("All");
  const [period, setPeriod] = useState<PastAchievementPeriod>("monthly");
  const [periodStartParam, setPeriodStartParam] = useState<string | null>(null);
  const [analyticsView, setAnalyticsView] = useState<PrayerAnalyticsView>(
    "completedVsIncomplete",
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById(goalId);
  const cleanGoalLabel = goalData?.title || "";
  const usesAchievementsApi =
    goalId === "prayer-tahiyyat" ||
    goalId === "prayer-tahiyyatMasjid" ||
    goalId === "prayer-missed" ||
    goalId === "prayer-duha" ||
    goalId === "prayer-tawbah" ||
    goalId === "prayer-istikhara" ||
    goalId === "prayer-shukr";
  const prayerType = resolvePrayerTypeFromGoalId(goalId);

  const { data: achievementsApiData, isLoading: isAchievementsLoading } =
    useGetPrayerGoalAchievements(prayerType, {
      period,
      periodStart: periodStartParam,
      enabled: usesAchievementsApi && !!prayerType,
    });
  const showPlaceholders =
    usesAchievementsApi && (!achievementsApiData || isAchievementsLoading);

  useEffect(() => {
    if (
      goalId === "prayer-qiyam" &&
      analyticsView === "completedByCategory" &&
      selectedPrayerTab === "All"
    ) {
      setSelectedPrayerTab("After Isha");
    }
  }, [goalId, analyticsView, selectedPrayerTab]);

  useEffect(() => {
    setPeriodStartParam(null);
  }, [period, goalId]);

  const baseAchievementRaw = useMemo((): PrayerPastAchievement | null => {
    if (usesAchievementsApi) {
      if (!achievementsApiData) return null;
      return mapPrayerGoalAchievementsToUi(achievementsApiData);
    }
    return getPrayerPastAchievement(goalId, period);
  }, [usesAchievementsApi, achievementsApiData, goalId, period]);

  const baseAchievement = useMemo(() => {
    if (!baseAchievementRaw) return null;
    let data = { ...baseAchievementRaw };

    const isMissed = goalId === "prayer-missed";
    const isSunnah = goalId === "prayer-sunnah";
    const isQiyam = goalId === "prayer-qiyam";

    if ((isMissed || isSunnah || isQiyam) && selectedPrayerTab !== "All") {
      const multipliers: Record<string, number> = {
        Fajr: 0.25,
        Dhuhr: 0.35,
        Asr: 0.15,
        Maghrib: 0.2,
        Isha: 0.1,
        "Before Fajr": 0.2,
        "Before Dhuhr": 0.2,
        "After Dhuhr": 0.15,
        "Before Asr": 0.15,
        "After Maghrib": 0.1,
        "After Isha": 0.35, // bumped up slightly for Qiyam visual variance
        Tahajjud: 0.65, // major portion of Qiyam
      };
      const multiplier = multipliers[selectedPrayerTab] || 0.4;

      data = {
        ...data,
        achievementPercent: Math.min(
          100,
          Math.round(data.achievementPercent * multiplier * 1.5),
        ),
        completedPrayers: Math.round(data.completedPrayers * multiplier),
        incompletePrayers: Math.round(data.incompletePrayers * multiplier),
        totalTimeSpentMinutes: Math.round(
          data.totalTimeSpentMinutes * multiplier,
        ),
        chartData: data.chartData.map((item: any, idx: number) => {
          // deterministic variation so the graph shape physically changes
          const variation =
            0.5 + ((idx * 7 + selectedPrayerTab.length * 3) % 10) / 10;
          const barMultiplier = multiplier * variation;

          return {
            ...item,
            completedPrayers: Math.round(item.completedPrayers * barMultiplier),
            incompletePrayers: Math.round(
              item.incompletePrayers * barMultiplier,
            ),
            timeSpentMinutes: Math.round(item.timeSpentMinutes * barMultiplier),
          };
        }),
      };
    }
    return data;
  }, [baseAchievementRaw, goalId, selectedPrayerTab]);

  const achievement = useMemo(
    () =>
      baseAchievement
        ? applyPrayerAnalyticsView(baseAchievement, analyticsView)
        : null,
    [baseAchievement, analyticsView],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, analyticsView, periodStartParam]);

  const handleBarPress = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex((prev) => (prev === index ? null : index));
  }, []);

  const handlePeriodChange = useCallback((next: PastAchievementPeriod) => {
    setPeriod(next);
    setPeriodStartParam(null);
  }, []);

  const handleNavigateBack = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData?.canNavigateBack) return;
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      -1,
    );
    setPeriodStartParam(nextStart);
  }, [usesAchievementsApi, achievementsApiData]);

  const handleNavigateForward = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData?.canNavigateForward) return;
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      1,
    );
    setPeriodStartParam(nextStart);
  }, [usesAchievementsApi, achievementsApiData]);

  const canNavigateBack = usesAchievementsApi
    ? !showPlaceholders && !!achievementsApiData?.canNavigateBack
    : true;
  const canNavigateForward = usesAchievementsApi
    ? !showPlaceholders && !!achievementsApiData?.canNavigateForward
    : true;

  const selectedBaseWeek =
    !showPlaceholders && selectedBarIndex !== null && baseAchievement
      ? (baseAchievement.chartData[selectedBarIndex] as any)
      : null;

  const displayBaseCompleted =
    selectedBaseWeek?.completedPrayers ??
    baseAchievement?.completedPrayers ??
    0;
  const displayBaseIncomplete =
    selectedBaseWeek?.incompletePrayers ??
    baseAchievement?.incompletePrayers ??
    0;

  const displayTimeSpent =
    selectedBaseWeek?.timeSpentMinutes ??
    baseAchievement?.totalTimeSpentMinutes ??
    0;

  const isTimeSpentView = analyticsView === "completedVsTimeSpent";
  const timeMetricDays =
    selectedBarIndex !== null
      ? period === "monthly"
        ? 7
        : 28
      : period === "monthly"
        ? 28
        : period === "threeMonths"
          ? 84
          : 168;
  const timeSpentPercent = minutesAsPeriodPercent(
    displayTimeSpent,
    timeMetricDays,
  );

  const resolvedBaseAchievement = baseAchievement ?? EMPTY_PRAYER_ACHIEVEMENT;
  const resolvedAchievement =
    achievement ??
    applyPrayerAnalyticsView(EMPTY_PRAYER_ACHIEVEMENT, analyticsView);

  const barDeltaPct = (
    isTimeSpentView
      ? selectedBaseWeek?.timeSpentDeltaPct
      : selectedBaseWeek?.completedDeltaPct
  ) as number | null | undefined;
  const displayedDeltaPct =
    selectedBarIndex !== null && selectedBaseWeek
      ? barDeltaPct === undefined
        ? isTimeSpentView
          ? null
          : resolvedBaseAchievement.previousPeriodDeltaPercent
        : barDeltaPct
      : isTimeSpentView
        ? null
        : resolvedBaseAchievement.previousPeriodDeltaPercent;
  const showDeltaChip = !showPlaceholders && displayedDeltaPct !== null;
  const deltaIsZero = displayedDeltaPct === 0;
  const deltaIsPositive = (displayedDeltaPct ?? 0) > 0;
  const deltaPeriodLabel = t(
    selectedBarIndex !== null && period === "monthly"
      ? "progressLogging.previousWeek"
      : PERIOD_DELTA_LABEL_KEYS[period],
  );

  if (!usesAchievementsApi && (!baseAchievement || !achievement)) {
    return null;
  }

  const renderInsights = () => {
    if (!isDetailed && !usesAchievementsApi) return null;

    const cards = usesAchievementsApi
      ? mapApiKeyInsightsToCards(
          achievementsApiData,
          period,
          t,
          showPlaceholders,
        )
      : PRAYER_INSIGHT_CARDS[goalId]?.[
          period as "monthly" | "threeMonths" | "sixMonths"
        ];

    if (!cards || cards.length === 0) return null;

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
          {cards.map((c, i) => (
            <InsightCard
              key={i}
              {...c}
              icon={
                goalId === "prayer-tahiyyat" ||
                goalId === "prayer-tahiyyatMasjid" ||
                goalId === "prayer-duha" ||
                goalId === "prayer-tawbah" ||
                goalId === "prayer-istikhara" ||
                goalId === "prayer-shukr"
                  ? getTahiyyatAlWudhuInsightIcon(c)
                  : undefined
              }
              style={styles.insightCardFixed}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const showChartHint = !hintDismissed && selectedBarIndex === null;

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AchivementArrowIcon size={15} color={Colors.light.subtext} />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements").replace(
              "ACHIEVEMENTS",
              "ACHIEVEMENTS",
            )}
          </Text>
          {!isDetailed && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(private)/pastachievementdetailedstatistics",
                  params: { goalId },
                })
              }
              style={{ marginLeft: "auto", padding: 4 }}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.light.white}
              />
            </TouchableOpacity>
          )}
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
              {isTimeSpentView
                ? t("progressLogging.timeSpentLabel").toUpperCase()
                : "ACHIEVEMENT"}
            </Text>
            <Text style={styles.achievementPercent}>
              {showPlaceholders ? (
                LOADING_DASH
              ) : (
                <>
                  {formatNumber(
                    isTimeSpentView
                      ? timeSpentPercent
                      : resolvedAchievement.achievementPercent,
                  )}
                  <Text style={styles.achievementPercentSymbol}>%</Text>
                </>
              )}
            </Text>
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
              deltaIsZero ? (
                <View style={[styles.deltaBadge, styles.deltaBadgeNeutral]}>
                  <View style={styles.deltaDot} />
                  <Text
                    style={[styles.deltaText, styles.deltaTextNegative]}
                    numberOfLines={1}
                  >
                    {`${formatNumber(0)}% ${deltaPeriodLabel}`}
                  </Text>
                </View>
              ) : (
                <View style={styles.deltaBadge}>
                  {deltaIsPositive ? (
                    <PositiveProgressIcon />
                  ) : (
                    <NegativeProgressIcon />
                  )}
                  <Text style={styles.deltaText} numberOfLines={1}>
                    {`${formatNumber(Math.abs(displayedDeltaPct ?? 0))}% ${deltaPeriodLabel}`}
                  </Text>
                </View>
              )
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
                {showPlaceholders
                  ? LOADING_DASH
                  : resolvedAchievement.dateRangeLabel}
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

        {isDetailed && !showPlaceholders && (
          <>
            <Text style={styles.summaryText}>
              <Text>{PERIOD_PHRASE[period]}, you achieved </Text>
              <Text style={styles.summaryBold}>
                {formatNumber(resolvedBaseAchievement.achievementPercent)}%
              </Text>
              <Text> of your {cleanGoalLabel} prayer goals</Text>
              {resolvedBaseAchievement.previousPeriodDeltaPercent !== null ? (
                resolvedBaseAchievement.previousPeriodDeltaPercent === 0 ? (
                  <Text>
                    {" "}
                    — the same as the previous {period === "monthly" && "month"}
                    {period === "threeMonths" && (
                      <>
                        <Text style={styles.summaryBold}>3M</Text> period
                      </>
                    )}
                    {period === "sixMonths" && (
                      <>
                        <Text style={styles.summaryBold}>6M</Text> period
                      </>
                    )}
                    .
                  </Text>
                ) : (
                  <>
                    <Text> — </Text>
                    <Text style={styles.summaryBold}>
                      {formatNumber(
                        Math.abs(
                          resolvedBaseAchievement.previousPeriodDeltaPercent,
                        ),
                      )}
                      %
                    </Text>
                    <Text>
                      {" "}
                      {resolvedBaseAchievement.previousPeriodDeltaPercent > 0
                        ? "more"
                        : "less"}{" "}
                      than the previous {period === "monthly" && "month"}
                      {period === "threeMonths" && (
                        <>
                          <Text style={styles.summaryBold}>3M</Text> period
                        </>
                      )}
                      {period === "sixMonths" && (
                        <>
                          <Text style={styles.summaryBold}>6M</Text> period
                        </>
                      )}
                      .
                    </Text>
                  </>
                )
              ) : (
                <Text>.</Text>
              )}
            </Text>

            {(goalId === "prayer-missed" || goalId === "prayer-sunnah") && (
              <View style={styles.missedPrayerTabsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.missedPrayerTabsContainer}
                >
                  {(goalId === "prayer-missed"
                    ? MISSED_PRAYER_TABS
                    : SUNNAH_RAWATIB_TABS
                  ).map((prayer) => {
                    const isActive = selectedPrayerTab === prayer;
                    return (
                      <TouchableOpacity
                        key={prayer}
                        onPress={() => setSelectedPrayerTab(prayer)}
                        style={[
                          styles.missedPrayerTab,
                          isActive
                            ? styles.missedPrayerTabActive
                            : styles.missedPrayerTabInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.missedPrayerTabText,
                            isActive
                              ? styles.missedPrayerTabTextActive
                              : styles.missedPrayerTabTextInactive,
                          ]}
                        >
                          {prayer}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </>
        )}

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalPillValue}>
              {showPlaceholders
                ? LOADING_DASH
                : formatNumber(resolvedBaseAchievement.goalPrayers)}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>prayers</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.analyticsToggleScroll}
          contentContainerStyle={styles.analyticsToggle}
        >
          {ANALYTICS_VIEWS.filter((v) => {
            if (goalId === "prayer-fiveDailyPrayers")
              return v !== "completedByCategory";
            if (goalId === "prayer-qiyam") return v !== "inMosqueVsOutOfMosque";
            return (
              v === "completedVsIncomplete" || v === "completedVsTimeSpent"
            );
          }).map((view) => {
            const isActive = analyticsView === view;

            let label =
              view === "completedByCategory"
                ? "Completed by Category"
                : t(ANALYTICS_VIEW_LABEL_KEYS[view]);
            if (goalId === "prayer-fiveDailyPrayers") {
              if (view === "completedVsIncomplete") label = "On-Time vs. Qadha";
              else if (view === "inMosqueVsOutOfMosque")
                label = "On-Time: In-Mosque vs. Out-of-Mosque";
              else if (view === "completedVsTimeSpent")
                label = "On-Time & Qadha vs. Time Spent";
            }

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
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {goalId === "prayer-qiyam" &&
          analyticsView !== "completedVsIncomplete" && (
            <View style={[styles.missedPrayerTabsWrapper, { marginTop: 12 }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.missedPrayerTabsContainer}
              >
                {(analyticsView === "completedByCategory"
                  ? QIYAM_TABS.filter((t) => t !== "All")
                  : QIYAM_TABS
                ).map((prayer) => {
                  const isActive = selectedPrayerTab === prayer;
                  return (
                    <TouchableOpacity
                      key={prayer}
                      onPress={() => setSelectedPrayerTab(prayer)}
                      style={[
                        styles.missedPrayerTab,
                        isActive
                          ? styles.missedPrayerTabActive
                          : styles.missedPrayerTabInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.missedPrayerTabText,
                          isActive
                            ? styles.missedPrayerTabTextActive
                            : styles.missedPrayerTabTextInactive,
                        ]}
                      >
                        {prayer}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {goalId === "prayer-fiveDailyPrayers"
                ? analyticsView === "inMosqueVsOutOfMosque"
                  ? "IN-MOSQUE"
                  : "ON-TIME"
                : t("progressLogging.completed")}
            </Text>
            <Text
              style={[
                styles.statValueCompleted,
                analyticsView === "inMosqueVsOutOfMosque" && {
                  color: "#00E5FF",
                },
              ]}
            >
              {showPlaceholders
                ? LOADING_DASH
                : formatPrayerCountLabel(displayBaseCompleted)}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {analyticsView === "completedVsTimeSpent"
                ? t("progressLogging.timeSpentLabel")
                : goalId === "prayer-fiveDailyPrayers"
                  ? analyticsView === "inMosqueVsOutOfMosque"
                    ? "OUT-OF-MOSQUE"
                    : "QADHA"
                  : analyticsView === "completedByCategory"
                    ? "NIGHTS"
                    : t("progressLogging.incomplete")}
            </Text>
            <Text
              style={
                analyticsView === "completedVsTimeSpent" ||
                analyticsView === "completedByCategory"
                  ? styles.statValueTimeSpent
                  : styles.statValueIncomplete
              }
            >
              {showPlaceholders
                ? LOADING_DASH
                : analyticsView === "completedVsTimeSpent"
                  ? formatPrayerTimeSpentLabel(displayTimeSpent)
                  : formatPrayerCountLabel(displayBaseIncomplete)}
            </Text>
          </View>
        </View>

        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={showPlaceholders ? [] : resolvedAchievement.chartData}
            selectedBarIndex={
              isDetailed && !showPlaceholders ? selectedBarIndex : null
            }
            onBarPress={
              isDetailed && !showPlaceholders ? handleBarPress : () => {}
            }
            chartKey={`${goalId}-${period}-${analyticsView}-${selectedPrayerTab}-${showPlaceholders ? "loading" : "ready"}`}
            yMax={resolvedAchievement.yMax}
            yTicks={resolvedAchievement.yTicks}
            showHint={isDetailed && !showPlaceholders ? showChartHint : false}
            onDismissHint={() => {
              setHintDismissed(true);
              if (resolvedAchievement.chartData.length > 0) {
                setSelectedBarIndex(resolvedAchievement.chartData.length - 1);
              }
            }}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={resolvedAchievement.pageCount}
            activePageIndex={
              selectedBarIndex ?? resolvedAchievement.activePageIndex
            }
            formatBarValue={formatPrayerCountLabel}
            isPrayerGoal={true}
            showPagination={isDetailed && !showPlaceholders}
            showBarLine={goalId === "prayer-qiyam"}
          />
        </View>
      </View>

      {renderInsights()}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  
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
    //textTransform: "uppercase",
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 0,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  achievementPercentSymbol: {
    fontSize: 16,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 24,
  },
  deltaBadgePlaceholder: {
    height: 24,
  },
  deltaBadgeNeutral: {
    backgroundColor: Colors.light.calendarBg,
  },
  deltaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.light.subtext,
  },
  deltaText: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  deltaTextNegative: {
    color: Colors.light.subtext,
  },
  deltaSlot: {
    flex: 1,
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
    marginTop: -10,
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
  summaryBold: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 20,
    letterSpacing: 0,
  },
  missedPrayerTabsWrapper: {
    marginTop: 6,
    marginBottom: 6,
    marginHorizontal: -16, // to allow scroll bleeding if container has padding
  },
  missedPrayerTabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  missedPrayerTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  missedPrayerTabActive: {
    backgroundColor: Colors.light.green,
  },
  missedPrayerTabInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  missedPrayerTabText: {
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  missedPrayerTabTextActive: {
    color: Colors.light.background,
    fontWeight: "600",
  },
  missedPrayerTabTextInactive: {
    color: Colors.light.grey,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    backgroundColor: Colors.light.blackBackground,
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  goalLabel: {
    color: Colors.light.subtext,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    textTransform: "uppercase",
    lineHeight: 20,
  },
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  goalPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginLeft: -4,
  },
  goalPillText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  goalPillValue: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.bold,
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
    // flex: 1,
    borderRadius: 6,
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
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "400",
    textTransform: "uppercase",
  },
  statValueCompleted: {
    color: Colors.light.green,
    fontSize: 22,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  statValueIncomplete: {
    color: Colors.light.yellow,
    fontSize: 22,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  statValueTimeSpent: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  insightsSection: {
    marginTop: 8,
  },
  insightsDottedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: Colors.light.dullestWhite,
    borderStyle: "dashed",
    width: "100%",
    marginBottom: 16,
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
  },
  insightsSubtitleLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  insightsScrollContent: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 20, // Add some padding to the end of the scroll
  },
  insightCardFixed: {
    width: 176,
    flex: 0,
    minWidth: "auto",
  },
});
