import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { AchivementArrowIcon } from "@/assets/icons/AchivementArrowIcon";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  applySadaqahAnalyticsView,
  formatSadaqahAmountLabel,
  getSadaqahPastAchievement,
  type SadaqahAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/sadaqahPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { getGoalById, type GoalId } from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import { InsightCard } from "../InsightCard";
import { SADAQAH_INSIGHT_CARDS } from "./insightCardsData";
import { useGetSadaqahGoalAchievements } from "@/src/api/queries/useGetSadaqahGoalAchievements";
import { resolveSadaqahTypeFromGoalId } from "@/src/utils/sadaqahGoalMap";
import {
  createEmptySadaqahPastAchievement,
  mapSadaqahApiKeyInsightsToCards,
  mapSadaqahGoalAchievementsToUi,
  shiftSadaqahAchievementsPeriodStart,
} from "@/src/utils/sadaqahGoalAchievementsMap";

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

const PERIOD_PHRASE: Record<PastAchievementPeriod, string> = {
  monthly: "Last month",
  threeMonths: "Over the past 3 months",
  sixMonths: "Over the past 6 months",
};

// Category tabs per goal
const VOLUNTEERING_TABS = [
  "All",
  "Distributing Food",
  "Shaping Futures",
  "Offering Compassion",
  "Building Shelters",
];
const SADAQAH_JARIYAH_TABS = [
  "All",
  "Honoring Parents",
  "Sponsoring Orphans",
  "Building Wells",
  "Sustaining Mosques",
  "Teaching Quran",
  "Sheltering Lives",
  "Providing Healthcare",
  "Spreading Knowledge",
  "Providing Clothing",
  "Planting Trees",
];
const LILLAH_TABS = [
  "All",
  "Food Relief",
  "Qurbani for the Poor",
  "Household Essentials",
  "Debt Assistance",
  "Qard Hassan",
];
const ZAKAT_TABS = [
  "All",
  "Zakah al-Mal",
  "Zakah al-Fitr",
];
const KAFFARAH_TABS = [
  "All",
  "Breaking Fast",
  "Breaking Oath",
  "Zihar",
];
const FIDYA_TABS = [
  "All",
  "Missed Fasts",
  "Elderly Exemption",
];

function getTabsForGoal(goalId: GoalId): string[] {
  if (goalId === "sadaqah-volunteering") return VOLUNTEERING_TABS;
  if (goalId === "sadaqah-jariyah") return SADAQAH_JARIYAH_TABS;
  if (goalId === "sadaqah-Lillah") return LILLAH_TABS;
  if (goalId === "sadaqah-zakat") return ZAKAT_TABS;
  if (goalId === "sadaqah-kafarah") return KAFFARAH_TABS;
  if (goalId === "sadaqah-fidya") return FIDYA_TABS;
  return [];
}

