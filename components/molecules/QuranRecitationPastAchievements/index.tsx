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
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
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
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { RecitationPastAchievementProgressSection } from "../QuranHoursPastAchievements/RecitationPastAchievementProgressSection";
import { RecitationSurahBreakdownList } from "../QuranHoursPastAchievements/RecitationSurahBreakdownList";
import { RecitationSurahDetailCard } from "../QuranHoursPastAchievements/RecitationSurahDetailCard";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { SurahProgressStrip } from "../QuranHoursPastAchievements/SurahProgressStrip";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { InsightCard } from "../InsightCard";
import {
  getGoalById,
} from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { TopSpace } from "@/components/atoms/TopSpace";

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

const GOAL_SUMMARY_KEY = "progressLogging.achievementSummaryRecitationSurah";
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

export function QuranRecitationPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
  initialSurahId,
}: QuranRecitationPastAchievementsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
const surahContext = useOptionalRecitationSurahContext();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [analyticsView, setAnalyticsView] =
    useState<RecitationAnalyticsView>(initialAnalyticsView);
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const surahFilters = useMemo(
    () => getPastAchievementSurahFilters(goalId),
    [goalId],
  );

  const [detailedSurahFilter, setDetailedSurahFilter] = useState<SurahFilterId>(
    () => initialSurahId ?? "all",
  );

  const selectedSurahId: SurahFilterId = isDetailed
    ? detailedSurahFilter
    : (surahContext?.activeSurahId ?? initialSurahId ?? "all");
  const refreshKey = surahContext?.refreshKey ?? 0;
  const surahGoal = getActiveRecitationSurahGoal(selectedSurahId);
  const surahDisplayName =
    surahGoal?.surahName ??
    getPastAchievementSurahFilters(goalId).find(
      (filter) => filter.id === selectedSurahId,
    )?.surahName ??
    "";

  const isSurahDrillDown = isDetailed && selectedSurahId !== "all";

  const periodSlice = useMemo(
    () =>
      getQuranRecitationPastAchievementSlice(goalId, period, selectedSurahId),
    [goalId, period, selectedSurahId, refreshKey],
  );

  const hasLogs = useMemo(
    () => hasRecitationPastAchievementLogs(periodSlice),
    [periodSlice],
  );

  const displaySlice = useMemo(
    () =>
      isSurahDrillDown && !hasLogs
        ? zeroOutPeriodSlice(periodSlice)
        : periodSlice,
    [hasLogs, isSurahDrillDown, periodSlice],
  );

  const baseAchievement = useMemo(
    () => getQuranRecitationPastAchievement(goalId, period, selectedSurahId),
    [goalId, period, selectedSurahId, refreshKey],
  );

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

  const showEmptyAchievement = isSurahDrillDown && !hasLogs;
  const showNoDataDash = isPastAchievementBarEmpty(
    displayBaseCompleted,
    displayBaseIncomplete,
  );
  const displayAchievementPercent =
    showEmptyAchievement || showNoDataDash
      ? PAST_ACHIEVEMENT_NO_DATA
      : formatNumber(achievement.achievementPercent);

  const formatStatCount = (value: number) =>
    showEmptyAchievement || showNoDataDash
      ? PAST_ACHIEVEMENT_NO_DATA
      : formatGoalRecitationsLabel(value);

  const showChartHint =
    isDetailed && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

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
        <View style={styles.insightsPairRow}>
          {insightCards.map((card) => (
            <InsightCard
              key={card.title}
              iconName={card.iconName}
              title={card.title}
              value={card.value}
              subValue={card.subValue}
              style={styles.insightCardHalf}
            />
          ))}
        </View>
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
            <MaterialCommunityIcons
              name={isDetailed ? "trending-up" : "trophy-outline"}
              size={isDetailed ? 19 : 16}
              color={isDetailed ? Colors.light.subtext : Colors.light.white}
            />
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
          {isSurahDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.recitationDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                surah: surahDisplayName,
              })}
            </Text>
          ) : null}
        </View>

        <View style={isDetailed ? styles.topRow : styles.compactTopRow}>
          <View style={[styles.achievementBlock]}>
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
              {displayAchievementPercent}
              {!showEmptyAchievement ? (
                <Text
                  style={[
                    styles.achievementPercentSymbol,
                    isDetailed && styles.achievementPercentSymbolDetailed,
                  ]}
                >
                  %
                </Text>
              ) : null}
            </Text>
            {!showEmptyAchievement ? (
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
                    deltaIsPositive ? Colors.light.green : Colors.light.subtext
                  }
                />
                <Text
                  style={[
                    styles.deltaText,
                    !deltaIsPositive && styles.deltaTextNegative,
                  ]}
                >
                  {deltaIsPositive ? "+" : ""}
                  {formatNumber(
                    baseAchievement.previousPeriodDeltaPercent,
                  )}% {t(PERIOD_DELTA_LABEL_KEYS[period])}
                </Text>
              </View>
            ) : null}
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
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-back"
                  size={isDetailed ? 24 : 14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {achievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={isDetailed ? 24 : 14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isDetailed ? (
          <>
            {renderDetailedSummary()}

            {renderSurahFilterTabs()}
          </>
        ) : (
          <Text style={styles.summaryText}>
            {t(GOAL_SUMMARY_KEY, {
              percent: formatNumber(baseAchievement.achievementPercent),
              delta: formatNumber(baseAchievement.previousPeriodDeltaPercent),
            })}
          </Text>
        )}

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
                styles.goalValueRow,
                isSurahDrillDown && styles.goalValueRowDrillDown,
              ]}
            >
              <View style={styles.goalValueBlock}>
                <Text style={styles.goalPillValue}>
                  {showEmptyAchievement || showNoDataDash
                    ? PAST_ACHIEVEMENT_NO_DATA
                    : formatNumber(displayGoalTotal)}
                </Text>
                {selectedSurahId === "all" ? (
                  <View style={styles.goalPill}>
                    <Text style={styles.goalPillText}>{t(UNIT_LABEL_KEY)}</Text>
                  </View>
                ) : surahGoalUnitKey ? (
                  <View style={styles.goalPill}>
                    <Text style={styles.goalPillText}>
                      {t(surahGoalUnitKey)}
                    </Text>
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={styles.goalPillValue}>
                {showEmptyAchievement || showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(baseAchievement.goalHours)}{" "}
              </Text>
              <View style={styles.goalPill}>
                <Text style={styles.goalPillText}>{t(UNIT_LABEL_KEY)}</Text>
              </View>
            </View>
          )}
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

        {isDetailed ? (
          <RecitationPastAchievementProgressSection
            analyticsView={analyticsView}
            completed={displayBaseCompleted}
            incomplete={displayBaseIncomplete}
            totalTimeMinutes={selectedPeriodTimeSpentMinutes}
            longestStreak={periodSlice.longestStreak}
            formatCount={formatStatCount}
            formatTimeChip={(minutes) =>
              showEmptyAchievement || showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatRecitationTimeSpentChip(minutes)
            }
            completedLabel={t("progressLogging.completed")}
            incompleteLabel={t("progressLogging.incomplete")}
            timeSpentLabel={t("progressLogging.timeSpentLabel")}
            streakLabel={t("progressLogging.daysLabel")}
            showStreak={period !== "monthly" && !isSurahDrillDown}
          />
        ) : null}

        {!isDetailed ? (
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>
                {t("progressLogging.completed")}
              </Text>
              <Text style={styles.statValueCompleted}>
                {formatStatCount(displayBaseCompleted)}
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
                    ? styles.statValueTimeSpent
                    : styles.statValueIncomplete
                }
              >
                {analyticsView === "completedVsTimeSpent"
                  ? showEmptyAchievement || showNoDataDash
                    ? PAST_ACHIEVEMENT_NO_DATA
                    : formatRecitationTimeSpentLabel(
                        selectedPeriodTimeSpentMinutes,
                      )
                  : formatStatCount(displayBaseIncomplete)}
              </Text>
            </View>
          </View>
        ) : null}
        {isDetailed && isSurahDrillDown && !hasLogs ? (
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
            chartData={chartAchievement.chartData}
            selectedBarIndex={isDetailed ? selectedBarIndex : null}
            onBarPress={isDetailed ? handleBarPress : () => {}}
            chartKey={`${goalId}-${period}-${selectedSurahId}-${analyticsView}-period`}
            yMax={chartAchievement.yMax}
            yTicks={chartAchievement.yTicks}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={chartAchievement.pageCount}
            activePageIndex={
              selectedBarIndex ?? chartAchievement.activePageIndex
            }
            formatBarValue={chartFormatBarValue}
            showPagination={isDetailed}
            barColors={
              analyticsView === "completedVsTimeSpent"
                ? [Colors.light.green, Colors.light.green]
                : [Colors.light.green, INCOMPLETE_BAR_COLOR]
            }
          />
        </View>

        {isDetailed ? (
          <GraphBarSelectionFooter
            visible={selectedBarIndex !== null}
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
  compactTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cardHeaderBlock: {
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  drillDownHeader: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  goalInfoLabel: {
    color: Colors.light.white,
    fontSize: 18,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  surahContextLabel: {
    color: Colors.light.lightblue,
    fontSize: 15,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  detailedSubheader: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  achievementProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
  },
  achievementProgressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.light.green,
  },
  timeMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  timeMetricItem: {
    flex: 1,
    gap: 2,
  },
  timeMetricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  timeMetricDotGreen: {
    backgroundColor: Colors.light.green,
  },
  timeMetricDotWarning: {
    backgroundColor: Colors.light.golden,
  },
  timeMetricLabel: {
    color: Colors.light.subtext,
    fontSize: 9,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  timeMetricValue: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  timeMetricBadge: {
    flex: 1.2,
    borderRadius: 8,
    backgroundColor: Colors.light.lightgreen,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    gap: 2,
  },
  timeMetricBadgeLabel: {
    color: Colors.light.green,
    fontSize: 9,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  timeMetricBadgeValue: {
    color: Colors.light.green,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  insightsPairRow: {
    flexDirection: "row",
    gap: 10,
  },
  insightCardHalf: {
    flex: 1,
    minWidth: 0,
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
  achievementCaptionDetailed: {
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
  },
  achievementPercentDetailed: {
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    textTransform: "uppercase",
  },
  achievementPercentSymbolDetailed: {
    fontSize: 16,
  },
  deltaBadgeNegative: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  deltaTextNegative: {
    color: Colors.light.subtext,
  },
  goalAyahValue: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.light.blackBackground,
  },
  emptyStateTitle: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyStateText: {
    color: Colors.light.subtext,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 17,
    textAlign: "center",
  },
  emptyStateInline: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  summaryBold: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 20,
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
  },
  insightCardFixed: {
    width: 160,
    minWidth: 160,
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
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 40,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 44,
  },
  achievementPercentSymbol: {
    fontSize: 22,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.lightgreen,
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
    flexShrink: 0,
  },
  periodButton: {
    borderRadius: 5,
    paddingHorizontal: 23,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: "center",
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
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 20,
  },
  surahTabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  surahTab: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.blackBackground,
  },
  surahTabActive: {
    backgroundColor: Colors.light.green,
    borderWidth: 1,
    borderColor: Colors.light.green,
  },
  surahTabInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  surahTabText: {
    color: Colors.light.grey,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  surahTabTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
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
  goalProgressStripWrap: {
    flex: 1,
    minWidth: 80,
    maxWidth: 140,
  },
  weekBackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  weekBackText: {
    color: Colors.light.lightblue,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  goalLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
  goalProgressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
  },
  goalProgressCompleted: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: Colors.light.green,
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