export function SadaqahPastAchievements({ goalId, isDetailed = false }: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>("All");
  const [period, setPeriod] = useState<PastAchievementPeriod>("monthly");
  const [apiPeriodStart, setApiPeriodStart] = useState<string | null>(null);

  const isVolunteering = goalId === "sadaqah-volunteering";
  const isFidya = goalId === "sadaqah-fidya";
  const isKaffarah = goalId === "sadaqah-kafarah";
  const isZakat = goalId === "sadaqah-zakat";
  const isLillah = goalId === "sadaqah-Lillah";
  const isJariyah = goalId === "sadaqah-jariyah";
  // For Fidya and Kaffarah: values are plain counts (meals / items), not dollars
  const isCountGoal = isFidya || isKaffarah;
  const sadaqahType = resolveSadaqahTypeFromGoalId(goalId);
  /** Missed Zakat + Kaffarah + Fidya + Lillah + Jariyah + Volunteering past achievements + key insights are API-backed. */
  const useAchievementsApi =
    (isZakat ||
      isKaffarah ||
      isFidya ||
      isLillah ||
      isJariyah ||
      isVolunteering) &&
    !!sadaqahType;

  const [analyticsView, setAnalyticsView] = useState<SadaqahAnalyticsView>(
    "completedVsIncomplete"
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  /** KAFFARAH API filter code: ALL | MEALS | CLOTHING_ITEMS */
  const [kaffarahFilter, setKaffarahFilter] = useState("ALL");
  const goalData = getGoalById(goalId);
  const cleanGoalLabel = goalData?.title || "";

  const tabs = useMemo(() => getTabsForGoal(goalId), [goalId]);

  useEffect(() => {
    setSelectedTab("All");
    setKaffarahFilter("ALL");
  }, [goalId]);

  useEffect(() => {
    setApiPeriodStart(null);
    setKaffarahFilter("ALL");
  }, [period, goalId]);

  const {
    data: achievementsApiData,
    isLoading: isAchievementsLoading,
    isFetching: isAchievementsFetching,
    isError: isAchievementsError,
  } = useGetSadaqahGoalAchievements(sadaqahType, {
    period,
    periodStart: apiPeriodStart,
    filter: isKaffarah ? kaffarahFilter : undefined,
    enabled: useAchievementsApi,
  });

  /** Match prayer: never show mock/previous bars while the API is loading. */
  const showPlaceholders =
    useAchievementsApi &&
    (isAchievementsLoading ||
      isAchievementsFetching ||
      (!achievementsApiData && !isAchievementsError));

  const mappedApi = useMemo(() => {
    if (!useAchievementsApi || !achievementsApiData) return null;
    return mapSadaqahGoalAchievementsToUi(achievementsApiData, period);
  }, [achievementsApiData, period, useAchievementsApi]);

  const currencyCode = mappedApi?.currencyCode ?? null;
  const emptyAchievement = useMemo(
    () => createEmptySadaqahPastAchievement(period),
    [period],
  );

  const kaffarahFilters = useMemo(() => {
    const fromApi = achievementsApiData?.filters;
    if (Array.isArray(fromApi) && fromApi.length > 0) {
      return fromApi.map((item) => ({
        code: String(item.code ?? "")
          .trim()
          .toUpperCase(),
        label: String(item.label ?? item.code ?? "").trim() || "All",
      }));
    }
    return [
      { code: "ALL", label: "All" },
      { code: "MEALS", label: "Meals" },
      { code: "CLOTHING_ITEMS", label: "Clothing Items" },
    ];
  }, [achievementsApiData?.filters]);

  const analyticsTabs = useMemo(() => {
    const fromApi = achievementsApiData?.tabs;
    if (Array.isArray(fromApi) && fromApi.length > 0) {
      return fromApi
        .map((tab) => {
          const key = String(tab.key ?? "")
            .trim()
            .toUpperCase();
          const view: SadaqahAnalyticsView = key.includes("TIME")
            ? "completedVsTimeSpent"
            : "completedVsIncomplete";
          return {
            view,
            label: String(tab.label ?? "").trim() || tab.key,
          };
        })
        .filter(
          (tab, index, list) =>
            list.findIndex((item) => item.view === tab.view) === index,
        );
    }
    return [
      { view: "completedVsIncomplete" as const, label: "Completed vs. Incomplete" },
      { view: "completedVsTimeSpent" as const, label: "Completed vs. Time Spent" },
    ];
  }, [achievementsApiData?.tabs]);

  const studyMaterial = useMemo(() => getGoalById(goalId)?.studyMaterial ?? [], [goalId]);
  const mockKaffarahSubType =
    kaffarahFilter === "MEALS"
      ? "Meals"
      : kaffarahFilter === "CLOTHING_ITEMS"
        ? "Clothing Items"
        : "All";
  const mockAchievementRaw = useMemo(
    () =>
      getSadaqahPastAchievement(
        goalId,
        period,
        isVolunteering,
        isKaffarah ? mockKaffarahSubType : undefined,
      ),
    [goalId, period, isVolunteering, isKaffarah, mockKaffarahSubType],
  );

  // API goals: empty shell while loading — never fall back to mock dummy bars.
  const baseAchievementRaw = useAchievementsApi
    ? showPlaceholders
      ? emptyAchievement
      : (mappedApi?.achievement ?? emptyAchievement)
    : mockAchievementRaw;

  const baseAchievement = useMemo(() => {
    let data = { ...baseAchievementRaw };

    // Category tabs are mock-only until the achievements API supports filters.
    if (!useAchievementsApi && selectedTab !== "All") {
      const multiplier = 0.35 + (selectedTab.length % 5) * 0.1;
      data = {
        ...data,
        achievementPercent: Math.min(100, Math.round(data.achievementPercent * multiplier * 1.5)),
        completedAmount: Math.round(data.completedAmount * multiplier),
        incompleteAmount: Math.round(data.incompleteAmount * multiplier),
        totalTimeSpentMinutes: Math.round(data.totalTimeSpentMinutes * multiplier),
        chartData: data.chartData.map((item: any, idx: number) => {
          const variation = 0.5 + ((idx * 7 + selectedTab.length * 3) % 10) / 10;
          const barMultiplier = multiplier * variation;
          return {
            ...item,
            completedAmount: Math.round(item.completedAmount * barMultiplier),
            incompleteAmount: Math.round(item.incompleteAmount * barMultiplier),
            completedHours: Math.round(item.completedHours * barMultiplier),
            incompleteHours: Math.round(item.incompleteHours * barMultiplier),
            timeSpentMinutes: Math.round(item.timeSpentMinutes * barMultiplier),
          };
        }),
      };
    }
    return data;
  }, [baseAchievementRaw, selectedTab, useAchievementsApi]);

  const achievement = useMemo(
    () => applySadaqahAnalyticsView(baseAchievement, analyticsView, isVolunteering),
    [baseAchievement, analyticsView, isVolunteering]
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, analyticsView, apiPeriodStart, kaffarahFilter]);

  const handleBarPress = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex((prev) => (prev === index ? null : index));
  }, []);

  const canNavigateBack =
    useAchievementsApi &&
    Boolean(mappedApi?.canNavigateBack) &&
    !isAchievementsLoading &&
    !isAchievementsFetching;
  const canNavigateForward =
    useAchievementsApi &&
    Boolean(mappedApi?.canNavigateForward) &&
    !isAchievementsLoading &&
    !isAchievementsFetching;

  const handleNavigateBack = useCallback(() => {
    if (!canNavigateBack || !mappedApi) return;
    const next = shiftSadaqahAchievementsPeriodStart(
      mappedApi.periodStart,
      mappedApi.periodEnd,
      -1,
    );
    if (next) setApiPeriodStart(next);
  }, [canNavigateBack, mappedApi]);

  const handleNavigateForward = useCallback(() => {
    if (!canNavigateForward || !mappedApi) return;
    const next = shiftSadaqahAchievementsPeriodStart(
      mappedApi.periodStart,
      mappedApi.periodEnd,
      1,
    );
    if (next) setApiPeriodStart(next);
  }, [canNavigateForward, mappedApi]);

  const selectedBaseWeek =
    selectedBarIndex !== null
      ? (baseAchievement.chartData[selectedBarIndex] as any)
      : null;

  const displayBaseCompleted =
    selectedBaseWeek?.completedAmount ?? baseAchievement.completedAmount;
  const displayBaseIncomplete =
    selectedBaseWeek?.incompleteAmount ?? baseAchievement.incompleteAmount;
  const displayTimeSpentMinutes =
    selectedBaseWeek?.timeSpentMinutes ?? baseAchievement.totalTimeSpentMinutes;

  const hasLogs = useMemo(() => {
    if (showPlaceholders || !baseAchievement) return false;
    if (
      !isPastAchievementBarEmpty(
        baseAchievement.completedAmount,
        baseAchievement.incompleteAmount,
      )
    ) {
      return true;
    }
    return (baseAchievement.chartData ?? []).some(
      (item: any) =>
        !isPastAchievementBarEmpty(
          item.completedAmount ?? 0,
          item.incompleteAmount ?? 0,
        ),
    );
  }, [baseAchievement, showPlaceholders]);

  const showNoDataDash =
    showPlaceholders ||
    !hasLogs ||
    (useAchievementsApi &&
      (Boolean(mappedApi?.locked) ||
        (isAchievementsError && !mappedApi))) ||
    isPastAchievementBarEmpty(displayBaseCompleted, displayBaseIncomplete);

  const showDetailedStatsChevron = !isDetailed && hasLogs && !showNoDataDash;

  const apiInsightCards = useMemo(() => {
    if (!useAchievementsApi) return [];
    return mapSadaqahApiKeyInsightsToCards(achievementsApiData, {
      period,
      noDataLabel: t("progressLogging.insightNoData"),
      isLoading: showPlaceholders,
    });
  }, [
    achievementsApiData,
    period,
    showPlaceholders,
    t,
    useAchievementsApi,
  ]);

  const renderInsights = () => {
    // Match prayer: show API key-insights on the compact logging screen too
    // (Zakat / Kaffarah / Fidya), not only on detailed statistics.
    if (!isDetailed && !useAchievementsApi) return null;

    const cards = useAchievementsApi
      ? apiInsightCards
      : SADAQAH_INSIGHT_CARDS[goalId]?.[
          period as "monthly" | "threeMonths" | "sixMonths"
        ];
    if (!cards || cards.length === 0) return null;

    const vsLabel =
      mappedApi?.keyInsightsHeader?.trim() ||
      (period === "monthly"
        ? "VS. LAST MONTH"
        : period === "threeMonths"
          ? "VS. LAST 3 MONTHS"
          : "VS. LAST 6 MONTHS");

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>{vsLabel}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          {cards.map((c, i) => (
            <InsightCard key={i} {...c} style={styles.insightCardFixed} />
          ))}
        </ScrollView>
      </View>
    );
  };

  const formatAmount = useCallback(
    (amount: number) =>
      isCountGoal
        ? `${Math.round(amount)}`
        : formatSadaqahAmountLabel(amount, isVolunteering, currencyCode),
    [currencyCode, isCountGoal, isVolunteering],
  );

  const showChartHint = !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent > 0;
  const deltaIsZero = baseAchievement.previousPeriodDeltaPercent === 0;
  const deltaAbs = Math.abs(baseAchievement.previousPeriodDeltaPercent);

  // For "Completed vs. Time Spent" view
  const isTimeSpentView = analyticsView === "completedVsTimeSpent";
  // Approximate time % of the period (treat 720 hrs = 30 day month baseline)
  const timeSpentPercent =
    Math.round((baseAchievement.totalTimeSpentMinutes / (720 * 60)) * 100 * 10) / 10;

  // Top-left metric label switches in time-spent view
  const topMetricLabel = isTimeSpentView
    ? "TIME SPENT"
    : t("progressLogging.achievementsLabel").toUpperCase();
  const topMetricValue = isTimeSpentView
    ? timeSpentPercent
    : baseAchievement.achievementPercent;

  const periodLabel =
    period === "monthly" ? "month" : period === "threeMonths" ? "3M period" : "6M period";

  // Summary sentence
  const renderSummaryText = () => {
    if (!isDetailed || showPlaceholders || showNoDataDash) return null;

    if (analyticsView === "completedByCategory") {
      return (
        <Text style={styles.summaryText}>
          <Text>{PERIOD_PHRASE[period]}, </Text>
          <Text style={styles.summaryBold}>{formatNumber(baseAchievement.achievementPercent)}%</Text>
          <Text> of your {cleanGoalLabel} donations were toward </Text>
          <Text style={styles.summaryBold}>
            {selectedTab === "All" ? "all categories" : selectedTab.toLowerCase()}
          </Text>
          <Text> — </Text>
          <Text style={styles.summaryBold}>{deltaAbs}%</Text>
          <Text> {deltaIsPositive ? "more" : "less"} than the previous {periodLabel}.</Text>
        </Text>
      );
    }

    // Kaffarah-specific summary (mentions API filter)
    const kaffarahSubLabel =
      kaffarahFilter === "MEALS"
        ? "meal "
        : kaffarahFilter === "CLOTHING_ITEMS"
          ? "clothing "
          : "";

    if (isTimeSpentView) {
      const timeStr = formatTotalTime(baseAchievement.totalTimeSpentMinutes / 60);
      const deltaSuffix = deltaIsZero
        ? "— the same amount of time you spent last month."
        : `— ${deltaAbs}% ${deltaIsPositive ? "more" : "less"} time than the previous ${periodLabel}.`;

      let kaffarahGoalText = <Text style={styles.summaryBold}>{kaffarahSubLabel}Kaffarah goal</Text>;
      if (isKaffarah && kaffarahFilter === "MEALS") {
        kaffarahGoalText = <Text style={styles.summaryBold}>meal kaffarah goal not on your goal of donating meals as kaffarah</Text>;
      }

      return (
        <Text style={styles.summaryText}>
          <Text>{PERIOD_PHRASE[period]}, you spent </Text>
          <Text style={styles.summaryBold}>{timeStr}</Text>
          <Text> ({formatNumber(timeSpentPercent)}% of the month) on your </Text>
          {isKaffarah
            ? kaffarahGoalText
            : <Text style={styles.summaryBold}>{cleanGoalLabel}</Text>
          }
          <Text> {isKaffarah ? "" : "goal "}{isKaffarah ? deltaSuffix : deltaSuffix}</Text>
        </Text>
      );
    }

    // completedVsIncomplete (default)
    const deltaCompletedSuffix = deltaIsZero
      ? "— the same as the previous period."
      : `— ${deltaAbs}% ${deltaIsPositive ? "more" : "less"} than the previous ${periodLabel}.`;
    return (
      <Text style={styles.summaryText}>
        <Text>{PERIOD_PHRASE[period]}, you achieved </Text>
        <Text style={styles.summaryBold}>{formatNumber(baseAchievement.achievementPercent)}%</Text>
        {isKaffarah
          ? <Text> of your {kaffarahSubLabel}Kaffarah goal {deltaCompletedSuffix}</Text>
          : <Text> of your {cleanGoalLabel} goal {deltaCompletedSuffix}</Text>
        }
      </Text>
    );
  };

  // Second stat column (right side of stats row)
  const renderSecondStat = () => {
    if (analyticsView === "completedByCategory") return null;
    if (isTimeSpentView) {
      return (
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>TIME SPENT</Text>
          <Text style={styles.statValueIncomplete}>
            {showNoDataDash
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatTotalTime(displayTimeSpentMinutes / 60)}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>INCOMPLETE</Text>
        <Text style={styles.statValueIncomplete}>
          {showNoDataDash
            ? PAST_ACHIEVEMENT_NO_DATA
            : formatAmount(displayBaseIncomplete)}
        </Text>
      </View>
    );
  };

  // Kaffarah GOAL row unit (from selected API filter)
  const kaffarahGoalUnit =
    kaffarahFilter === "MEALS"
      ? "meals"
      : kaffarahFilter === "CLOTHING_ITEMS"
        ? "clothing items"
        : "meals / clothing items";

  return (
    <>
    <View style={styles.section}>
      <View style={styles.card}>
        {/* ── Header row ── */}
        <View style={styles.cardHeader}>
          <AchivementArrowIcon />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements")}
          </Text>
          {showDetailedStatsChevron ? (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(private)/pastachievementdetailedstatistics",
                  params: { goalId },
                })
              }
              style={{ marginLeft: "auto", padding: 4 }}
            >
              <Ionicons name="chevron-forward" size={20} color={Colors.light.white} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── Top: metric + period toggles (match prayer past achievements) ── */}
        <View style={styles.achievementPeriodRow}>
          <View style={styles.achievementBlock}>
            <Text style={styles.achievementCaption}>{topMetricLabel}</Text>
            <View style={styles.achievementPercentRow}>
              <Text style={styles.achievementPercent}>
                {showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(topMetricValue)}
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
        </View>

        <View style={styles.deltaDateRow}>
          <View style={styles.deltaSlot}>
            {!showPlaceholders && !showNoDataDash ? (
              deltaIsZero ? (
                <View style={[styles.deltaBadge, styles.deltaBadgeNeutral]}>
                  <Text style={styles.deltaText}>● 0% previous month</Text>
                </View>
              ) : (
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
                      deltaIsPositive
                        ? Colors.light.green
                        : Colors.light.subtext
                    }
                  />
                  <Text
                    style={[
                      styles.deltaText,
                      !deltaIsPositive && styles.deltaTextNegative,
                    ]}
                    numberOfLines={1}
                  >
                    {deltaAbs}% previous month
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
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : achievement.dateRangeLabel}
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

        {/* ── Summary sentence ── */}
        {renderSummaryText()}

        {/* ── Kaffarah filters from API (ALL / MEALS / CLOTHING_ITEMS) ── */}
        {isKaffarah && (
          <View style={{ marginBottom: 12, flexDirection: "row", gap: 8 }}>
            {kaffarahFilters.map((tab) => {
              const isActive = kaffarahFilter === tab.code;
              return (
                <TouchableOpacity
                  key={tab.code}
                  onPress={() => setKaffarahFilter(tab.code)}
                  style={[
                    styles.categoryTab,
                    isActive
                      ? styles.categoryTabActive
                      : styles.categoryTabInactive,
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 31,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.categoryTabText,
                      isActive
                        ? styles.categoryTabTextActive
                        : styles.categoryTabTextInactive,
                      { textAlign: "center", fontSize: 14 },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── GOAL row – full-width dark box ── */}
        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalValue}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : isVolunteering
                  ? `${baseAchievement.goalAmount} hours`
                  : formatAmount(baseAchievement.goalAmount)}
            </Text>
            {(isFidya || isKaffarah) && (
              <View style={styles.goalUnitPill}>
                <Text style={styles.goalUnitPillText}>
                  {isFidya ? "meals" : kaffarahGoalUnit}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Analytics view toggle (API `tabs` when present) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          style={styles.analyticsToggleScroll}
          contentContainerStyle={styles.analyticsToggle}
        >
          {analyticsTabs.map((tab) => {
            const isActive = analyticsView === tab.view;
            return (
              <Pressable
                key={tab.view}
                onPress={() => setAnalyticsView(tab.view)}
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
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}

          {/* "Completed by Category" — hidden for Fidya, Kaffarah, and Zakat */}
          {!isFidya && !isKaffarah && !isZakat && (
            <Pressable
              onPress={() => {
                setAnalyticsView("completedByCategory");
                setSelectedTab("All");
              }}
              style={[
                styles.analyticsButton,
                analyticsView === "completedByCategory"
                  ? styles.analyticsButtonActive
                  : styles.analyticsButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.analyticsButtonText,
                  analyticsView === "completedByCategory" && styles.analyticsButtonTextActive,
                ]}
              >
                Completed by Category
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* ── Category tabs (only when Completed by Category) ── */}
        {isDetailed && analyticsView === "completedByCategory" && tabs.length > 0 && (
          <View style={styles.categoryTabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsContainer}
            >
              {tabs.map((tab) => {
                const isActive = selectedTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSelectedTab(tab)}
                    style={[
                      styles.categoryTab,
                      isActive ? styles.categoryTabActive : styles.categoryTabInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        isActive ? styles.categoryTabTextActive : styles.categoryTabTextInactive,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>COMPLETED</Text>
            <Text style={styles.statValueCompleted}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatAmount(displayBaseCompleted)}
            </Text>
          </View>
          {renderSecondStat()}
        </View>

        {/* ── Chart ── */}
        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={
              showPlaceholders || showNoDataDash
                ? emptyAchievement.chartData
                : achievement.chartData
            }
            selectedBarIndex={
              isDetailed && !showPlaceholders && !showNoDataDash
                ? selectedBarIndex
                : null
            }
            onBarPress={
              isDetailed && !showPlaceholders && !showNoDataDash
                ? handleBarPress
                : () => {}
            }
            chartKey={`${goalId}-${period}-${analyticsView}-${selectedTab}-${kaffarahFilter}-${showPlaceholders ? "loading" : showNoDataDash ? "empty" : "ready"}`}
            yMax={
              showPlaceholders || showNoDataDash
                ? emptyAchievement.yMax
                : achievement.yMax
            }
            yTicks={
              showPlaceholders || showNoDataDash
                ? emptyAchievement.yTicks
                : achievement.yTicks
            }
            showHint={
              isDetailed &&
              !showPlaceholders &&
              !showNoDataDash &&
              showChartHint
            }
            onDismissHint={() => {
              setHintDismissed(true);
              if (achievement.chartData.length > 0) {
                setSelectedBarIndex(achievement.chartData.length - 1);
              }
            }}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={
              showPlaceholders || showNoDataDash
                ? emptyAchievement.pageCount
                : achievement.pageCount
            }
            activePageIndex={
              selectedBarIndex ?? achievement.activePageIndex
            }
            formatBarValue={(val) =>
              isTimeSpentView
                ? formatTotalTime(val / 60)
                : formatAmount(val)
            }
            isPrayerGoal={true}
            showPagination={
              isDetailed && !showPlaceholders && !showNoDataDash
            }
            showBarLine={false}
          />
        </View>
      </View>
      {renderInsights()}
    </View>

    <PastAchievementStudyMaterial items={studyMaterial} isDetailed={isDetailed} />
    </>
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
    gap: 6,
  },
  sectionTitle: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  achievementPeriodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deltaDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  achievementBlock: {
    alignItems: "flex-start",
    marginTop: 11,
  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
  deltaBadgeNegative: {
    backgroundColor: Colors.light.calendarBg,
  },
  deltaBadgeNeutral: {
    backgroundColor: Colors.light.calendarBg,
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
  deltaTextNegative: {
    color: Colors.light.subtext,
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
    color: Colors.light.grey,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 20,
  },
  summaryBold: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 20,
  },
  // Full-width dark GOAL row
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goalLabel: {
    color: Colors.light.subtext,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  goalValue: {
    color: Colors.light.white,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    fontSize: 22,
  },
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalUnitPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goalUnitPillText: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "400",
  },
  // Analytics toggle — bleed to card edges like prayer past achievements
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
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  analyticsButtonTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  // Category chips
  categoryTabsWrapper: {
    marginHorizontal: -14,
  },
  categoryTabsContainer: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTabActive: {
    backgroundColor: Colors.light.green,
  },
  categoryTabInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  categoryTabText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  categoryTabTextActive: {
    color: Colors.light.background,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  categoryTabTextInactive: {
    color: Colors.light.grey,
  },
  // Stats row
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
  insightsSection: {
    marginTop: 8,
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
    paddingRight: 20,
  },
  /** Match PrayerPastAchievements insight card width. */
  insightCardFixed: {
    width: 176,
    flex: 0,
    minWidth: "auto",
  },
  learnMoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  learnMoreSeeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
